"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Header = () => {
  const pathname = usePathname();
  const decodedPath = decodeURIComponent(pathname);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center mt-4 gap-2 px-8">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">BMW catalog</h1>
        <h2 className="text-sm font-normal text-gray-400">Know your Bimmer</h2>
      </div>
      <div className="flex flex-row items-center gap-4 ml-2 md:ml-8 mt-4 md:mt-0">
        <Link
          href="/"
          className={cn(
            "hover:text-purple-600",
            decodedPath.startsWith("/cars") || decodedPath === "/"
              ? "text-purple-600 font-semibold"
              : ""
          )}
        >
          Cars
        </Link>
        <Link
          href="/engines"
          className={cn(
            "hover:text-purple-600",
            decodedPath.startsWith("/engines")
              ? "text-purple-600 font-semibold"
              : ""
          )}
        >
          Engines
        </Link>
      </div>
    </div>
  );
};

export default Header;
