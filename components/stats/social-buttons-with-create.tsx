"use client";
import { useRouter } from "next/navigation";
import { LinkIcon, LinkedinIcon } from "lucide-react";
import { createUniqueIdAction } from "@/app/actions";

import { useToast } from "@/components/ui/use-toast";

export default function SocialButtons({
  platformId,
  timeWindowDays,
}: {
  platformId: string;
  timeWindowDays: number;
}) {
  const createUniqueIdActionWithPlatformId = createUniqueIdAction.bind(null, {
    platformId,
  });

  const router = useRouter();
  const { toast } = useToast();

  // TODO: dry out handler
  return (
    <div className="flex justify-center space-x-4">
      <LinkedinIcon
        className="w-8 h-8 text-blue-800 hover:cursor-pointer"
        onClick={async () => {
          toast({
            title: "Making a unique share URL...",
            description:
              "Generating unique share URL for your platform, you will be redirected to share to LinkedIn shortly...",
          });
          const id = await createUniqueIdActionWithPlatformId();
          if (id) {
            const baseUrl =
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            const shareLink = `${baseUrl}/share/${id}?time_window_days=${timeWindowDays}`;
            const linkedInLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
            router.push(linkedInLink);
          } else {
            toast({
              title: "Error",
              description: "Failed to generate unique share URL",
              variant: "destructive",
            });
          }
        }}
      />
      <LinkIcon
        className="w-8 h-8 text-blue-800 hover:cursor-pointer"
        onClick={async () => {
          toast({
            title: "Making a unique share URL...",
            description:
              "Generating unique share URL for your platform, you will be redirected shortly...",
          });
          const id = await createUniqueIdActionWithPlatformId();
          if (id) {
            router.push(`/share/${id}?time_window_days=${timeWindowDays}`);
          } else {
            toast({
              title: "Error",
              description: "Failed to generate unique share URL",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}
