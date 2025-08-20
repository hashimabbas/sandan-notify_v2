// lib/auth.ts or wherever you want to place this function
import clientPromise from '@/app/lib/mongodb'; // Adjust the path based on your project structure
import { MongoClient } from 'mongodb';

export async function getUserFromDb(email: string, pwHash: string) {
  const client: MongoClient = await clientPromise;
  var bcrypt = require('bcryptjs');
  const db = client.db();
  
  // Find the user by email
  const user = await db.collection('users').findOne({ email });

  if (user) {
    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(pwHash, user.password);
    if (isPasswordValid) {
      return {
        id: user._id,
        email: user.email,
        name: user.name, // Add more user fields as needed
      };
    }
  }
  return null;
}
