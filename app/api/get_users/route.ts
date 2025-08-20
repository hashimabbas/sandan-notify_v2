// /pages/api/users.ts
import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("notify_app");
    const data = await db.collection("users").find({}).toArray();
    return NextResponse.json(data);
  } catch (e) {
    console.error("Error fetching data:", e);
    return NextResponse.error(); // Return a generic error response
  }
}
