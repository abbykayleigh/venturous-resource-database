import { useState, useEffect } from "react";

/** Returns true for screens < 1024px (mobile + tablet) */
export function useIsCompact() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsCompact(mql.matches);
    mql.addEventListener("change", onChange);
    setIsCompact(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isCompact;
}
