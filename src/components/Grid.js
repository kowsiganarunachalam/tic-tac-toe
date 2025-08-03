"use client";
import React, { useState } from "react";
import Tile from "./Tile"

export default function Grid({ tiles, onTileClick }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)", gap: "4px" }}>
            {
                tiles.map((value, index) => {
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    return (
                        <Tile
                            key={index}
                            id={`${row},${col}`}  // <-- Add matrix-style ID here
                            value={value}
                            onClick={() => onTileClick(index)}
                        />
                    );
                })
            }
        </div>
    );

}