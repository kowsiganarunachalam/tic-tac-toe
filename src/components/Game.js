"use client";

import React, { useEffect, useState } from "react";
import Grid from "./Grid";
import { gameService } from "../../src/app/api-caller"; // import your service
import Popup from "./Popup";

export default function Game({  roomId } ) {
  const [tiles, setTiles] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [player, setPlayer] = useState("X"); // optionally track your player symbol
  const [status, setStatus] = useState("");
  const [alert, setAlert] = useState("");
  const [type, setType] = useState("");
  const isRoomCreator = localStorage.getItem("isRoomCreator") === "true";
  //console.log(isRoomCreator);
  useEffect(() => {
    async function setup() {
      try {
        if (roomId) {
          if (isRoomCreator) {
            // Created room, so no joinRoom call
            setStatus(`Room created: ${roomId}, waiting for player 2...`);
          } else {
            // Join existing room only if not creator
            await gameService.joinRoom(roomId);
            setStatus(`Joined room ${roomId}`);
          }
        } else {
          // No roomId, create new room (if this case happens)
          // const newRoomId = await gameService.createRoom();
          // setStatus(`Room created: ${newRoomId}, waiting for player 2...`);
        }

        // Subscribe to SignalR events
        gameService.on("RoomCreated", (newRoomId) => {
          setStatus(`Room created: ${newRoomId}`);
          console.log(newRoomId);
          // Save roomId to state if you want to display or use it
        });

        gameService.on("StartGame", () => {
          setStatus("Second player joined, game start!");
        });

        gameService.on("ReceiveMove", ({ player: movedPlayer, row, col, nextTurn }) => {
          setTiles(prev => {
            const updated = [...prev];
            const index = row * 3 + col;
            updated[index] = movedPlayer;
            setPlayer(nextTurn);
            return updated;
          });
          setTurn(nextTurn);
        });

        gameService.on("GameOver", ({ player:movedPlayer, row, col, nextTurn }) => {
          setTiles(prev => {
            const updated = [...prev];
            const index = row * 3 + col;
            updated[index] = movedPlayer;
            return updated;
          });
          setStatus(movedPlayer ? `Player ${movedPlayer} wins!` : "Game ended in a draw.");
        });

        gameService.on("Error", (message) => {
          setAlert(message);
        });
        gameService.on("Alert", (type,message) => {
          setAlert(message);
          setType(type);
        });
        gameService.on("ConnectionReconnecting", () => {
          setStatus("Connection lost, trying to reconnect...");
        });

        gameService.on("ConnectionReconnected", () => {
          setStatus("Reconnected to server.");
        });

        gameService.on("ConnectionClosed", (error) => {
          setStatus("Disconnected from server.");
          console.error("Connection closed:", error);
        });
      } catch (error) {
        //console.log(error);
        setStatus(`Setup error: ${error.message}`);
      }
    }

    setup();

  }, [isRoomCreator, roomId]);

  async function handleTileClick(index) {
    const row = Math.floor(index / 3);
    const col = index % 3;

    if (tiles[index] !== "") return;
    //console.log(tiles);
    try {
      await gameService.move(player, row, col);
    } catch (err) {
      console.error(err);
      setStatus(`Move failed: ${err.message}`);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <h2>{status}</h2>
      <h3>Turn: {turn}</h3>
      <Grid tiles={tiles} onTileClick={handleTileClick} player={player} />
      {alert && (<Popup message={alert} type={type} onClose={()=>setAlert(null)}></Popup>)}
     
    </div>
  );
}
