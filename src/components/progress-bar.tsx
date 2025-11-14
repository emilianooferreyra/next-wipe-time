type ProgressBarProps = {
  percentage: number;
  accentColor: string;
};

export function ProgressBar({ percentage, accentColor }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">
          Wipe Cycle Progress
        </span>
        <span className="text-sm font-semibold text-zinc-50">
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  );
}
