"use client";
import React, { useState } from "react";

export default function Tile({ value, onClick, player }) {
  const [hover, setHover] = useState(false);
  const [ripple, setRipple] = useState(null);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Dynamic ripple color based on player
    const rippleColor =
      value === "X" ? "#2ecc71aa" : value === "O" ? "#3498dbaa" : "#ffffff55";

    setRipple({ x, y, color: rippleColor });

    if (onClick) onClick(e);
  };

  const handleAnimationEnd = () => {
    setRipple(null); // remove ripple once animation ends
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-[100px] h-[100px] flex items-center justify-center
                 rounded-lg border border-black cursor-pointer select-none
                 relative overflow-hidden transition-colors duration-500 ease-in-out"
      style={{
        width: "100px",
        height: "100px",
        borderRadius: "10px",
        color: "black",
        backgroundColor:
          value === "X"
            ? "#4CAF50"
            : value === "O"
            ? "#2196F3"
            : !value && hover
            ? "#FFC107"
            : "yellow",
        fontSize: "40px",
        userSelect: "none",
      }}
    >
      {value}

      {ripple && (
        <span
          className="absolute rounded-full opacity-0 animate-[ripple_0.6s_linear]"
          style={{
            top: ripple.y - 50,
            left: ripple.x - 50,
            width: 100,
            height: 100,
            backgroundColor: ripple.color,
          }}
          onAnimationEnd={handleAnimationEnd}
        />
      )}
    </div>
  );
}
