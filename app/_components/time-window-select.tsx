"use client";

import { useEffect, useState } from "react";

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

export function TimeWindowSelect() {
  const [timeWindowDays, setTimeWindowDays] = useState<number>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setTimeWindowDays(parseInt(searchParams.get("time_window_days") ?? "30"));
  }, [searchParams]);

  return (
    <div className="gap-2 justify-center hidden sm:flex text-gray-500">
      <CalendarDaysIcon className="w-10 h-10 text-gray-500" />
      <Select
        value={timeWindowDays?.toString()}
        onValueChange={(value) => {
          setTimeWindowDays(parseInt(value));
          const params = new URLSearchParams(searchParams.toString());
          params.set("time_window_days", value);
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
