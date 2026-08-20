import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

// STRIPE_KEY is a real credential and must never be committed. Supply it via the
// environment, or a git-ignored payments/.env.test file:  STRIPE_KEY=sk_test_...
if (!process.env.STRIPE_KEY) {
  const candidates = [
    path.resolve(process.cwd(), '.env.test'),
    path.resolve(process.cwd(), 'payments/.env.test'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const line = fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith('STRIPE_KEY='));
    if (line) {
      process.env.STRIPE_KEY = line.trim().slice('STRIPE_KEY='.length).trim();
      break;
    }
  }
}

if (!process.env.STRIPE_KEY) {
  throw new Error(
    'STRIPE_KEY is not set. Add it to payments/.env.test (git-ignored) or export it before running tests.',
  );
}

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};
