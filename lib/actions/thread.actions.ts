"use server";

import { revalidatePath } from "next/cache";
import { Trykker } from "next/font/google";
import Thread from "../Models/Thread.model";
import User from "../Models/User.model";
import { connectToDb } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({ author, communityId, path, text }: Params) {
  try {
    connectToDb();
    const createdThread = await Thread.create({
      text,
      author,
      community: communityId,
    });
    console.log(createdThread);
    //UPDATE USER MODEL
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDb();
  try {
    const skipAmt = (pageNumber - 1) * pageSize;

    const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmt)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });
    const posts = await postQuery.exec();
    const isNext = totalPostsCount > skipAmt + posts.length;

    return { posts, isNext };
  } catch (error) {}
}

export async function fetchThreadById(threadId: string) {
  connectToDb();
  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();
    return thread;
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}

export async function addCommentToThread(threadId: string, commentText: string, userId: string, path: string) {
  try {
    connectToDb();
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });
    const savedCommentThread = await commentThread.save();
    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Could not create comment. Error: ${error.message}`);
  }
}
