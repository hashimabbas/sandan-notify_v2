import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("notify_app");

    console.log("API endpoint hit for user deletion");

    // Extract the user id from the request body or query parameters
    const { id } = await req.json(); // Assuming you send the user id in the body

    if (!id) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    // Convert the string id to a MongoDB ObjectId
    const objectId = new ObjectId(id);

    // Perform the deletion in the MongoDB collection
    const result = await db.collection('users').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully." }, { status: 200 });

  } catch (error) {
    console.error("Error while deleting user:", error);
    return NextResponse.json({ message: "Error occurred while deleting the user." }, { status: 500 });
  }
}
