"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

// City coordinates [lat, lng]
const locations: [number, number][] = [
  [41.3111, 69.2797],  // Tashkent
  [48.8566, 2.3522],   // Paris
  [40.7128, -74.006],  // New York
  [35.6762, 139.6503], // Tokyo
  [51.5074, -0.1278],  // London
  [-33.8688, 151.2093],// Sydney
  [55.7558, 37.6173],  // Moscow
  [1.3521, 103.8198],  // Singapore
  [37.5665, 126.978],  // Seoul
  [25.2048, 55.2708],  // Dubai
  [-23.5505, -46.6333],// São Paulo
  [28.6139, 77.209],   // Delhi
  [30.0444, 31.2357],  // Cairo
  [39.9042, 116.4074], // Beijing
  [34.0522, -118.2437],// Los Angeles
  [52.52, 13.405],     // Berlin
  [43.6532, -79.3832], // Toronto
  [-1.2921, 36.8219],  // Nairobi
  [59.3293, 18.0686],  // Stockholm
  [13.7563, 100.5018], // Bangkok
];

// Each marker has its own independent pulse cycle
interface PulsingMarker {
  location: [number, number];
  phase: number;    // current phase in cycle (0-1)
  speed: number;    // how fast it pulses
  maxSize: number;  // peak size
  active: boolean;  // currently glowing or fading
}

function createPulsingMarkers(): PulsingMarker[] {
  return locations.map((location) => ({
    location,
    phase: Math.random(),          // start at random point in cycle
    speed: 0.002 + Math.random() * 0.004, // each has different speed
    maxSize: 0.03 + Math.random() * 0.03,
    active: Math.random() > 0.6,   // ~40% start active
  }));
}

// Adaptive mapSamples: lower on low-end/mobile to reduce GPU load
function getMapSamples(): number {
  const isLowEnd =
    window.devicePixelRatio <= 1 ||
    (typeof navigator.hardwareConcurrency !== "undefined" &&
      navigator.hardwareConcurrency <= 4);
  return isLowEnd ? 16000 : 20000;
}

// Angular velocity: same as 0.002 rad/frame @ 60 fps, but frame-rate independent
const PHI_PER_MS = 0.002 * (60 / 1000); // 0.00012 rad/ms

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const pulsingMarkersRef = useRef(createPulsingMarkers());
  const phiRef = useRef(0);
  const renderSizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  // Pre-allocated output array — reused every frame to avoid GC pressure
  const markerOutputRef = useRef(
    locations.map((location) => ({ location, size: 0 }))
  );

  // Timestamp for frame-rate independent rotation
  const lastTimestampRef = useRef(0);

  const syncCanvasSize = useCallback(() => {
    if (!canvasRef.current) {
      return { hasSize: false, dprChanged: false };
    }

    const cssWidth = canvasRef.current.offsetWidth;
    const cssHeight = canvasRef.current.offsetHeight;

    if (cssWidth === 0 || cssHeight === 0) {
      return { hasSize: false, dprChanged: false };
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rawWidth = Math.round(cssWidth * dpr);
    const rawHeight = Math.round(cssHeight * dpr);

    // Cap physical resolution — globe is a decorative bg at 40% opacity
    const MAX_PX = 1200;
    const capScale = Math.min(1, MAX_PX / Math.max(rawWidth, rawHeight));
    const width = Math.round(rawWidth * capScale);
    const height = Math.round(rawHeight * capScale);
    const effectiveDpr = cssWidth > 0 ? width / cssWidth : 1;

    const dprChanged = renderSizeRef.current.dpr !== effectiveDpr;

    if (canvasRef.current.width !== width) {
      canvasRef.current.width = width;
    }
    if (canvasRef.current.height !== height) {
      canvasRef.current.height = height;
    }

    renderSizeRef.current = { width, height, dpr: effectiveDpr };

    return { hasSize: true, dprChanged };
  }, []);

  const initGlobe = useCallback(() => {
    if (!canvasRef.current) return;
    const { hasSize } = syncCanvasSize();
    if (!hasSize) return;

    if (globeRef.current) {
      globeRef.current.destroy();
    }

    // Reset timestamp so the first frame doesn't get a stale delta
    lastTimestampRef.current = 0;

    const { width, height, dpr } = renderSizeRef.current;

    globeRef.current = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width,
      height,
      phi: phiRef.current,
      theta: 0.25,
      dark: 0,
      diffuse: 0.8,
      mapSamples: getMapSamples(),
      mapBrightness: 3,
      baseColor: [1, 1, 1],
      markerColor: [0.886, 0.518, 0.075], // #E28413
      glowColor: [1, 1, 1],
      scale: 1,
      offset: [0, 0],
      markers: [],
      onRender: (state) => {
        // Frame-rate independent rotation
        const now = performance.now();
        const delta = lastTimestampRef.current === 0
          ? 16.67
          : now - lastTimestampRef.current;
        lastTimestampRef.current = now;
        phiRef.current += PHI_PER_MS * Math.min(delta, 50);

        state.phi = phiRef.current;
        state.width = renderSizeRef.current.width;
        state.height = renderSizeRef.current.height;

        // Update markers and fill pre-allocated output array in one pass
        const markers = pulsingMarkersRef.current;
        const output = markerOutputRef.current;
        let outputCount = 0;

        for (const m of markers) {
          m.phase += m.speed;

          if (m.phase >= 1) {
            m.phase = 0;
            m.active = Math.random() > 0.5;
            m.speed = 0.002 + Math.random() * 0.004;
            m.maxSize = 0.03 + Math.random() * 0.03;
          }

          if (m.active) {
            output[outputCount].location = m.location;
            output[outputCount].size = m.maxSize * Math.sin(m.phase * Math.PI);
            outputCount++;
          }
        }

        // Zero-fill unused slots instead of resizing array (avoids GC)
        for (let i = outputCount; i < output.length; i++) {
          output[i].size = 0;
        }
        state.markers = output;
      },
    });
  }, [syncCanvasSize]);

  useEffect(() => {
    initGlobe();

    let resizeFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const { hasSize, dprChanged } = syncCanvasSize();
        if (!hasSize || !globeRef.current) return;
        if (dprChanged) {
          initGlobe();
        }
      });
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    // Pause when tab is hidden, resume when visible
    function onVisibilityChange() {
      if (document.hidden) {
        if (globeRef.current) {
          globeRef.current.destroy();
          globeRef.current = null;
        }
      } else {
        initGlobe();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Pause rendering when globe is scrolled out of view
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!globeRef.current) initGlobe();
        } else {
          if (globeRef.current) {
            globeRef.current.destroy();
            globeRef.current = null;
          }
        }
      },
      { threshold: 0.01 }
    );

    if (canvasRef.current) {
      intersectionObserver.observe(canvasRef.current);
    }

    return () => {
      cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (globeRef.current) {
        globeRef.current.destroy();
      }
    };
  }, [initGlobe, syncCanvasSize]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
}
