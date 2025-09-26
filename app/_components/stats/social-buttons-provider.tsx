"use client";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { toPng } from "html-to-image";

export default function SocialButtonsProvider({
  captureElementId,
  fileBase,
}: {
  captureElementId?: string;
  fileBase: string;
}) {
  const { toast } = useToast();

  const getCaptureElement = (): HTMLElement | null => {
    const id = captureElementId || "stats-card-provider-capture";
    return document.getElementById(id);
  };

  const copyImageToClipboard = async () => {
    try {
      const node = getCaptureElement();
      if (!node) {
        toast({
          title: "Not found",
          description: "Stats card element not found",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Rendering image...", description: "Preparing image for clipboard" });
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "white",
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const ClipboardItemCtor = (window as any).ClipboardItem;
      if (!ClipboardItemCtor) {
        throw new Error("ClipboardItem not supported");
      }
      const clipboardItem = new ClipboardItemCtor({ [blob.type]: blob });
      await (navigator.clipboard as any).write([clipboardItem]);
      toast({ title: "Copied", description: "Stats card image copied to clipboard" });
    } catch (e) {
      console.error(e);
      toast({
        title: "Copy failed",
        description: "Your browser may not support image clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadImage = async () => {
    try {
      const node = getCaptureElement();
      if (!node) {
        toast({
          title: "Not found",
          description: "Stats card element not found",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Rendering image...", description: "Preparing download" });
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "white",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${fileBase}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Downloaded", description: "Image downloaded" });
    } catch (e) {
      console.error(e);
      toast({
        title: "Download failed",
        description: "Unable to generate image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center space-x-4">
      <CopyIcon
        className="w-8 h-8 text-blue-800 hover:cursor-pointer"
        onClick={copyImageToClipboard}
      />
      <DownloadIcon
        className="w-8 h-8 text-blue-800 hover:cursor-pointer"
        onClick={downloadImage}
      />
    </div>
  );
}
