"use client";
import FSLogo from "./icons/fslogo";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-col w-full">
      <div className="border-b flex items-center justify-between">
        <div className="flex py-4 items-center px-4 gap-8">
          <Link href="/">
            <FSLogo />
          </Link>
        </div>
        <div className="px-4 flex items-center">
        </div>
      </div>
    </header>
  );
}
