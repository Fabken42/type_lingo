import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SubtitleFile from "@/models/SubtitleFile";
import Progress from "@/models/Progress";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await connectDB();

    const file = await SubtitleFile.findOne({
      _id: params.id,
      userId: session.user.id,
    }).lean();

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    const progress = await Progress.findOne({
      userId: session.user.id,
      subtitleFileId: params.id,
    }).lean();

    return NextResponse.json({ file, progress: progress ?? null });
  } catch (err) {
    console.error("[SUBTITLE GET ERROR]", err);
    return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await connectDB();

    const file = await SubtitleFile.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    await SubtitleFile.deleteOne({ _id: params.id });
    await Progress.deleteMany({ subtitleFileId: params.id, userId: session.user.id });

    return NextResponse.json({ message: "Arquivo deletado com sucesso" });
  } catch (err) {
    console.error("[SUBTITLE DELETE ERROR]", err);
    return NextResponse.json({ error: "Erro ao deletar arquivo" }, { status: 500 });
  }
}
