"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function IconTriggeredModal({
  icon,
  title,
  description,
  link,
  socialLinks,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  socialLinks?: { name: string; link: string; icon: React.ReactNode }[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="z-50 border-0 bg-white/60">
          {icon}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-blue-800 text-xl font-bold">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-gray-500">
          {description}
        </DialogDescription>
        <div className=" text-gray-500">
          Learn more about{" "}
          <a
            className="hover:cursor-pointer hover:text-blue-400 text-blue-800 font-bold"
            href={link}
            target="_blank"
          >
            {title}
          </a>
        </div>
        <DialogFooter>
          <div className="w-full p-2 flex flex-col justify-center items-center gap-4">
            {icon}
            {socialLinks && (
              <div className="flex justify-center items-center space-x-4">
                {socialLinks.map((socialLink) => (
                  <a
                    key={socialLink.name}
                    href={socialLink.link}
                    target="_blank"
                    className="hover:cursor-pointer"
                  >
                    {socialLink.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
