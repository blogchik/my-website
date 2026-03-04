"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      dot!.style.left = `${mouseX}px`;
      dot!.style.top = `${mouseY}px`;
    }

    // Ring follows with smooth delay
    function animate() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring!.style.left = `${ringX}px`;
      ring!.style.top = `${ringY}px`;
      requestAnimationFrame(animate);
    }

    function onMouseDown() {
      dot!.classList.add("cursor-click");
      ring!.classList.add("cursor-click");
    }

    function onMouseUp() {
      dot!.classList.remove("cursor-click");
      ring!.classList.remove("cursor-click");
    }

    function onMouseEnterInteractive() {
      dot!.classList.add("cursor-hover");
      ring!.classList.add("cursor-hover");
    }

    function onMouseLeaveInteractive() {
      dot!.classList.remove("cursor-hover");
      ring!.classList.remove("cursor-hover");
    }

    // Attach hover listeners to interactive elements
    function attachHoverListeners() {
      const interactives = document.querySelectorAll(
        'a, button, input, textarea, select, [role="button"]'
      );
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnterInteractive);
        el.addEventListener("mouseleave", onMouseLeaveInteractive);
      });
      return interactives;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    const frame = requestAnimationFrame(animate);
    let interactives = attachHoverListeners();

    // Re-attach on DOM changes (page navigations)
    const observer = new MutationObserver(() => {
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
      });
      interactives = attachHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(frame);
      observer.disconnect();
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} id="cursor-dot" />
      <div ref={ringRef} id="cursor-ring" />
    </>
  );
}
