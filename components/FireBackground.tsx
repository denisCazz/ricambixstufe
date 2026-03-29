"use client";

/**
 * Animated fire-themed background.
 * - variant="full" → login/register: floating embers, pulsing glow, drifting sparks
 * - variant="subtle" → homepage: very faint ambient embers, barely visible
 */
export default function FireBackground({ variant = "full" }: { variant?: "full" | "subtle" }) {
  if (variant === "subtle") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Bottom glow */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-[250px] rounded-full bg-orange-500/[0.08] dark:bg-orange-500/[0.14] blur-3xl animate-glow-pulse" />
        <div className="absolute -bottom-10 left-1/4 w-[300px] h-[150px] rounded-full bg-red-500/[0.05] dark:bg-red-500/[0.10] blur-3xl animate-glow-pulse" style={{ animationDelay: "3s" }} />

        {/* Floating embers */}
        <div className="absolute bottom-[10%] left-[15%] w-1.5 h-1.5 rounded-full bg-orange-400/40 dark:bg-orange-400/60 animate-ember-float" />
        <div className="absolute bottom-[5%] left-[45%] w-1 h-1 rounded-full bg-red-400/30 dark:bg-red-400/50 animate-ember-float" style={{ animationDelay: "3s", animationDuration: "14s" }} />
        <div className="absolute bottom-[8%] right-[20%] w-1.5 h-1.5 rounded-full bg-orange-300/35 dark:bg-orange-300/55 animate-ember-float" style={{ animationDelay: "7s", animationDuration: "16s" }} />
        <div className="absolute bottom-[3%] right-[40%] w-1 h-1 rounded-full bg-yellow-400/25 dark:bg-yellow-400/45 animate-ember-float" style={{ animationDelay: "10s", animationDuration: "18s" }} />
        <div className="absolute bottom-[6%] left-[65%] w-1 h-1 rounded-full bg-red-400/25 dark:bg-red-400/45 animate-ember-float" style={{ animationDelay: "5s", animationDuration: "12s" }} />
        <div className="absolute bottom-[4%] left-[30%] w-1.5 h-1.5 rounded-full bg-orange-500/30 dark:bg-orange-500/50 animate-ember-float" style={{ animationDelay: "8s", animationDuration: "15s" }} />
      </div>
    );
  }

  // Full variant for login/register
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Bottom glow — warm orange radial */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-gradient-radial from-orange-600/30 via-red-600/15 to-transparent dark:from-orange-600/40 dark:via-red-600/20 blur-3xl animate-glow-pulse" />

      {/* Secondary side glows */}
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[250px] rounded-full bg-orange-500/15 dark:bg-orange-500/25 blur-3xl animate-glow-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[250px] rounded-full bg-red-500/15 dark:bg-red-500/25 blur-3xl animate-glow-pulse" style={{ animationDelay: "4s" }} />

      {/* Top corner subtle glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[150px] rounded-full bg-orange-400/[0.06] dark:bg-orange-400/[0.10] blur-3xl animate-glow-pulse" style={{ animationDelay: "3s" }} />

      {/* Floating embers rising from bottom */}
      {[
        { left: "8%",  size: "w-2 h-2",   color: "bg-orange-400/60 dark:bg-orange-400/80", delay: "0s", duration: "7s" },
        { left: "20%", size: "w-1.5 h-1.5", color: "bg-red-400/50 dark:bg-red-400/70", delay: "1.2s", duration: "9s" },
        { left: "35%", size: "w-2.5 h-2.5", color: "bg-orange-300/45 dark:bg-orange-300/65", delay: "2.5s", duration: "11s" },
        { left: "50%", size: "w-1.5 h-1.5", color: "bg-yellow-400/55 dark:bg-yellow-400/75", delay: "0.8s", duration: "8s" },
        { left: "65%", size: "w-2 h-2",   color: "bg-orange-500/50 dark:bg-orange-500/70", delay: "3.5s", duration: "10s" },
        { left: "80%", size: "w-1.5 h-1.5", color: "bg-red-500/45 dark:bg-red-500/65", delay: "4.5s", duration: "12s" },
        { left: "92%", size: "w-1 h-1",   color: "bg-yellow-300/50 dark:bg-yellow-300/70", delay: "5.5s", duration: "9s" },
        { left: "45%", size: "w-1 h-1",   color: "bg-orange-400/40 dark:bg-orange-400/60", delay: "6.5s", duration: "13s" },
        { left: "15%", size: "w-1.5 h-1.5", color: "bg-red-300/40 dark:bg-red-300/60", delay: "7.5s", duration: "14s" },
        { left: "72%", size: "w-2 h-2",   color: "bg-orange-300/45 dark:bg-orange-300/65", delay: "1.8s", duration: "10s" },
        { left: "55%", size: "w-1 h-1",   color: "bg-red-400/35 dark:bg-red-400/55", delay: "9s", duration: "11s" },
        { left: "30%", size: "w-2 h-2",   color: "bg-yellow-500/40 dark:bg-yellow-500/60", delay: "4s", duration: "8s" },
      ].map((ember, i) => (
        <div
          key={i}
          className={`absolute bottom-0 rounded-full ${ember.size} ${ember.color} animate-ember-float`}
          style={{ left: ember.left, animationDelay: ember.delay, animationDuration: ember.duration }}
        />
      ))}

      {/* Heat shimmer effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-900/[0.07] to-transparent dark:from-orange-900/[0.12] animate-heat-shimmer" />
    </div>
  );
}
