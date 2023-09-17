"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import Thread from "../Models/Thread.model";
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

interface SearchParams {
  pageNumber?: number;
  pageSize?: number;
  searchString?: string;
  userId: string;
  sortBy?: SortOrder;
}

export async function updateUser({ userId, username, name, bio, image, path }: Params): Promise<void> {
  try {
    connectToDb();
    await User.findOneAndUpdate({ id: userId }, { username: username.toLowerCase(), name, bio, image, onboarded: true }, { upsert: true });
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
export async function fetchUserPost(userId: string) {
  try {
    connectToDb();
    const userWithThreads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });
    return userWithThreads;
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}

export async function fetchAllUsers({ pageNumber = 1, pageSize = 20, searchString = "", userId, sortBy = "desc" }: SearchParams) {
  try {
    connectToDb();
    const skipAmt = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");
    const query: FilterQuery<typeof User> = { id: { $ne: userId } };

    if (searchString.trim() !== "") {
      query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }];
    }

    const sortOptions = { createdAt: sortBy };
    const usersQuery = User.find(query).sort(sortOptions).skip(skipAmt).limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();
    const isNext = totalUsersCount > users.length + skipAmt;
    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}
export async function getActivity(userId: string) {
  try {
    connectToDb();
    // const userThreads = User.findOne({ id: userId }).populate({
    //   path: "threads",
    //   model: Thread,
    //   populate: {
    //     path: "children",
    //     model: Thread,
    //   },
    // });
    const userThreads = await Thread.find({ author: userId });
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);
    const replies = await Thread.find({ _id: { $in: childThreadIds }, author: { $ne: userId } }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });
    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}
