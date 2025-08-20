import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

// PUT request to update user details
export async function PUT(req) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("notify_app");

    console.log("API endpoint hit for user update");

    // Extract data from the request body
    const { _id, username, email, password, isAdmin } = await req.json();

    // Validate if `id` is provided
    if (!_id) {
      return NextResponse.json(
        { message: "User ID is required." },
        { status: 400 }
      );
    }

    // Check if `id` is a valid ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json(
        { message: "Invalid User ID format." },
        { status: 400 }
      );
    }

    // Convert the `id` to MongoDB ObjectId
    const objectId = new ObjectId(_id);

    // Hash the password if it was provided (optional)
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    console.log("hashpassword" + hashedPassword);
    // Prepare the fields to update
    const updatedUser = {
      ...(username && { username }), // Only add field if it's provided
      ...(email && { email }),
      ...(hashedPassword && { password: hashedPassword }), // Use hashed password if provided
      ...(typeof isAdmin !== "undefined" && { isAdmin }), // Handle the admin status
    };

    // Check if there's anything to update
    if (Object.keys(updatedUser).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    // Perform the update in the MongoDB collection
    const result = await db.collection("users").updateOne(
      { _id: objectId }, // Find user by ObjectId
      { $set: updatedUser } // Update the user fields
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "User not found or no changes made." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while updating user:", error);
    return NextResponse.json(
      { message: "Error occurred while updating the user." },
      { status: 500 }
    );
  }
}
