import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.atlasURI || "";

const client = new MongoClient(connectionString);

let conn;

try {
    conn  = await client.connect();
} catch (error) {
    console.error(error);
}

let db = conn.db("sample_training");

export default db;