import { Schema, model, Document } from "mongoose";

export type Category =
  | "hero"
  | "icon"
  | "cartoon"
  | "pattern"
  | "nature"
  | "games"
  | "animals"
  | "space"
  | "other";

export interface INonogram {
  vertical: number[][];
  horizontal: number[][];
}

export interface INonogramMeta {
  nonogram: INonogram;
  name: string;
  width: number;
  height: number;
  category: Category;
}

export interface INonogramDocument extends INonogramMeta, Document {
  createdAt: Date;
  updatedAt: Date;
}

const NonogramSchema = new Schema<INonogramDocument>(
  {
    nonogram: {
      vertical: { type: [[Number]], required: true },
      horizontal: { type: [[Number]], required: true },
    },
    name: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "hero",
        "icon",
        "cartoon",
        "pattern",
        "nature",
        "games",
        "animals",
        "space",
        "other",
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const NonogramModel = model<INonogramDocument>(
  "Nonogram",
  NonogramSchema
);
