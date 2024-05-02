import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <SignIn path="/sign-in" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
