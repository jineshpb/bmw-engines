"use client";
import { Engine, EngineClass } from "@/types/engines";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface EngineSearchResult extends Engine {
  type: "engine";
  power?: string;
  torque?: string;
}

interface ClassSearchResult extends EngineClass {
  type: "class";
}

type SearchResult = EngineSearchResult | ClassSearchResult;

interface Props {
  defaultQuery?: string;
}

export function EngineSearch({ defaultQuery = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [debouncedQuery] = useDebounce(query, 300);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (!debouncedQuery) {
      params.delete("query");
      setResults([]);
      setShowDropdown(false);
    } else {
      params.set("query", debouncedQuery);

      // Fetch both engines and classes
      Promise.all([
        fetch(`/api/search/engines?q=${debouncedQuery}`).then((res) =>
          res.json()
        ),
        fetch(`/api/search/classes?q=${debouncedQuery}`).then((res) =>
          res.json()
        ),
      ]).then(([engineResults, classResults]) => {
        const engines = engineResults.hits.map((hit: Engine) => ({
          ...hit,
          type: "engine",
        }));
        const classes = classResults.hits.map((hit: EngineClass) => ({
          ...hit,
          type: "class",
        }));
        setResults([...engines, ...classes]);
        setShowDropdown(true);
      });
    }
  }, [debouncedQuery, router, pathname, searchParams]);

  // Clear search when route changes
  useEffect(() => {
    return () => {
      setQuery("");
      setResults([]);
      setShowDropdown(false);
    };
  }, [router]);

  const handleSelect = (result: SearchResult, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery(result.type === "engine" ? result.engine_code : result.model);
    setShowDropdown(false);

    const params = new URLSearchParams(searchParams);
    if (result.type === "engine") {
      params.set("query", result.engine_code);
    } else {
      params.set("class", result.id);
      params.delete("query");
    }
    router.push(`${pathname}?${params.toString()}`);

    // Clear search immediately on selection
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery("");
    setResults([]);
    setShowDropdown(false);

    const params = new URLSearchParams(searchParams);
    params.delete("query");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative w-[400px] max-w-md search-container">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search engines (e.g. B58, N55...)"
          className="pl-10 pr-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute mt-2 w-full rounded-md border bg-white shadow-lg z-50">
          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
              onClick={(e) => handleSelect(result, e)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleSelect(result, e as unknown as React.MouseEvent)
              }
              tabIndex={0}
              role="button"
            >
              <div className="flex-1">
                <div className="font-medium">
                  {result.type === "engine" ? result.engine_code : result.model}
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.type === "engine" ? (
                    <>
                      {result.power && `${result.power} · `}
                      {result.torque}
                    </>
                  ) : (
                    "Engine Class"
                  )}
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded bg-gray-100">
                {result.type === "engine" ? "Engine" : "Class"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
