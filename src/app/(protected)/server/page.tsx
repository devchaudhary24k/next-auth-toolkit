import { currentUser } from "@/lib/auth";
import UserInfo from "@/components/UserInfo";

export default async function ServerPage() {
  const user = await currentUser();

  return (
    <div>
      <UserInfo user={user} label={"Server Component"} />
    </div>
  );
}
