import { Types } from "mongoose";

export interface ParsedLine {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
  words: string[];
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubtitleFile {
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

export interface CompletedLine {
  lineIndex: number;
  completedAt: Date;
  timeSpent: number;
  attempts: number;
}

export interface IProgress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subtitleFileId: Types.ObjectId;
  currentLineIndex: number;
  completedLines: CompletedLine[];
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubtitleFileWithProgress extends ISubtitleFile {
  progress?: IProgress;
}

export interface WordState {
  word: string;
  status: "correct" | "incorrect" | "current" | "pending";
}
