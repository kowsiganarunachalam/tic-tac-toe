// components/Game.js
"use client";

import React, { useState } from "react";
import Grid from "./Grid";

export default function Game() {
  const [tiles, setTiles] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");

  function handleTileClick(index) {
    if (tiles[index] !== "") return;

    const updatedTiles = [...tiles];
    updatedTiles[index] = turn;
    setTiles(updatedTiles);
    setTurn(turn === "X" ? "O" : "X");
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center", // horizontal center
        alignItems: "center",     // vertical center
        height: "100vh",          // full height viewport
        flexDirection: "column",  // stack children vertically
      }}
    >
      <h2>Turn: {turn}</h2>
      <Grid tiles={tiles} onTileClick={handleTileClick} />
    </div>
  );
}
