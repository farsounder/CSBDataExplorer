"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | undefined) : [T | undefined, (value: T) => void] {
  // start as undefined for the server side
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    // check if we are in the browser
    if (typeof window === "undefined") {
      return;
    }
    const item = localStorage.getItem(key);
    setValue(item ? JSON.parse(item) : initialValue);
  }, [key, initialValue]);

  const updateValue = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    setValue(value);
  };

  return [value, updateValue];
}
