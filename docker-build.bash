docker build `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://wzzudkjvytjmhhxhxirl.supabase.co" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6enVka2p2eXRqbWhoeGh4aXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzk1MjIsImV4cCI6MjA1MDkxNTUyMn0.9ofo6bGvyOsiheDQL_hq3j_QxehsJxIIZm3Mx1e0VfU" `
  --build-arg NEXT_PUBLIC_MEILISEARCH_URL="https://meilisearch-bmw.jineshb.app" `
  --build-arg NEXT_PUBLIC_MEILISEARCH_KEY="j1kT71ELtayufIaOe4cFMF1sK3gGjR5O" `
  -t bmw-engine-configurator .