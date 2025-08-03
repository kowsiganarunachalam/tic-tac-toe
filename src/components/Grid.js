"use client";
import React, { useState } from "react";
import Tile from "./Tile"

export default function Grid({ tiles, onTileClick }) {
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(3,100px)", gap: "4px" }}>
        {
            tiles.map(
                (value, index) => (
                <Tile key={index} value={value} onClick={() => onTileClick(index)} />
                )
            )
        }
    </div>
}