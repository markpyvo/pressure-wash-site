'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Slider position is the % of after image visible
  const leftClipPercent = Math.max(0, 100 - sliderPosition);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setSliderPosition(newPosition);
    });
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      updatePosition(e.touches[0].clientX);
    },
    [isDragging, updatePosition]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + step));
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  return (
    <div className="flex items-center justify-center w-screen min-h-screen">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="mb-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center" style={{ color: '#2d3a6b' }}>
            See the Difference
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Drag the slider to compare before and after
          </p>
        </div>

        <div className="flex justify-center" style={{ width: '100%' }}>
          <div className="rounded-3xl overflow-hidden" style={{ width: '80%', maxWidth: '800px' }}>
          <div
            ref={containerRef}
            className="relative overflow-hidden select-none bg-gray-200"
            style={{
              aspectRatio: '16 / 9',
              maxHeight: '500px',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Before and after image comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPosition)}
        tabIndex={0}
      >
        {/* After Image - Full Width Static Background */}
        <Image
          src="/houseafter.jpg"
          alt="After pressure washing"
          fill
          className="object-cover"
          priority
          draggable={false}
        />

        {/* Before Image - Overlays from Left, Clipped from Right */}
        <Image
          src="/housebefore.jpg"
          alt="Before pressure washing"
          fill
          className="object-cover"
          priority
          draggable={false}
          style={{
            clipPath: `inset(0 ${leftClipPercent}% 0 0)`,
          }}
        />

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 shadow-xl pointer-events-none will-change-transform"
          style={{ left: `${sliderPosition}%`, backgroundColor: '#2d3a6b' }}
          aria-hidden="true"
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-xl p-2 sm:p-3" style={{ backgroundColor: '#2d3a6b' }}>
            {/* Left-Right Arrow */}
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm font-semibold pointer-events-none">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm font-semibold pointer-events-none">
          After
        </div>
      </div>

        </div>
        </div>
      </div>
    </div>
  );
}

