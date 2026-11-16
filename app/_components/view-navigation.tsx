"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ViewNavigation() {
  const isStats = usePathname().startsWith("/stats");
  return (
    <nav aria-label="Views" className="explorer-navigation">
      <Link href="/" aria-current={!isStats ? "page" : undefined}>
        Map
      </Link>
      <Link href="/stats" aria-current={isStats ? "page" : undefined}>
        Stats
      </Link>
    </nav>
  );
}
