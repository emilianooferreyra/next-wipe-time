"use client";

import { useState } from "react";
import type { GameEvent } from "@/lib/events/types";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
} from "lucide-react";

type EventCalendarProps = {
  events: GameEvent[];
};

export function EventCalendar({ events }: EventCalendarProps) {
  const [currentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDayOfMonth = getFirstDayOfMonth(selectedYear, selectedMonth);
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => {
      const eventDate = event.startDate.toISOString().split("T")[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedMonth === today.getMonth() &&
      selectedYear === today.getFullYear()
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-zinc-50">
            {monthNames[selectedMonth]} {selectedYear}
          </h2>
          {(selectedMonth !== currentDate.getMonth() ||
            selectedYear !== currentDate.getFullYear()) && (
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-zinc-700/50">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-zinc-400 bg-zinc-800/50"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-24 border-b border-r border-zinc-700/30 bg-zinc-900/20"
                />
              );
            }

            const dayEvents = getEventsForDay(day);
            const isTodayDay = isToday(day);

            return (
              <div
                key={`day-${day}`}
                className={`min-h-24 border-b border-r border-zinc-700/30 p-2 transition-colors ${
                  isTodayDay ? "bg-blue-500/10" : "hover:bg-zinc-700/20"
                }`}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isTodayDay ? "text-blue-400" : "text-zinc-300"
                    }`}
                  >
                    {day}
                    {isTodayDay && (
                      <span className="ml-1 text-xs bg-blue-500/20 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-2 py-1 rounded truncate"
                        title={`${event.gameName}: ${event.title}${
                          event.confirmed ? " (Confirmed)" : " (Estimated)"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {event.confirmed && (
                            <span className="text-green-400">
                              <CircleCheck className="w-3 h-3" />
                            </span>
                          )}
                          <span className="font-medium text-zinc-200">
                            {event.gameName}
                          </span>
                        </div>
                        <div className="text-zinc-400 truncate">
                          {event.title}
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-zinc-500 px-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-green-400">
            <Check />
          </span>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400">
            <Calendar />
          </span>

          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
