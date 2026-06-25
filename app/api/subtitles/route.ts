import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SubtitleFile from "@/models/SubtitleFile";
import Progress from "@/models/Progress";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    await connectDB();

    const files = await SubtitleFile.find({ userId: session.user.id })
      .select("-content -parsedLines")
      .sort({ createdAt: -1 })
      .lean();

    const fileIds = files.map((f) => f._id);
    const progresses = await Progress.find({
      userId: session.user.id,
      subtitleFileId: { $in: fileIds },
    })
      .select("subtitleFileId currentLineIndex")
      .lean();

    const progressMap = new Map(
      progresses.map((p) => [p.subtitleFileId.toString(), p])
    );

    const filesWithProgress = files.map((f) => ({
      ...f,
      progress: progressMap.get(f._id.toString()) ?? null,
    }));

    return NextResponse.json({ files: filesWithProgress });
  } catch (err) {
    console.error("[SUBTITLES GET ERROR]", err);
    return NextResponse.json({ error: "Erro ao buscar arquivos" }, { status: 500 });
  }
}
