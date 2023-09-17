import ProfileHeader from "@/components/shared/ProfileHeader";
import { profileTabs } from "@/constants";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

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

  //Fetch all users

  return (
    <section>
      <h1 className="head-text mb-10">Communities</h1>
    </section>
  );
};

export default Page;
