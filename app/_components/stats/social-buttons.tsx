"use client";
import { CopyIcon } from "lucide-react";
import { toast } from "../../../components/ui/use-toast";

export default function SocialButtons({
  uniqueId,
  timeWindowDays,
}: {
  uniqueId: string;
  timeWindowDays: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const shareUrl = `/share/${uniqueId}?timeWindowDays=${timeWindowDays}`;
  const fullShareUrl = `${baseUrl}${shareUrl}`;
  return (
    <div className="flex justify-center space-x-4">
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
