import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";

export const inngest = new Inngest({ id: "ecommerce-app" });

// Sync new user
const syncUser = inngest.createFunction(
  { id: "sync-user", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    await connectDB();

    const { email_addresses, first_name, last_name, image_url } = event.data;

    const newUser = {
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
      imageUrl: image_url,
      addresses: [],
      wishlist: [],
    };

    await User.create(newUser);
  }
);

// Delete user from DB
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    await connectDB();

    const { email_addresses } = event.data;
    const email = email_addresses[0]?.email_address;

    if (email) {
      await User.deleteOne({ email });
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];