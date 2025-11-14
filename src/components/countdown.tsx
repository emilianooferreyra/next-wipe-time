"use client";

import { useEffect, useState } from "react";

type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

type CountdownProps = {
  targetDate: Date;
  accentColor: string;
};

export function Countdown({ targetDate, accentColor }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      const total = targetDate.getTime() - Date.now();

      if (total <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));

      return { days, hours, minutes, seconds, total };
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const timeUnits = [
    { label: "Days", value: timeRemaining.days },
    { label: "Hours", value: timeRemaining.hours },
    { label: "Minutes", value: timeRemaining.minutes },
    { label: "Seconds", value: timeRemaining.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-12">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div
            className="text-7xl font-bold tabular-nums tracking-tight"
            style={{ color: accentColor }}
          >
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="mt-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
