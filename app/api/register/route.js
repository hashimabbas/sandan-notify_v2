import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("notify_app");

    console.log("API endpoint hit for user registration");

    // Extract data from the request body
    const { username, email, password, isAdmin } = await req.json();

    // Check if the user already exists in the database
    const exists = await db.collection('users').findOne({ $or: [{ email }, { username }] });

    if (exists) {
      return NextResponse.json({ message: "Username or email already exists." }, { status: 400 });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user and store in the database
    await db.collection('users').insertOne({
      username,
      email,
      password: hashedPassword,
      isAdmin,
    });

    return NextResponse.json({ message: "User registered successfully." }, { status: 200 });

  } catch (error) {
    console.error("Error while registering user:", error);
    return NextResponse.json({ message: "Error occurred while registering the user" }, { status: 500 });
  }
}
