"use client";

import { useParams } from "next/navigation";
import Game from "../../../components/Game"

export default function GamePage() {
  const { roomId } = useParams();
  return (
    <>
      <div>
        <h1>Game Room: {roomId}</h1>
        <p>This is the game page.</p>
      </div>
      <Game />
    </>
  );

}
