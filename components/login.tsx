"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";

const Login = () => {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col items-center justify-center">
      {!session && (
        <Button
          onClick={() => signIn()}
          className="p-2 my-2 bg-blue-500 text-white"
        >
          Sign in
        </Button>
      )}
      {session && (
        <Button
          onClick={() => signOut()}
          className="p-2 bg-blue-500 my-2 text-white"
        >
          Sign out
        </Button>
      )}
    </div>
  );
};

export default Login;