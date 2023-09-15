import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

type UserFromMongo = {
  _id: string;
  id: string;
  bio: string;
  image: string;
  name: string;
  onboarded: boolean;
  username: string;
};

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo: UserFromMongo = await fetchUser(user.id);

  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  return (
    <>
      <h1 className="head-text">Create Thread</h1>;
      <PostThread userId={userInfo._id} />
    </>
  );
};

export default Page;
