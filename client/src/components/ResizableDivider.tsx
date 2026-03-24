"use client";

import React, { useRef, useEffect, useState } from "react";

interface ResizableDividerProps {
  onResize: (percent: number) => void;
  minPercent?: number;
  maxPercent?: number;
  direction?: "horizontal" | "vertical";
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ResizableDivider({
  onResize,
  minPercent = 20,
  maxPercent = 80,
  direction = "horizontal",
  containerRef,
}: ResizableDividerProps) {
  const isDragging = useRef(false);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Store latest values in refs so the mousemove handler NEVER goes stale
  const onResizeRef = useRef(onResize);
  const minRef = useRef(minPercent);
  const maxRef = useRef(maxPercent);
  const directionRef = useRef(direction);

  useEffect(() => { onResizeRef.current = onResize; }, [onResize]);
  useEffect(() => { minRef.current = minPercent; }, [minPercent]);
  useEffect(() => { maxRef.current = maxPercent; }, [maxPercent]);
  useEffect(() => { directionRef.current = direction; }, [direction]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        let percent: number;
        if (directionRef.current === "horizontal") {
          percent = ((e.clientX - rect.left) / rect.width) * 100;
        } else {
          percent = ((e.clientY - rect.top) / rect.height) * 100;
        }

        const clamped = Math.min(Math.max(percent, minRef.current), maxRef.current);
        onResizeRef.current(clamped);
      });
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setActive(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [containerRef]); // only runs once — all values via refs

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setActive(true);
    document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };

  const isHorizontal = direction === "horizontal";
  const isHighlighted = active || hovered;

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: isHorizontal ? "4px" : "100%",
        height: isHorizontal ? "100%" : "4px",
        flexShrink: 0,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isHorizontal ? "col-resize" : "row-resize",
        background: isHighlighted ? "#4f46e5" : "#1f2937",
        transition: "background 0.15s ease",
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isHorizontal ? "16px" : "100%",
          height: isHorizontal ? "100%" : "16px",
          cursor: isHorizontal ? "col-resize" : "row-resize",
          zIndex: 21,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 22,
          display: "flex",
          flexDirection: isHorizontal ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "3px",
          pointerEvents: "none",
          opacity: isHighlighted ? 1 : 0.5,
          transition: "opacity 0.15s ease",
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: isHighlighted ? "#a5b4fc" : "#6b7280",
              transition: "background 0.15s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}