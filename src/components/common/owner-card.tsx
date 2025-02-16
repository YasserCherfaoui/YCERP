import { Label } from "@radix-ui/react-dropdown-menu";
import { Card, CardContent } from "../ui/card";
import UserAvatar from "./user-avatar";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";

export default function () {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  return (
    <>
      <Label>Owner</Label>
      <Card className="w-fit flex flex-col justify-center items-center pt-4">
        <CardContent className="flex flex-col justify-center items-center gap-2">
          <UserAvatar />
          <Label>{currentUser?.full_name}</Label>
        </CardContent>
      </Card>
    </>
  );
}
