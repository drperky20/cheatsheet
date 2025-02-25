import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CanvasSetupProps {
  width?: number;
  height?: number;
  className?: string;
  onSetup?: (context: CanvasRenderingContext2D) => void;
}

const CanvasSetup: React.FC<CanvasSetupProps> = ({
  width = 800,
  height = 600,
  className = '',
  onSetup,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale context to match CSS size
    context.scale(dpr, dpr);

    // Apply base styles
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    context.lineWidth = 2;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Call setup callback
    if (onSetup) {
      onSetup(context);
    }
  }, [width, height, onSetup]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/20 ${className}`}
      />
    </motion.div>
  );
};

export default CanvasSetup;
