"use client";
import Link from "next/link";
import { LinkIcon, LinkedinIcon } from "lucide-react";

export default function SocialButtons({
  uniqueId,
  timeWindowDays,
}: {
  uniqueId: string;
  timeWindowDays: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const shareLink = `/share/${uniqueId}?time_window_days=${timeWindowDays}`;
  const linkedInLink = `https://www.linkedin.com/sharing/share-offsite/?url=${baseUrl}/${encodeURIComponent(shareLink)}`;
  return (
    <div className="flex justify-center space-x-4">
      <Link href={linkedInLink}>
        <LinkedinIcon className="w-8 h-8 text-blue-800" />
      </Link>
      <Link href={shareLink}>
        <LinkIcon className="w-8 h-8 text-blue-800 hover:cursor-pointer" />
      </Link>
    </div>
  );
}
