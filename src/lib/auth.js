import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { jwt } from "better-auth/plugins/jwt";
import { jwt } from "better-auth/plugins";
import { tr } from "zod/v4/locales";

const client = new MongoClient(process.env.MONOGODB_URI);
const db = client.db(process.env.AUTH_DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    create: {
      before: async (user, ctx) => {
        // Parse role from the callbackURL
        const callbackURL = ctx?.request?.url || "";
        const url = new URL(callbackURL, "http://localhost:3000");
        const role = url.searchParams.get("role") || "user";

        return {
          data: {
            ...user,
            role,
            isBlock: false,
            img: user.image || "",
            userInfo: "{}",
            vendorInfo: "{}",
          },
        };
      },
    },
  additionalFields: {
    role: {
      type: "string",
      defaultValue: "user",
    },
    isBlock: {
      type: "boolean",
      defaultValue: false,
    },
    img: {
      type: "string",
      defaultValue: "",
    },
    userInfo: {
      type: "string",
      required: false,
      defaultValue: "{}",
    },
    vendorInfo: {
      type: "string",
      required: false,
      defaultValue: "{}",
    },
  },
},


  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 24 * 7 * 60 * 60,
    },
  },
  plugins: [jwt()],
  // databaseHooks: {
  //   user: {
  //     create: {
  //       after: async (user) => {
  //         // Trigger your custom database creation sequence here safely
  //         await fetch(`${process.env.NEXT_PUBLIC_API}/api/account`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             _id: user.id,
  //             name: user.name,
  //             email: user.email,
  //             role: user.role || "user", // Passed via additionalData
  //             createdAt: new Date(),

  //             updatedAt: new Date(),
  //           }),
  //         });
  //       },
  //     },
  //   },
  // },
});
