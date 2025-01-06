export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="mt-10">
        <div className="w-[180px] h-10 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="container w-full mt-10">
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[200px] bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
