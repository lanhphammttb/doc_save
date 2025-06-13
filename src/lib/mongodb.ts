import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  try {
    const mongoClient = await clientPromise;
    // Ping the server to check connection
    await mongoClient.db(process.env.MONGODB_DB || 'docsave').command({ ping: 1 });
    const db = mongoClient.db(process.env.MONGODB_DB || 'docsave');
    return { client: mongoClient, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Try to reconnect if connection failed
    const newClient = new MongoClient(uri, options);
    const newClientPromise = newClient.connect();
    const mongoClient = await newClientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB || 'docsave');
    return { client: mongoClient, db };
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
