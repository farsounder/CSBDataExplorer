import { FaceFrownIcon } from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
const LoggedOutState = () => {
  return (
    <div className="flex flex-col items-center w-full pt-10">
      <h1 className="text-4xl">Nothing to see here...</h1>
      <h2 className="text-2xl">You are not logged in.</h2>
      <FaceFrownIcon className="w-48 h-48 text-gray-800 mt-4" />
      <p className="pb-2">Please sign in to view this page.</p>
      <Button className="bg-blue-500" onClick={(e) => signIn()}>Sign In</Button>
    </div>
  );
};

export default LoggedOutState;
