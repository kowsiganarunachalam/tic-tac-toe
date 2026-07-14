"use client";
import { useEffect, useRef, useState } from "react";

export default function PlayerSquare({
  className = "",
  name,
  active,
  symbol,
  duration = 8000,
  warningThreshold = 0.25,
  onTimeout,
}) {
  const borderRef = useRef(null);
  const [remaining, setRemaining] = useState(duration / 1000);

  useEffect(() => {
    let frameId;
    let start;

    if (active && name) {
      start = performance.now();

      function frame(t) {
        const elapsed = t - start;
        const p = Math.min(1, elapsed / duration); // progress %
        const angle = p * 360;

        if (borderRef.current) {
          borderRef.current.style.background = `conic-gradient(var(--c) ${angle}deg, transparent 0)`;
        }

        // update countdown seconds
        const secsLeft = Math.ceil((duration - elapsed) / 1000);
        setRemaining(secsLeft > 0 ? secsLeft : 0);

        // change color close to timeout
        if (p >= 1 - warningThreshold) {
          borderRef.current?.style.setProperty("--c", "red");
        } else {
          borderRef.current?.style.setProperty("--c", "limegreen");
        }

        if (p < 1) {
          frameId = requestAnimationFrame(frame);
        } else {
          onTimeout?.();
        }
      }

      frameId = requestAnimationFrame(frame);
    } else {
      // reset when inactive
      setRemaining(duration / 1000);
      if (borderRef.current) {
        borderRef.current.style.background =
          "conic-gradient(transparent 0deg, transparent 360deg)";
        borderRef.current.style.setProperty("--c", "limegreen");
      }
    }

    return () => cancelAnimationFrame(frameId);
  }, [active, duration, warningThreshold, onTimeout, name]);

  // player initials
  const initials =
    typeof name === "string" && name.trim()
      ? name
          .trim()
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";

  return (
    <div
      className={className}
      ref={borderRef}
      aria-label={`${name || "Waiting player"} timer`}
      style={{
        "--c": "limegreen",
        position: "relative",
        width: "clamp(96px, 28vw, 220px)",
        height: "clamp(96px, 28vw, 220px)",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        background: "conic-gradient(transparent 0deg, transparent 360deg)",
        margin: "auto",
        transition: "background 0.4s ease-in-out",
      }}
    >
      <div
        style={{
          width: "calc(100% - 20px)",
          height: "calc(100% - 20px)",
          borderRadius: "10px",
          background: active ? "#4f2f83" : "#5f5f6f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          flexDirection: "column",
          gap: "4px",
          textAlign: "center",
          padding: "8px",
        }}
      >
        <div style={{ fontSize: "clamp(28px, 8vw, 80px)", lineHeight: 1 }}>
          {initials || "..."}
        </div>
        <div style={{ fontSize: "clamp(12px, 3vw, 18px)", lineHeight: 1.1 }}>
          {symbol ? `${symbol} - ` : ""}
          {active ? `${remaining}s` : "Ready"}
        </div>
      </div>
    </div>
  );
}
