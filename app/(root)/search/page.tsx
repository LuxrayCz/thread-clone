import UserCard from "@/components/cards/UserCard";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { profileTabs } from "@/constants";
import { fetchAllUsers, fetchUser } from "@/lib/actions/user.actions";
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
  const result = await fetchAllUsers({ userId: user.id, searchString: "", pageNumber: 1, pageSize: 25 });
  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>
      {/* Search bar */}
      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No Users</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard key={person.id} id={person.id} name={person.name} username={person.username} imgUrl={person.image} personType="User" />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default Page;
