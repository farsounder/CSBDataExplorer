"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProviderSelectOption } from "@/lib/types";

export default function ProviderSelect({
  providers,
  selectedProvider,
}: {
  providers: ProviderSelectOption[];
  selectedProvider: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const providerLabelByValue = useMemo(
    () => new Map(providers.map((provider) => [provider.value, provider.label])),
    [providers]
  );

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Select
        value={selectedProvider}
        disabled={isPending}
        onValueChange={(value) => {
          if (value === selectedProvider) {
            return;
          }

          setPendingProvider(value);
          startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("provider", value);
            router.push(`${pathname}?${params.toString()}`);
          });
        }}
      >
        <SelectTrigger className="w-full min-w-[240px] max-w-[320px] bg-white">
          <SelectValue placeholder="Select a provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {providers.map((provider) => (
              <SelectItem key={provider.value} value={provider.value}>
                {provider.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="min-h-[20px] text-sm text-gray-600">
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading charts for {providerLabelByValue.get(pendingProvider ?? "") ?? "selected provider"}...
          </span>
        ) : null}
      </div>
    </div>
  );
}
