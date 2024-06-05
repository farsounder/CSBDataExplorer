"use client";
import Link from "next/link";
import { CopyIcon, FacebookIcon, LinkedinIcon } from "lucide-react";
import { toast } from "../../../components/ui/use-toast";

export default function SocialButtons({
  uniqueId,
  timeWindowDays,
}: {
  uniqueId: string;
  timeWindowDays: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const linkedIn = "https://www.linkedin.com/sharing/share-offsite/?url=";
  const shareUrl = `/share/${uniqueId}?time_window_days=${timeWindowDays}`;
  const fullShareUrl = `${baseUrl}${shareUrl}`;
  const linkedInLink = `${linkedIn}${encodeURIComponent(fullShareUrl)}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    fullShareUrl
  )}`;
  return (
    <div className="flex justify-center space-x-4">
      <Link href={linkedInLink}>
        <LinkedinIcon className="w-8 h-8 text-blue-800" />
      </Link>
      <Link href={facebookLink}>
        <FacebookIcon className="w-8 h-8 text-blue-800" />
      </Link>
      <CopyIcon
        className="w-8 h-8 text-blue-800 hover:cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(fullShareUrl);
          toast({
            title: "Copied to clipboard",
            description: "Share URL copied to clipboard",
          });
        }}
      />
    </div>
  );
}
