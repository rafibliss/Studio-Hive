import { betterAuth, type BetterAuthOptions } from "better-auth";
import { jwt } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { Db, MongoClient } from "mongodb";


const globalForAuth = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoDb?: Db;
};

function getMongoDb(): { client: MongoClient; db: Db } {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env (MongoDB Atlas connection string)."
    );
  }
  const client = (globalForAuth.mongoClient ??= new MongoClient(uri));
  const db = (globalForAuth.mongoDb ??= client.db(
    process.env.MONGODB_DB ?? "StudioSpace"
  ));
  return { client, db };
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: (options: BetterAuthOptions) => {
    const { client, db } = getMongoDb();
    return mongodbAdapter(db, { client })(options);
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV !== "production"
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : []),
    ...(process.env.NEXT_PUBLIC_API_URL
      ? [process.env.NEXT_PUBLIC_API_URL]
      : []),
  ].filter(Boolean),
  plugins: [
    jwt(),
  ],
});
