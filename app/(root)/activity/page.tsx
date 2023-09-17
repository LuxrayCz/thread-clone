import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import React from "react";

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  //Get activity
  const activity = await getActivity(userInfo._id);
  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>
      <section className="mt-10 flex flex-col gap-5 ">
        {activity.length > 0 ? (
          <>
            {activity.map((oneActivity) => (
              <Link key={oneActivity._id} href={`/thread/${oneActivity.parentId}`}>
                <article className="activity-card">
                  <Image src={oneActivity.author.image} alt="Profile picture" width={20} height={20} className="rounded-full object-cover" />
                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">{oneActivity.author.name}</span> replied to your thread.
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet</p>
        )}
      </section>
    </section>
  );
};

export default Page;
