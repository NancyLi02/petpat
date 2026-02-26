import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import path from "path";

const DOG_IMAGE_DIR = path.join(
  process.cwd(),
  "app",
  "calculator",
  "dog image"
);

export async function GET() {
  try {
    const files = readdirSync(DOG_IMAGE_DIR);
    const images = files
      .filter((f) => /\.(png|jpg|jpeg|webp|gif)$/i.test(f))
      .sort();
    return NextResponse.json({ images });
  } catch (err) {
    console.error("Failed to read dog images:", err);
    return NextResponse.json(
      { images: [] },
      { status: 500 }
    );
  }
}
