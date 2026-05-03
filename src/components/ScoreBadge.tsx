export function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 82
      ? "bg-lagoon text-white"
      : score >= 68
        ? "bg-current text-white"
        : score >= 50
          ? "bg-signal text-white"
          : "bg-slate-700 text-white";

  return (
    <span className={`inline-flex h-14 w-14 items-center justify-center rounded-lg text-lg font-black ${color}`}>
      {score}
    </span>
  );
}
