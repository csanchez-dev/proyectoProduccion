import React from "react";

export type DayOption = {
  id: string;
  label: string;
};

type Props = {
  days: DayOption[];
  activeDayId: string;
  onChange: (dayId: string) => void;
};

export default function DayTabs({ days, activeDayId, onChange }: Props) {
  return (
    <div className="dayTabs">
      {days.map((d) => {
        const isActive = d.id === activeDayId;

        return (
          <button
              key={`${d.id}-${d.id === activeDayId ? "on" : "off"}`}
          
            className={`dayTab ${isActive ? "active" : ""}`}
            onClick={() => onChange(d.id)}
          >
            <span className="dayTabIcon">📅</span>
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
