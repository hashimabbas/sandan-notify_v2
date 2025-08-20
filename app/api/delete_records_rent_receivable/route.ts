import { NextResponse } from 'next/server';
import clientPromise from "@/app/lib/mongodb"; // Adjust the import path if needed

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('notify_app');

    const { contacts } = await request.json(); // Parse JSON from the request body

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }

    // Use the correct collection name
    await db.collection("sheet_details_rent_receivables").deleteMany({
      Contact: { $in: contacts },
    });

    return NextResponse.json({ message: "Records deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting records:", error);
    return NextResponse.json({ message: "Error deleting records." }, { status: 500 });
  }
}

// Other handlers can be added if needed, e.g. GET, POST, etc.
