"use client";
export default function ChainLoader() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

