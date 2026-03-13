"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const timeWindowDaysOptions: number[] = [14, 30, 60, 90, 180, 365];
const DEFAULT_TIME_WINDOW_DAYS = 30;

export function TimeWindowSelect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const parsedTimeWindowDays = Number(searchParams.get("timeWindowDays") ?? DEFAULT_TIME_WINDOW_DAYS);
  const timeWindowDays = Number.isFinite(parsedTimeWindowDays)
    ? parsedTimeWindowDays
    : DEFAULT_TIME_WINDOW_DAYS;

  return (
    <div className="relative flex text-gray-500">
      <div className="flex items-center justify-center gap-2">
        <CalendarDaysIcon className="w-10 h-10 text-gray-500" />
        <Select
          value={timeWindowDays.toString()}
          disabled={isPending}
          onValueChange={(value) => {
            if (value === timeWindowDays.toString()) {
              return;
            }

            startTransition(() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("timeWindowDays", value);
              router.push(pathname + "?" + params.toString());
            });
          }}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue>{timeWindowDays} Days</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {timeWindowDaysOptions.map((days) => (
                <SelectItem key={days} value={days.toString()}>
                  {days} Days
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div
        className="pointer-events-none absolute left-12 top-full pt-1 text-sm text-blue-700"
        aria-live="polite"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            Loading data...
          </span>
        ) : null}
      </div>
    </div>
  );
}
