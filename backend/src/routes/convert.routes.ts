import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { Request, Response } from "express";

const convertRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

convertRouter.post(
  "/convert",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).send("No image uploaded");
      }

      const size = parseInt(req.body.size) || 20;
      const isInversed = req.body.isInversed === "true";
      const threshold = 210;

      const image = sharp(req.file.buffer);

      // Обработка изображения
      const buffer = await image
        .resize({ width: size, height: size, fit: "cover" })
        .flatten({ background: "#FFFFFF" })
        .grayscale()
        .raw()
        .toBuffer();

      const convertedBuffer = buffer.map((value) =>
        value < threshold ? (isInversed ? 0 : 1) : isInversed ? 1 : 0
      );

      const result = [];
      for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) {
          row.push(convertedBuffer[y * size + x]);
        }
        result.push(row);
      }

      res.json({ matrix: result });
    } catch (err) {
      console.error(err);
      res.status(500).send("Image processing failed");
    }
  }
);

export default convertRouter;
