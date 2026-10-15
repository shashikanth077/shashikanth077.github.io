import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * Step-through playback shared by every diagram. Autoplays once on mount
 * (unless the user prefers reduced motion), stops on the last step, and can be
 * driven manually with back / next.
 */
export function useStepper(count: number, intervalMs: number) {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(reduced ? count - 1 : 0);
  const [playing, setPlaying] = useState(!reduced);
  const last = Math.max(0, count - 1);

  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(last, s + 1)), intervalMs);
    return () => clearTimeout(t);
  }, [playing, step, last, intervalMs]);

  return {
    step,
    count,
    last,
    playing,
    reduced,
    atEnd: step >= last,
    play() {
      if (step >= last) setStep(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    next() {
      setPlaying(false);
      setStep((s) => Math.min(last, s + 1));
    },
    prev() {
      setPlaying(false);
      setStep((s) => Math.max(0, s - 1));
    },
  };
}

export type Stepper = ReturnType<typeof useStepper>;
