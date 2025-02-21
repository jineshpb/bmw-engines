import { MeiliSearch } from "meilisearch";

if (!process.env.NEXT_PUBLIC_MEILISEARCH_URL) {
  throw new Error("NEXT_PUBLIC_MEILISEARCH_URL is not defined");
}

const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_URL,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_KEY,
});

console.log("Meilisearch configured with:", {
  host: process.env.NEXT_PUBLIC_MEILISEARCH_URL,
  // Don't log the full key
  keyPresent: !!process.env.NEXT_PUBLIC_MEILISEARCH_KEY,
});

export default client;
