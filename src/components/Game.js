"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Grid from "./Grid";
import { gameService } from "../../src/app/api-caller"; // import your service
import Popup from "./Popup";
import PlayerSquare from "./PlayerSquare";

export default function Game({  roomId } ) {
  const router = useRouter();
  const savedPlayers = useMemo(() => gameService.getPlayers(roomId) || {}, [roomId]);
  const [tiles, setTiles] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [player, setPlayer] = useState("X"); // optionally track your player symbol
  const [status, setStatus] = useState("");
  const [alert, setAlert] = useState("");
  const [type, setType] = useState("Info");
  const [firstPlayer,setFirstPlayer]=useState(savedPlayers.firstPlayer || null);
  const[secondPlayer,setSecondPlayer]=useState(savedPlayers.secondPlayer || null);
  const [firstPlayerActive,setFirstPlayerActive]=useState(false);
  const [secondPlayerActive,setSecondPlayerActive]=useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState("");
  const [isCreatingReplay, setIsCreatingReplay] = useState(false);
  const firstPlayerRef = useRef(firstPlayer);
  const secondPlayerRef = useRef(secondPlayer);
  const gameOverRef = useRef(gameOver);
  const isRoomCreator =
    typeof window !== "undefined" && localStorage.getItem("isRoomCreator") === "true";

  const stopTimers = useCallback(() => {
    setFirstPlayerActive(false);
    setSecondPlayerActive(false);
  }, []);

  const getWinnerMessage = useCallback((payload) => {
    const winner =
      typeof payload === "string"
        ? payload
        : payload?.winner || payload?.player || payload?.movedPlayer || null;

    if (!winner || winner === "Draw") {
      return "Game ended in a draw.";
    }

    const winnerName = winner === "X" ? firstPlayerRef.current : winner === "O" ? secondPlayerRef.current : winner;
    return `${winnerName || `Player ${winner}`} wins!`;
  }, []);

  const goHome = useCallback(() => {
    localStorage.removeItem("isRoomCreator");
    localStorage.removeItem("roomId");
    router.push("/");
  }, [router]);

  const playAgain = useCallback(async () => {
    const username = localStorage.getItem("username");

    if (!username) {
      goHome();
      return;
    }

    setIsCreatingReplay(true);
    try {
      const newRoomId = await gameService.createRoom(username);
      localStorage.setItem("isRoomCreator", "true");
      localStorage.setItem("roomId", newRoomId);
      router.push(`/game/${newRoomId}`);
    } catch (error) {
      setAlert(`Could not start a new game: ${error.message}`);
      setType("Error");
    } finally {
      setIsCreatingReplay(false);
    }
  }, [goHome, router]);

  const handleTimeout = useCallback(async (timedOutPlayer) => {
    if (gameOverRef.current) return;

    try {
      await gameService.autoMove(roomId, timedOutPlayer);
    } catch (error) {
      setAlert(`Auto move failed: ${error.message}`);
      setType("Error");
    }
  }, [roomId]);

  useEffect(() => {
    firstPlayerRef.current = firstPlayer;
  }, [firstPlayer]);

  useEffect(() => {
    secondPlayerRef.current = secondPlayer;
  }, [secondPlayer]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);
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
            setFirstPlayerActive(true);
          }
        } else {
          // No roomId, create new room (if this case happens)
          // const newRoomId = await gameService.createRoom();
          // setStatus(`Room created: ${newRoomId}, waiting for player 2...`);
        }

        // Subscribe to SignalR events
        gameService.on("RoomCreated", (newRoomId,firstPlayer) => {
          console.log(newRoomId,firstPlayer);
          setStatus(`Room created: ${newRoomId}`);
          setFirstPlayer(firstPlayer);
          console.log(newRoomId);
          console.log(firstPlayer);
          // Save roomId to state if you want to display or use it
        });

        gameService.on("StartGame", (roomId,firstPlayer,secondPlayer) => {
          setStatus("Second player joined, game start!");
          setFirstPlayer(firstPlayer);
          setSecondPlayer(secondPlayer);
          setGameOver(false);
          setWinnerMessage("");
          setTurn("X");
          setPlayer("X");
          setFirstPlayerActive(true);
          setSecondPlayerActive(false);
          console.log(secondPlayer);
        });

        gameService.on("ReceiveMove", ({ player: movedPlayer, row, col, nextTurn }) => {
          if (gameOverRef.current) return;

          setTiles(prev => {
            const updated = [...prev];
            const index = row * 3 + col;
            updated[index] = movedPlayer;
            setPlayer(nextTurn);
            return updated;
          });
          setTurn(nextTurn);
          if(nextTurn=="X"){
            setSecondPlayerActive(false);
            setFirstPlayerActive(true);
          }else{
            setFirstPlayerActive(false);
            setSecondPlayerActive(true);
          }
        });

        gameService.on("GameOver", (payload) => {
          if (payload && typeof payload === "object" && Number.isInteger(payload.row) && Number.isInteger(payload.col)) {
            setTiles(prev => {
              const updated = [...prev];
              const index = payload.row * 3 + payload.col;
              updated[index] = payload.player || payload.movedPlayer || updated[index];
              return updated;
            });
          }

          const message = getWinnerMessage(payload);
          stopTimers();
          setGameOver(true);
          setWinnerMessage(message);
          setStatus(message);
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

  }, [getWinnerMessage, isRoomCreator, roomId, stopTimers]);

  async function handleTileClick(index) {
    if (gameOver) return;

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
    <div className="game-room">
    <PlayerSquare className="game-player-x" name={firstPlayer} symbol="X" active={!gameOver && firstPlayerActive} onTimeout={() => handleTimeout("X")}/>
    <div
      className="game-board-panel"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minWidth: "min(100%, 320px)",
        flexDirection: "column",
        gap: "10px",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 700 }}>{status}</h2>
      <h3 style={{ fontSize: "clamp(16px, 4vw, 22px)" }}>Turn: {turn}</h3>
      <Grid tiles={tiles} onTileClick={handleTileClick} player={player} />
      {alert && (<Popup message={alert} type={type} onClose={()=>setAlert(null)}></Popup>)}
      {gameOver && winnerMessage && (
        <Popup
          message={winnerMessage}
          type="Success"
          primaryAction={{
            label: isCreatingReplay ? "Starting..." : "Play Again",
            onClick: playAgain,
            disabled: isCreatingReplay,
            className: "bg-green-600 text-white hover:bg-green-700",
          }}
          secondaryAction={{
            label: "Home",
            onClick: goHome,
            className: "bg-white text-gray-800 hover:bg-gray-100",
          }}
        />
      )}
     
    </div>
    <PlayerSquare className="game-player-o" name={secondPlayer} symbol="O" active={!gameOver && secondPlayerActive} onTimeout={() => handleTimeout("O")}/>
    </div>
  );
}
