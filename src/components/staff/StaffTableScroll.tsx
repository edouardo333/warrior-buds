"use client";

import { useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

const DRAG_THRESHOLD = 4;

type DragState = {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  dragging: boolean;
};

/**
 * Reusable horizontal-scroll wrapper for Staff Space tables.
 * - Desktop: click/hold + drag to pan (cursor grab -> grabbing), wheel/trackpad still work natively.
 * - Touch: native swipe scrolling, untouched (we bail out of all pointer handling for non-mouse pointers).
 * - A drag gesture never triggers the row's onClick (we swallow the synthetic click that follows it).
 */
export default function StaffTableScroll({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const justDragged = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: el.scrollLeft, dragging: false };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = scrollRef.current;
    if (!state || !el) return;
    const dx = event.clientX - state.startX;
    if (!state.dragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      state.dragging = true;
      try {
        el.setPointerCapture(state.pointerId);
      } catch {
        // Pointer already released (e.g. fast gesture) — scrolling still works untracked.
      }
      el.classList.remove("cursor-grab");
      el.classList.add("cursor-grabbing", "select-none");
    }
    event.preventDefault();
    el.scrollLeft = state.startScrollLeft - dx;
  };

  const endDrag = () => {
    const state = drag.current;
    const el = scrollRef.current;
    if (state?.dragging) {
      justDragged.current = true;
      if (el) {
        if (el.hasPointerCapture(state.pointerId)) el.releasePointerCapture(state.pointerId);
        el.classList.add("cursor-grab");
        el.classList.remove("cursor-grabbing", "select-none");
      }
    }
    drag.current = null;
  };

  const handlePointerLeave = () => {
    // Only cancel a not-yet-started drag; an in-progress (captured) drag keeps
    // receiving move/up events even once the pointer leaves the element bounds.
    const state = drag.current;
    if (state && !state.dragging) {
      drag.current = null;
    }
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (justDragged.current) {
      justDragged.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div
      ref={scrollRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={handlePointerLeave}
      onClickCapture={handleClickCapture}
      onDragStart={(event) => event.preventDefault()}
      className="wb-staff-table-scroll hidden cursor-grab overflow-x-auto rounded-2xl border border-white/10 sm:block"
    >
      {children}
    </div>
  );
}
