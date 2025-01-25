"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 my-6">
      <Link
        href="/"
        className={`${pathname === "/" ? "text-purple-600 font-semibold" : ""}`}
      >
        Cars
      </Link>
      <Link
        href="/engines"
        className={`${
          pathname.startsWith("/engines") ? "text-purple-600 font-semibold" : ""
        }`}
      >
        Engines
      </Link>
    </nav>
  );
}
