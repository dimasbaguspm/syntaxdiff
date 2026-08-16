import { useEffect, useState } from "react";

function matches(maxWidthPx: number): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(`(max-width: ${maxWidthPx}px)`).matches;
}

/** True on small screens (< `breakpoint`px). Used to adapt the diff view. */
export function useIsMobile(breakpoint = 767): boolean {
  const [mobile, setMobile] = useState<boolean>(() => matches(breakpoint));

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);

  return mobile;
}
