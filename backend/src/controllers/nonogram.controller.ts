import { Request, Response } from "express";
import { Category, NonogramModel } from "../models/nonogram.model";
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

    const nonograms = await NonogramModel.find(filter).select("-__v");
    res.json(nonograms);
  } catch (error) {
    console.error("Error creating nonogram:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNonograms = async (req: Request, res: Response) => {
  try {
    const { name, width, height, category } = req.query;

    const filter: any = {};
    if (name) filter.name = { $regex: name as string, $options: "i" };
    if (width) filter.width = Number(width);
    if (height) filter.height = Number(height);
    if (category) filter.category = category as Category;

    const nonograms = await NonogramModel.find(filter).select("-__v");
    res.json(nonograms);
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
