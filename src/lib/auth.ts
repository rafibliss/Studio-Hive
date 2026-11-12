import { betterAuth, type BetterAuthOptions } from "better-auth";
import { jwt } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { Db, MongoClient } from "mongodb";

/**
 * Cache the MongoClient across dev hot-reloads so we don't open a new
 * connection pool on every module re-evaluation. Created lazily so the
 * module can be imported during build without MONGODB_URI configured.
 */
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
  // Must be reachable by the browser for OAuth callbacks and cookie settings.
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
  // Allow the Express API origin (redirects/CORS) and common dev hosts, so
  // sign-in POSTs pass the origin check no matter which host the app is
  // browsed from (localhost, 127.0.0.1, etc.).
  trustedOrigins: [
    ...(process.env.NODE_ENV !== "production"
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : []),
    ...(process.env.NEXT_PUBLIC_API_URL
      ? [process.env.NEXT_PUBLIC_API_URL]
      : []),
  ].filter(Boolean),
  plugins: [
    // Issues JWTs (GET /api/auth/token) verifiable against GET /api/auth/jwks
    // by our external Express API.
    jwt(),
  ],
});
