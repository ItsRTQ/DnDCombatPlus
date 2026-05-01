import { useEffect, useRef } from "react";

type Blob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const maybeCanvas = canvasRef.current;
    if (!maybeCanvas) return;

    const canvas: HTMLCanvasElement = maybeCanvas;

    const maybeContext = canvas.getContext("2d");
    if (!maybeContext) return;

    const ctx: CanvasRenderingContext2D = maybeContext;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const blobs: Blob[] = [];

    function resize() {
      dpr = Math.max(window.devicePixelRatio || 1, 1);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createBlobs();
    }

    function createBlobs() {
      blobs.length = 0;

      const count = Math.max(10, Math.min(16, Math.floor(width / 110)));

      for (let i = 0; i < count; i++) {
        blobs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          r: 90 + Math.random() * 120,
        });
      }
    }

    function updateBlobs() {
      for (const blob of blobs) {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x - blob.r < 0 || blob.x + blob.r > width) {
          blob.vx *= -1;
        }

        if (blob.y - blob.r < 0 || blob.y + blob.r > height) {
          blob.vy *= -1;
        }
      }
    }

    function drawBase() {
      ctx.clearRect(0, 0, width, height);

      // Base black background
      ctx.fillStyle = "#020202";
      ctx.fillRect(0, 0, width, height);

      // Goo blobs
      for (const blob of blobs) {
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.r
        );

        gradient.addColorStop(0, "rgba(18,18,18,0.95)");
        gradient.addColorStop(0.55, "rgba(10,10,10,0.75)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function animate() {
      updateBlobs();
      drawBase();

      animationFrameId = window.requestAnimationFrame(animate);
    }

    resize();
    animate();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
