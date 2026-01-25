import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  // Await params if necessary in future Next.js versions, but for now it's direct.
  // Ideally, decodeURIComponent just in case
  const filename = decodeURIComponent(params.filename);
  const tempDir = path.join(process.cwd(), "temp_invoices");
  const filePath = path.join(tempDir, filename);

  console.log(`Attempting to download file: ${filePath}`);

  try {
    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
