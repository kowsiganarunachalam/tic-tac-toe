"use client";
import { useState } from "react";

export default function Popup({ message, type = "info", onClose }) {
  // Tailwind colors for different alert types
  const typeStyles = {
    Success: "bg-green-100 text-green-800 border-green-400",
    Error: "bg-red-100 text-red-800 border-red-400",
    Warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
    Info: "bg-blue-100 text-blue-800 border-blue-400",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 alert-popup">
      <div
        className={`rounded-lg p-6 shadow-lg border transition-all duration-300 ease-in-out ${typeStyles[type]}`}
      >
        <p className="text-lg font-medium">{message}</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white rounded-md text-sm font-semibold shadow hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
