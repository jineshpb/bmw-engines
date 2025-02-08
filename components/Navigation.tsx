"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const pathname = usePathname();
  const decodedPath = decodeURIComponent(pathname);

  console.log("@@decodedPath", decodedPath);

  return (
    <nav className="flex gap-4 my-6">
      <Link
        href="/cars"
        className={cn(
          "hover:text-blue-600",
          decodedPath.startsWith("/cars")
            ? "text-blue-600 font-medium"
            : "text-gray-600"
        )}
      >
        Cars
      </Link>
      <Link
        href="/engines"
        className={cn(
          "hover:text-blue-600",
          decodedPath.startsWith("/engines")
            ? "text-blue-600 font-medium"
            : "text-gray-600"
        )}
      >
        Engines
      </Link>
    </nav>
  );
}
