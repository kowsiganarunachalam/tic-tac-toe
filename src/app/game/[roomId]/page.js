"use client";

import { useParams } from "next/navigation";
import Game from "../../../components/Game";

import { useState } from "react";


export default function GamePage() {
  const { roomId } = useParams();

  return (
    <>
      <Game roomId={roomId} />
    </>
  );
}
