import React from "react";
import { motion } from "framer-motion";

export default function TrustRow() {
  const stats = [
    { value: "10+", label: "Ventures begleitet" },
    { value: "Seit 2024", label: "aktiv" },
    { value: "Bayern &", label: "DACH" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-8 pt-8 border-t border-gray-200"
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-sm font-semibold text-orange-600">{stat.value}</div>
          <div className="text-xs text-gray-600">{stat.label}</div>
        </div>
      ))}
    </motion.div>
  );
}