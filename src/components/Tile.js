"use client";
import React, { useState } from "react";

export default function Tile({ value, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100px",
        height: "100px",
        borderRadius: "10px",
        color: "black",
        backgroundColor: hover ? "#FFC107" : "yellow",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "40px",
        cursor: "pointer",
        userSelect: "none",
        border: "1px solid black",
      }}
    >
      {value}
    </div>
  );
}
