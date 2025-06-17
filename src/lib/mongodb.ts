import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
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

    // Check if client is connected
    if (!mongoClient.topology?.isConnected()) {
      console.log('MongoDB client not connected, reconnecting...');
      await mongoClient.connect();
    }

    const db = mongoClient.db(process.env.MONGODB_DB || 'docsave');

    // Test the connection with a simple command
    try {
      await db.command({ ping: 1 });
    } catch (pingError) {
      console.error('Ping failed, reconnecting...', pingError);
      // If ping fails, try to reconnect
      await mongoClient.close();
      const newClient = new MongoClient(uri, options);
      const newClientPromise = newClient.connect();
      const newMongoClient = await newClientPromise;
      const newDb = newMongoClient.db(process.env.MONGODB_DB || 'docsave');
      return { client: newMongoClient, db: newDb };
    }

    return { client: mongoClient, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Try to create a new connection if all else fails
    try {
      const newClient = new MongoClient(uri, options);
      const newClientPromise = newClient.connect();
      const mongoClient = await newClientPromise;
      const db = mongoClient.db(process.env.MONGODB_DB || 'docsave');
      return { client: mongoClient, db };
    } catch (reconnectError) {
      console.error('Failed to reconnect to MongoDB:', reconnectError);
      throw new Error('Unable to connect to database');
    }
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
