import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("StudioSpace");
export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
    }),
    trustedOrigins: ['http://localhost:3000'],
    emailAndPassword: {
        enabled: true,
    },
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