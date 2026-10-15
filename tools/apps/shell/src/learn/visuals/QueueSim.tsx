import { useEffect, useRef, useState } from "react";
import type { QueueVisual } from "./types.js";
import { usePrefersReducedMotion } from "./useStepper.js";

interface Snap {
  queued: number;
  busy: number[]; // progress 0..1 per worker, -1 = idle
  done: number;
  lost: number;
  blocked: boolean;
}

const TICK = 100;

/** Small live simulation: tweak arrival rate and workers and watch the queue. */
export function QueueSim({ v }: { v: QueueVisual }) {
  const reduced = usePrefersReducedMotion();
  const [arrival, setArrival] = useState(v.arrival);
  const [workers, setWorkers] = useState(v.workers);
  const [running, setRunning] = useState(!reduced);
  const [snap, setSnap] = useState<Snap>({ queued: 0, busy: Array(v.workers).fill(-1), done: 0, lost: 0, blocked: false });
  const sim = useRef({ queued: 0, busy: Array<number>(v.workers).fill(-1), done: 0, lost: 0, acc: 0, blocked: false });

  // Keep the worker list in step with the slider.
  useEffect(() => {
    const s = sim.current;
    while (s.busy.length < workers) s.busy.push(-1);
    if (s.busy.length > workers) {
      const dropped = s.busy.splice(workers).filter((p) => p >= 0).length;
      s.queued += dropped;
    }
  }, [workers]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const s = sim.current;
      s.acc += (arrival * TICK) / 1000;
      s.blocked = false;
      while (s.acc >= 1) {
        s.acc -= 1;
        if (s.queued < v.capacity) s.queued += 1;
        else if (v.overflow === "drop") s.lost += 1;
        else {
          s.blocked = true;
          s.acc = Math.min(s.acc, 0.99);
          break;
        }
      }
      s.busy = s.busy.map((p) => {
        if (p >= 0) {
          const np = p + (v.service * TICK) / 1000;
          if (np >= 1) {
            s.done += 1;
            return -1;
          }
          return np;
        }
        return p;
      });
      s.busy = s.busy.map((p) => {
        if (p < 0 && s.queued > 0) {
          s.queued -= 1;
          return 0;
        }
        return p;
      });
      setSnap({ queued: s.queued, busy: [...s.busy], done: s.done, lost: s.lost, blocked: s.blocked });
    }, TICK);
    return () => clearInterval(id);
  }, [running, arrival, v.capacity, v.overflow, v.service]);

  function reset() {
    sim.current = { queued: 0, busy: Array<number>(workers).fill(-1), done: 0, lost: 0, acc: 0, blocked: false };
    setSnap({ queued: 0, busy: Array(workers).fill(-1), done: 0, lost: 0, blocked: false });
    setRunning(true);
  }

  const capacityPerSec = workers * v.service;
  const keepingUp = arrival <= capacityPerSec;
  const full = snap.queued >= v.capacity;
  const status = keepingUp
    ? { tone: "good", text: `Keeping up: ${capacityPerSec.toFixed(1)}/s capacity ≥ ${arrival.toFixed(1)}/s arriving` }
    : full
      ? v.overflow === "drop"
        ? { tone: "bad", text: "Queue full — new items are being dropped (load shedding)" }
        : { tone: "warn", text: "Queue full — the producer is blocked (backpressure)" }
      : { tone: "warn", text: `Falling behind: ${arrival.toFixed(1)}/s arriving but only ${capacityPerSec.toFixed(1)}/s can be served` };

  return (
    <div className="lp-qsim" role="group" aria-label={v.takeaway}>
      <div className="lp-qsim__stage">
        <div className={`lp-qsim__box${snap.blocked ? " is-blocked" : ""}`}><b>{v.producer}</b><small>{arrival.toFixed(1)} / s</small></div>
        <span className="lp-qsim__arrow" aria-hidden="true">→</span>
        <div className="lp-qsim__queue">
          <b>{v.queue}</b>
          <div className="lp-qsim__slots" aria-label={`${snap.queued} of ${v.capacity} slots used`}>
            {Array.from({ length: v.capacity }, (_, i) => <i key={i} className={i < snap.queued ? "on" : ""} />)}
          </div>
          <small>{snap.queued} / {v.capacity}</small>
        </div>
        <span className="lp-qsim__arrow" aria-hidden="true">→</span>
        <div className="lp-qsim__workers">
          {snap.busy.map((p, i) => (
            <div key={i} className="lp-qsim__worker">
              <b>{v.worker} {i + 1}</b>
              <span className="lp-bar"><i style={{ width: `${Math.max(0, p) * 100}%` }} /></span>
            </div>
          ))}
        </div>
      </div>
      <div className={`lp-qsim__status tone-${status.tone}`} aria-live="polite">{status.text}</div>
      <div className="lp-qsim__ctl">
        <label>Arrival rate <b>{arrival.toFixed(1)}/s</b><input type="range" min={0.5} max={12} step={0.5} value={arrival} onChange={(e) => setArrival(Number(e.target.value))} /></label>
        <label>{v.worker}s <b>{workers}</b><input type="range" min={1} max={6} step={1} value={workers} onChange={(e) => setWorkers(Number(e.target.value))} /></label>
        <span className="lp-qsim__stats">done <b>{snap.done}</b>{v.overflow === "drop" && <> · dropped <b>{snap.lost}</b></>}</span>
        <button type="button" className="lp-btn" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Run"}</button>
        <button type="button" className="lp-btn" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
