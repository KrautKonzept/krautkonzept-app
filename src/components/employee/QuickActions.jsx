import React, { useState, useEffect, useRef } from "react";
import { Play, Square, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function QuickActions({ onTabChange }) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("quicktimer_start");
    if (saved) {
      setTimerRunning(true);
      setTimerSeconds(Math.floor((Date.now() - parseInt(saved)) / 1000));
    }
  }, []);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        const start = parseInt(localStorage.getItem("quicktimer_start") || Date.now());
        setTimerSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const handleTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
      setTimerSeconds(0);
      localStorage.removeItem("quicktimer_start");
    }
    onTabChange("time");
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <button
        onClick={handleTimer}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
          timerRunning
            ? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
            : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 text-orange-700 hover:from-orange-100 hover:to-amber-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${timerRunning ? "bg-red-500" : "bg-orange-500"}`}>
            {timerRunning ? <Square className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </div>
          <div className="text-left">
            <div className="font-bold text-base">{timerRunning ? "Timer läuft — zur Zeiterfassung" : "⏱ Zeiterfassung öffnen"}</div>
            <div className="text-xs opacity-70">{timerRunning ? "Klicken zum Wechsel zur Zeiterfassung" : "Schnellzugriff auf Zeiterfassung"}</div>
          </div>
        </div>
        {timerRunning && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-2xl font-mono font-bold tabular-nums">{formatTime(timerSeconds)}</span>
          </div>
        )}
      </button>
    </motion.div>
  );
}