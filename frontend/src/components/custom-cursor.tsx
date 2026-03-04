"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Enable custom cursor styles only when JS is ready
    document.documentElement.classList.add("custom-cursor-active");

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot!.style.left = `${mouseX}px`;
      dot!.style.top = `${mouseY}px`;
    }

    function animate() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring!.style.left = `${ringX}px`;
      ring!.style.top = `${ringY}px`;
      frameRef.current = requestAnimationFrame(animate);
    }

    function onMouseDown() {
      dot!.classList.add("cursor-click");
      ring!.classList.add("cursor-click");
    }

    function onMouseUp() {
      dot!.classList.remove("cursor-click");
      ring!.classList.remove("cursor-click");
    }

    // Event delegation — no MutationObserver needed
    function onMouseOver(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest?.(INTERACTIVE_SELECTOR);
      if (target) {
        dot!.classList.add("cursor-hover");
        ring!.classList.add("cursor-hover");
      }
    }

    function onMouseOut(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest?.(INTERACTIVE_SELECTOR);
      if (target) {
        dot!.classList.remove("cursor-hover");
        ring!.classList.remove("cursor-hover");
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} id="cursor-dot" />
      <div ref={ringRef} id="cursor-ring" />
    </>
  );
}
