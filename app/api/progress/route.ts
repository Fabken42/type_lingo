import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import SubtitleFile from "@/models/SubtitleFile";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subtitleFileId = searchParams.get("subtitleFileId");

  if (!subtitleFileId) {
    return NextResponse.json({ error: "subtitleFileId obrigatório" }, { status: 400 });
  }

  try {
    await connectDB();

    const progress = await Progress.findOne({
      userId: session.user.id,
      subtitleFileId,
    }).lean();

    return NextResponse.json({ progress: progress ?? null });
  } catch (err) {
    console.error("[PROGRESS GET ERROR]", err);
    return NextResponse.json({ error: "Erro ao buscar progresso" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subtitleFileId, currentLineIndex } = body as {
      subtitleFileId: string;
      currentLineIndex: number;
    };

    if (!subtitleFileId || currentLineIndex === undefined) {
      return NextResponse.json(
        { error: "subtitleFileId e currentLineIndex são obrigatórios" },
        { status: 400 }
      );
    }

    if (typeof currentLineIndex !== "number" || currentLineIndex < 0) {
      return NextResponse.json({ error: "currentLineIndex inválido" }, { status: 400 });
    }

    await connectDB();

    // Verify ownership
    const file = await SubtitleFile.findOne({
      _id: subtitleFileId,
      userId: session.user.id,
    });
    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: session.user.id, subtitleFileId },
      {
        $set: { currentLineIndex, lastAccessedAt: new Date() },
        $setOnInsert: { completedLines: [] },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ progress });
  } catch (err) {
    console.error("[PROGRESS POST ERROR]", err);
    return NextResponse.json({ error: "Erro ao salvar progresso" }, { status: 500 });
  }
}
