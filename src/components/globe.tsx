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

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const pulsingMarkersRef = useRef(createPulsingMarkers());
  const phiRef = useRef(0);

  const initGlobe = useCallback(() => {
    if (!canvasRef.current) return;

    if (globeRef.current) {
      globeRef.current.destroy();
    }

    const width = canvasRef.current.offsetWidth;
    const height = canvasRef.current.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio, 1.5);

    globeRef.current = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width: width * dpr,
      height: height * dpr,
      phi: phiRef.current,
      theta: 0.25,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.886, 0.518, 0.075], // #E28413
      glowColor: [1, 1, 1],
      scale: 1,
      offset: [0, 0],
      markers: [],
      onRender: (state) => {
        state.phi = phiRef.current;
        phiRef.current += 0.002;

        const markers = pulsingMarkersRef.current;

        // Update each marker independently
        for (const m of markers) {
          m.phase += m.speed;

          if (m.phase >= 1) {
            m.phase = 0;
            // Randomly toggle active state
            m.active = Math.random() > 0.5;
            m.speed = 0.002 + Math.random() * 0.004;
            m.maxSize = 0.03 + Math.random() * 0.03;
          }
        }

        // Smooth sine-based pulse: 0 → peak → 0
        state.markers = markers
          .filter((m) => m.active)
          .map((m) => ({
            location: m.location,
            size: m.maxSize * Math.sin(m.phase * Math.PI),
          }));
      },
    });
  }, []);

  useEffect(() => {
    initGlobe();

    // Debounced resize — avoid destroying/recreating globe on every pixel
    let resizeTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initGlobe();
      }, 300);
    });

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
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

    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (globeRef.current) {
        globeRef.current.destroy();
      }
    };
  }, [initGlobe]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ contain: "layout paint size", aspectRatio: "1" }}
    />
  );
}
