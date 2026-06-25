import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ParsedLine } from "@/types";

export interface ISubtitleFileDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fileName: string;
  originalName: string;
  content: string;
  parsedLines: ParsedLine[];
  totalLines: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParsedLineSchema = new Schema<ParsedLine>(
  {
    index: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    text: { type: String, required: true },
    words: [{ type: String }],
  },
  { _id: false }
);

const SubtitleFileSchema = new Schema<ISubtitleFileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    content: { type: String, required: true },
    parsedLines: [ParsedLineSchema],
    totalLines: { type: Number, required: true, default: 0 },
    language: { type: String, default: "unknown" },
  },
  { timestamps: true }
);

const SubtitleFile: Model<ISubtitleFileDocument> =
  mongoose.models.SubtitleFile ||
  mongoose.model<ISubtitleFileDocument>("SubtitleFile", SubtitleFileSchema);

export default SubtitleFile;
