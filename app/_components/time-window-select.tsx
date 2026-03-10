"use client";

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

const timeWindowDaysOptions: number[] = [14, 30, 60, 90, 180, 365];
const DEFAULT_TIME_WINDOW_DAYS = 30;

export function TimeWindowSelect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const parsedTimeWindowDays = Number(searchParams.get("timeWindowDays") ?? DEFAULT_TIME_WINDOW_DAYS);
  const timeWindowDays = Number.isFinite(parsedTimeWindowDays)
    ? parsedTimeWindowDays
    : DEFAULT_TIME_WINDOW_DAYS;

  return (
    <div className="gap-2 justify-center flex text-gray-500">
      <CalendarDaysIcon className="w-10 h-10 text-gray-500" />
      <Select
        value={timeWindowDays.toString()}
        onValueChange={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("timeWindowDays", value);
          router.push(pathname + "?" + params.toString());
        }}
      >
        <SelectTrigger className="w-[180px]">
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
  );
}
