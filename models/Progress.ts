import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { CompletedLine } from "@/types";

export interface IProgressDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subtitleFileId: Types.ObjectId;
  currentLineIndex: number;
  completedLines: CompletedLine[];
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompletedLineSchema = new Schema<CompletedLine>(
  {
    lineIndex: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 },
    attempts: { type: Number, default: 1 },
  },
  { _id: false }
);

const ProgressSchema = new Schema<IProgressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subtitleFileId: {
      type: Schema.Types.ObjectId,
      ref: "SubtitleFile",
      required: true,
      index: true,
    },
    currentLineIndex: { type: Number, default: 0 },
    completedLines: [CompletedLineSchema],
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, subtitleFileId: 1 }, { unique: true });

const Progress: Model<IProgressDocument> =
  mongoose.models.Progress ||
  mongoose.model<IProgressDocument>("Progress", ProgressSchema);

export default Progress;
