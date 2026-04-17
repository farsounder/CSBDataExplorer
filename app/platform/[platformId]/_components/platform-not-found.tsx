import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlatformNotFound({ platformId }: { platformId: string }) {
  return (
    <div className="flex flex-1 min-h-0 items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Info className="mx-auto mb-1 h-10 w-10 text-blue-600" aria-hidden />
          <CardTitle>Unique platform ID not found</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            This ID is not in NOAA&apos;s platform list yet. That can happen when data has not been received by
            NOAA, or when the only data received was in waters where CSB activities are disallowed. Check back later,
            or contact FarSounder for help.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Requested ID: <span className="font-mono text-foreground">{platformId}</span>
          </p>
          <Button asChild>
            <Link href="/platform">Back to platform map</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
