type WipeInfoProps = {
  lastWipe: Date;
  nextWipe: Date;
  frequency: string;
  gameId?: string;
};

export function WipeInfo({
  lastWipe,
  nextWipe,
  frequency,
  gameId,
}: WipeInfoProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isPoe = gameId === "poe";
  const lastLabel = isPoe ? "Last League" : "Last Wipe";
  const nextLabel = isPoe ? "Next League" : "Next Wipe";

  const infoItems = [
    { label: lastLabel, value: formatDate(lastWipe) },
    { label: nextLabel, value: formatDate(nextWipe) },
    { label: "Frequency", value: frequency },
  ];

  return (
    <div className="flex items-center justify-center gap-16">
      {infoItems.map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {item.label}
          </div>
          <div className="mt-2 text-base font-medium text-zinc-200">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
