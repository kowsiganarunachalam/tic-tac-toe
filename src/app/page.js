"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from '../components/Loader'
import {gameService} from "../app/api-caller"

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [loading, setLoading] = useState({
    create:false,
    join:false
  });

  const [hoverState, setHoverState] = useState({
    create: false,
    join: false,
    joinstart:false,
    joincancel:false
  });

  useEffect(() => {
    // If you want to reset only certain values:
    localStorage.removeItem("isRoomCreator");
    localStorage.removeItem("roomId");
  }, []);


  const router = useRouter();

  async function handleCreateRoom() {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }

    localStorage.setItem("username", username.trim());
    
    setLoading(e=>({...e,create:true}));
    const newRoomId = await gameService.createRoom(username.trim());
    localStorage.setItem("isRoomCreator", "true");

    // Slight delay to allow loading spinner to render
    setTimeout(() => {
      router.push(`/game/${newRoomId}`);
    }, 300); // 300ms delay – you can increase it to 1000ms if you want to show the loader more
  }


  async function handleJoinRoom() {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!joinRoomId.trim()) {
      alert("Please enter Room ID to join");
      return;
    }
    localStorage.setItem("username", username.trim());

    // In real app, validate room exists via API here before navigating
    setLoading(e=>({...e,join:true}))
    const response = await gameService.joinRoom(joinRoomId,username.trim());
    router.push(`/game/${joinRoomId.trim()}`);
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8,
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Welcome!</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
          fontSize: 16,
          borderRadius: 4,
          border: "1px solid #999",
        }}
      />

      <button
        onClick={handleCreateRoom}
        onMouseEnter={() => setHoverState(e=>({...e,create:true}))}
        onMouseLeave={() => setHoverState(e=>({...e,create:false}))}
        style={{
          width: "100%",
          padding: 10,
          height: "45px",
          marginBottom: 10,
          fontSize: 16,
          cursor: "pointer",
          borderRadius: 4,
          backgroundColor: hoverState.create ? "white" : "#4CAF50",
          color: hoverState.create ? "black" : "white",
          border: "none",
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          textAlign: "center",
          transitionDuration: "0.2s"
        }}
      >
        {loading.create ? (
          <div style={{ transform: "scale(0.4)" }}>
            <Loader />
          </div>
        ) : "Create Room"}
      </button>

      {!showJoinInput && (
        <button
          onClick={() => setShowJoinInput(true)}
          onMouseEnter={() => setHoverState(e=>({...e,join:true}))}
          onMouseLeave={() => setHoverState(e=>({...e,join:false}))}
          style={{
            width: "100%",
            padding: 10,
            height: "45px",
            fontSize: 16,
            cursor: "pointer",
            borderRadius: 4,
            backgroundColor: hoverState.join ? "white" : "#2196F3",
            color: hoverState.join ? "black" : "white",
            border: "none",
          }}
        >
          Join Room
        </button>
      )}

      {showJoinInput && (
        <>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 10,
              marginBottom: 10,
              fontSize: 16,
              borderRadius: 4,
              border: "1px solid #999",
              letterSpacing: 2,
            }}
          />
          <button
            onClick={handleJoinRoom}
            onMouseEnter={() => setHoverState(e=>({...e,joinstart:true}))}
            onMouseLeave={() => setHoverState(e=>({...e,joinstart:false}))}
            style={{
              width: "100%",
              padding: 10,
              height: "45px",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 4,
              backgroundColor: hoverState.joinstart?"white":"#2196F3",
              color: hoverState.joinstart?"black":"white",
              border: "none",
              marginBottom: 10,
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              textAlign: "center",
              transitionDuration: "0.2s"
            }}
          >
            {loading.join ? (
          <div style={{ transform: "scale(0.4)" }}>
            <Loader />
          </div>
        ) : "Join"}
          </button>
          <button
            onClick={() => setShowJoinInput(false)}
            onMouseEnter={() => setHoverState(e=>({...e,joincancel:true}))}
            onMouseLeave={() => setHoverState(e=>({...e,joincancel:false}))}
            style={{
              width: "100%",
              height: "45px",
              padding: 10,
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 4,
              backgroundColor: hoverState.joincancel?"white":"#f44336",
              color: hoverState.joincancel?"black":"white",
              border: "none",
            }}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
