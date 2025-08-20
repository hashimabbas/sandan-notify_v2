// lib/mongodb.js

import { MongoClient } from 'mongodb';

let client;
let clientPromise;

const uri = process.env.MONGODB_URI; // MongoDB connection string

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

// Ensure the MongoDB client is reused in development to prevent too many open connections
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
