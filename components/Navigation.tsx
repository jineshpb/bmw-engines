"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 mb-8">
      <Link
        href="/"
        className={`${pathname === "/" ? "text-blue-600 font-semibold" : ""}`}
      >
        Cars
      </Link>
      <Link
        href="/engines"
        className={`${
          pathname === "/engines" ? "text-blue-600 font-semibold" : ""
        }`}
      >
        Engines
      </Link>
    </nav>
  );
}
