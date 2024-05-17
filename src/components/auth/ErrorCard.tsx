import Header from "@/components/auth/Header";
import BackBtn from "@/components/auth/Back-btn";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

export default function ErrorCard() {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label={"Opps! Something went wrong."} />
      </CardHeader>

      <CardFooter>
        {" "}
        <BackBtn label={"Back to login"} href="/auth/login" />{" "}
      </CardFooter>
    </Card>
  );
}
