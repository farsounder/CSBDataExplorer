"use client";
import { FacebookIcon, LinkIcon, LinkedinIcon } from "lucide-react";
import { FacebookShareButton, LinkedinShareButton } from "next-share";
import Link from "next/link";

export default function SocialButtons({ shareUrl }: { shareUrl: string }) {
  return (
    <div className="flex justify-center space-x-4">
      <FacebookShareButton url={shareUrl}>
        <FacebookIcon className="w-8 h-8 text-blue-800" />
      </FacebookShareButton>
      <LinkedinShareButton url={shareUrl}>
        <LinkedinIcon className="w-8 h-8 text-blue-800" />
      </LinkedinShareButton>
      <Link href={shareUrl}>
        <LinkIcon className="w-8 h-8 text-blue-800" />
      </Link>
    </div>
  );
}
