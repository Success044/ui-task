import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { galleryImages } from "../data/content";

const gallerySlides = [...galleryImages, ...galleryImages];

export function ImageGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointer: number;
    startX: number;
    scrollLeft: number;
    lastX: number;
    lastTime: number;
    velocity: number;
  } | null>(null);
  const glideRef = useRef<{ stop: () => void } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [visibleFraction, setVisibleFraction] = useState(0.5);

  const updateProgress = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setPosition(maxScroll > 0 ? track.scrollLeft / maxScroll : 0);
    setVisibleFraction(track.clientWidth / track.scrollWidth);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = 0;
    const observer = new ResizeObserver(updateProgress);
    observer.observe(track);
    updateProgress();
    return () => {
      observer.disconnect();
      glideRef.current?.stop();
    };
  }, [updateProgress]);

  function stopGlide() {
    glideRef.current?.stop();
    glideRef.current = null;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    stopGlide();
    const track = event.currentTarget;
    dragRef.current = {
      pointer: event.pointerId,
      startX: event.clientX,
      scrollLeft: track.scrollLeft,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
    };
    track.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag && drag.pointer === event.pointerId) {
      const now = performance.now();
      const velocity =
        (drag.lastX - event.clientX) / Math.max(16, now - drag.lastTime);
      drag.velocity = drag.velocity * 0.35 + velocity * 0.65;
      drag.lastX = event.clientX;
      drag.lastTime = now;
      event.currentTarget.scrollLeft =
        drag.scrollLeft - (event.clientX - drag.startX);
    }
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    const track = event.currentTarget;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (
      event.type !== "pointerup" ||
      Math.abs(drag.lastX - drag.startX) < 3 ||
      performance.now() - drag.lastTime > 150 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    // Carry mouse-drag momentum into the final scroll position.
    const direction = Math.sign(drag.velocity || drag.startX - drag.lastX);
    const distance = Math.min(
      track.clientWidth * 0.65,
      Math.max(120, Math.abs(drag.velocity) * 320),
    );
    const target = Math.max(
      0,
      Math.min(
        track.scrollWidth - track.clientWidth,
        track.scrollLeft + direction * distance,
      ),
    );
    glideRef.current = animate(track.scrollLeft, target, {
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        track.scrollLeft = value;
      },
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    stopGlide();
    const track = event.currentTarget;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollBy({
      left: track.clientWidth * (event.key === "ArrowRight" ? 0.8 : -0.8),
      behavior: reduced ? "instant" : "smooth",
    });
  }

  return (
    <div className="gallery">
      <div className="gallery-window">
        <div
          ref={trackRef}
          className={`gallery-track flex ${dragging ? "is-dragging" : ""}`}
          role="region"
          aria-label="Project images. Drag, swipe, or use the left and right arrow keys."
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onLostPointerCapture={() => {
            dragRef.current = null;
            setDragging(false);
          }}
          onScroll={updateProgress}
          onWheel={stopGlide}
          onKeyDown={handleKeyDown}
        >
          {gallerySlides.map((image, index) => (
            <img
              key={`${image.src}-${index}`}
              src={image.src}
              alt={image.alt}
              draggable={false}
              onLoad={updateProgress}
            />
          ))}
        </div>
      </div>
      <input
        className="gallery-progress page-container"
        type="range"
        min={0}
        max={1000}
        value={Math.round(position * 1000)}
        aria-label="Scroll project images"
        style={
          { "--thumb-width": `${visibleFraction * 100}%` } as CSSProperties
        }
        onChange={(event) => {
          stopGlide();
          const track = trackRef.current;
          if (track)
            track.scrollLeft =
              (Number(event.target.value) / 1000) *
              (track.scrollWidth - track.clientWidth);
        }}
      />
    </div>
  );
}
