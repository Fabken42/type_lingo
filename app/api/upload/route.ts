import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { parseSRT, validateSRT } from "@/lib/srtParser";
import SubtitleFile from "@/models/SubtitleFile";
import User from "@/models/User";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".srt")) {
      return NextResponse.json({ error: "Apenas arquivos .srt são suportados" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Arquivo muito grande (máx: 5MB)" }, { status: 400 });
    }

    const content = await file.text();

    if (!validateSRT(content)) {
      return NextResponse.json({ error: "Arquivo .srt inválido ou vazio" }, { status: 400 });
    }

    const parsedLines = parseSRT(content);

    if (parsedLines.length === 0) {
      return NextResponse.json(
        { error: "Não foi possível extrair diálogos do arquivo" },
        { status: 400 }
      );
    }

    await connectDB();

    const dbUser = await User.findById(session.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const subtitleFile = await SubtitleFile.create({
      userId: session.user.id,
      fileName: file.name.replace(/\.srt$/i, ""),
      originalName: file.name,
      content,
      parsedLines,
      totalLines: parsedLines.length,
      language: "unknown",
    });

    return NextResponse.json(
      {
        message: "Arquivo enviado com sucesso",
        file: {
          _id: subtitleFile._id,
          fileName: subtitleFile.fileName,
          originalName: subtitleFile.originalName,
          totalLines: subtitleFile.totalLines,
          createdAt: subtitleFile.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[UPLOAD ERROR]", err);
    return NextResponse.json({ error: "Erro interno ao processar arquivo" }, { status: 500 });
  }
}
