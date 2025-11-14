import {
  CalendarDays,
  CircleCheck,
  Flame,
  Gamepad2,
  TriangleAlert,
} from "lucide-react";
import type { GameDataMap, FilterType } from "@/types/game";

type GameFiltersProps = {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  gameData: GameDataMap;
};

export function GameFilters({
  filter,
  onFilterChange,
  gameData,
}: GameFiltersProps) {
  const tabs = [
    { id: "all", label: "All Games", icon: <Gamepad2 /> },
    {
      id: "soon",
      label: "Next 7 Days",
      icon: <Flame />,
      count: Object.values(gameData).filter((d) => {
        if (!d?.nextWipe) return false;
        const diffDays =
          (new Date(d.nextWipe).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && diffDays > 0;
      }).length,
    },
    {
      id: "this-month",
      label: "This Month",
      icon: <CalendarDays className="w-4 h-4" />,
      count: Object.values(gameData).filter((d) => {
        if (!d?.nextWipe) return false;
        const diffDays =
          (new Date(d.nextWipe).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diffDays <= 30 && diffDays > 0;
      }).length,
    },
    {
      id: "confirmed",
      label: "Confirmed",
      icon: <CircleCheck />,
      count: Object.values(gameData).filter((d) => d?.confirmed === true)
        .length,
    },
    {
      id: "estimated",
      label: "Estimated",
      icon: <TriangleAlert />,
      count: Object.values(gameData).filter(
        (d) => d?.nextWipe && d?.confirmed === false
      ).length,
    },
  ];

  return (
    <div className="relative border-b border-white/5 bg-[#242938]/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Filter games">
          {tabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id as FilterType)}
                className={`relative px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "text-[#FA5D29]"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.icon &&
                    (typeof tab.icon === "string" ? (
                      <span>{tab.icon}</span>
                    ) : (
                      tab.icon
                    ))}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive
                          ? "bg-[#FA5D29]/20 text-[#FA5D29]"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FA5D29]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
