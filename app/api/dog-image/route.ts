import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";

const DOG_IMAGE_DIR = path.join(
  process.cwd(),
  "app",
  "calculator",
  "dog image"
);

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  const ext = path.extname(name).toLowerCase();
  if (!MIME[ext]) {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }
  const filePath = path.join(DOG_IMAGE_DIR, name);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const buffer = readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Failed to serve dog image:", err);
    return NextResponse.json(
      { error: "Failed to read file" },
      { status: 500 }
    );
  }
}
