"use client";

import { useEffect, useRef, useState } from "react";

type UseCollapseOnScrollOptions = {
  threshold?: number;
  topOffset?: number;
  collapseOffset?: number;
  disabled?: boolean;
};

const LAYOUT_LOCK_MS = 300;

export function useCollapseOnScroll({
  threshold = 10,
  topOffset = 16,
  collapseOffset = 48,
  disabled = false,
}: UseCollapseOnScrollOptions = {}): boolean {
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const collapsedRef = useRef(false);
  const layoutLockUntil = useRef(0);
  const ignoreTopExpandRef = useRef(false);

  useEffect(() => {
    if (disabled) {
      collapsedRef.current = false;
      ignoreTopExpandRef.current = false;
      setCollapsed(false);
      return;
    }

    lastScrollY.current = window.scrollY;

    function setCollapsedSafe(next: boolean) {
      if (collapsedRef.current === next) return;
      collapsedRef.current = next;
      setCollapsed(next);
      layoutLockUntil.current = Date.now() + LAYOUT_LOCK_MS;
      if (next) {
        ignoreTopExpandRef.current = true;
      }
    }

    function onScroll() {
      const currentScrollY = window.scrollY;
      const now = Date.now();
      const locked = now < layoutLockUntil.current;

      if (currentScrollY > collapseOffset) {
        ignoreTopExpandRef.current = false;
      }

      if (locked) {
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY <= topOffset && !ignoreTopExpandRef.current) {
        setCollapsedSafe(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      if (Math.abs(delta) < threshold) return;

      if (delta > 0 && currentScrollY > collapseOffset) {
        setCollapsedSafe(true);
      } else if (delta < 0) {
        setCollapsedSafe(false);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [disabled, threshold, topOffset, collapseOffset]);

  return disabled ? false : collapsed;
}
