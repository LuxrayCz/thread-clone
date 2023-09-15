"use server";

import { revalidatePath } from "next/cache";
import User from "../Models/User.model";
import { connectToDb } from "../mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({ userId, username, name, bio, image, path }: Params): Promise<void> {
  try {
    connectToDb();
    await User.findOneAndUpdate({ id: userId }, { username: username.toLowerCase(), name, bio, image, onboarded: true }, { upsert: true });
    console.log("Updated in api");
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}
export async function fetchUser(userId: string) {
  try {
    connectToDb();
    const user = await User.findOne({ id: userId });
    return user;
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}
