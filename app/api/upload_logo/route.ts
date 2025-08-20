// app/api/upload_logo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import dbConnect from '@/lib/dbConnect';
import Logo, { ILogo } from '@/app/models/Logo';

// Configure Multer storage in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

const uploadMiddleware = upload.single('logo');

// Convert multer middleware to a Promise-based function
const runMiddleware = (req: NextRequest, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(result);
    });
  });
};

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // Apply the upload middleware to the request
    await runMiddleware(req, res, uploadMiddleware);

    await dbConnect(); // Connect to the database

    const { file } = (req as any); // Get the uploaded file from the request

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    const { buffer, originalname, mimetype } = file;

    // Check if a logo already exists and delete it
    const existingLogo: ILogo | null = await Logo.findOne();
    if (existingLogo) {
      await existingLogo.deleteOne();
    }

    // Save new logo in the database
    const logo = new Logo({
      name: originalname,
      data: buffer,
      contentType: mimetype,
    });

    await logo.save();
    return NextResponse.json({ message: 'Logo uploaded successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// Configure the API route to disable body parsing as multer handles file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
