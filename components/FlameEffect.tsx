"use client";

export default function FlameEffect() {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="relative w-16 h-20">
        {/* Main flame */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-14 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 animate-flame opacity-90" />
        {/* Inner flame */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-10 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-t from-red-600 via-orange-500 to-yellow-200 animate-flame opacity-80"
          style={{ animationDelay: "0.3s" }}
        />
        {/* Core */}
        <div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-6 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-t from-yellow-200 to-white animate-flame opacity-90"
          style={{ animationDelay: "0.6s" }}
        />
        {/* Sparks */}
        <div className="absolute bottom-4 left-3 w-1.5 h-1.5 rounded-full bg-orange-400 animate-flame-rise" />
        <div className="absolute bottom-6 right-3 w-1 h-1 rounded-full bg-yellow-400 animate-flame-rise" style={{ animationDelay: "0.8s" }} />
        <div className="absolute bottom-5 left-5 w-1 h-1 rounded-full bg-red-400 animate-flame-rise" style={{ animationDelay: "1.4s" }} />
        {/* Glow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-8 rounded-full bg-orange-500/20 blur-xl" />
      </div>
    </div>
  );
}
