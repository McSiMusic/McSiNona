import { Request, Response } from "express";
import {
  Category,
  INonogramMeta,
  NonogramModel,
} from "../models/nonogram.model";
import { escapeRegExp } from "lodash";

interface NonogramFilter {
  name?: { $regex: string };
  width?: number;
  height?: number;
  category?: Category;
}

function isCategory(value: unknown): value is Category {
  const categories: Category[] = [
    "hero",
    "icon",
    "cartoon",
    "pattern",
    "nature",
    "games",
    "animals",
    "space",
    "other",
  ];
  return typeof value === "string" && categories.includes(value as Category);
}

export const createNonogram = async (req: Request, res: Response) => {
  try {
    const { nonogram, name, width, height, category } = req.body as Omit<
      INonogramMeta,
      "id"
    >;

    if (!nonogram || !name || !width || !height || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newNonogram = await NonogramModel.create({
      nonogram,
      name,
      width,
      height,
      category,
    });

    res.status(201).json(newNonogram);
  } catch (error) {
    console.error("Error creating nonogram:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNonograms = async (req: Request, res: Response) => {
  try {
    const { name, width, height, category } = req.query;

    const filter: NonogramFilter = {};

    if (name && typeof name === "string") {
      filter.name = { $regex: escapeRegExp(name) }; // Поиск по подстроке
    }

    if (width && !isNaN(Number(width))) {
      filter.width = Number(width);
    }

    if (height && !isNaN(Number(height))) {
      filter.height = Number(height);
    }

    if (category && isCategory(category)) {
      filter.category = category;
    }

    const nonograms = await NonogramModel.find(filter)
      .select("-__v -nonogram")
      .lean();

    const transformed = nonograms.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));

    res.json(transformed);
  } catch (error) {
    console.error("Error fetching nonograms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNonograms = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Array of IDs is required" });
    }

    const result = await NonogramModel.deleteMany({ _id: { $in: ids } });
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting nonograms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNonogramById = async (req: Request, res: Response) => {
  try {
    const nonogram = await NonogramModel.findById(req.params.id)
      .select("-__v")
      .lean();

    if (!nonogram) {
      return res.status(404).json({ message: "Nonogram not found" });
    }

    const { _id, ...rest } = nonogram;
    res.json({
      id: _id.toString(),
      ...rest,
    });
  } catch (error) {
    console.error("Error fetching nonogram:", error);
    res.status(500).json({ message: "Server error" });
  }
};
