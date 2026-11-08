import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("StudioSpace");

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
    }),
    emailAndPassword: {
        enabled: true,
    },
    // Google OAuth sign-in — the shared `authClient.signIn.social({ provider: "google" })`
    // button only works once GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are in .env
    // (better-auth serves the /api/auth/sign-in/social route automatically).
    // Spread-guarded so the app still boots cleanly without the keys.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
              socialProviders: {
                  google: {
                      clientId: process.env.GOOGLE_CLIENT_ID,
                      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                  },
              },
          }
        : {}),
});