// Central time abstraction so product logic never calls `new Date()` directly.
// In production this is a thin wrapper over the real clock. In development/test
// it can be advanced or frozen, which is what makes streaks, quest rollover,
// and craving-battle timers testable without waiting in real time.

type Listener = () => void;

const STORAGE_KEY = "quitquest_dev_clock";

interface PersistedClockState {
  offsetMs: number;
  frozenAt: number | null;
}

class Clock {
  private offsetMs = 0;
  private frozenAt: number | null = null;
  private listeners = new Set<Listener>();

  constructor() {
    this.loadPersisted();
  }

  /** Current time as a Date, honoring any dev/test offset or freeze. */
  now(): Date {
    if (this.frozenAt !== null) return new Date(this.frozenAt);
    return new Date(Date.now() + this.offsetMs);
  }

  nowISO(): string {
    return this.now().toISOString();
  }

  /** Dev/test only: jump the clock forward by N milliseconds. */
  advance(ms: number) {
    if (!isTestControlAllowed()) return;
    if (this.frozenAt !== null) this.frozenAt += ms;
    else this.offsetMs += ms;
    this.persist();
    this.emit();
  }

  /** Dev/test only: freeze the clock at a specific instant. */
  freezeAt(date: Date) {
    if (!isTestControlAllowed()) return;
    this.frozenAt = date.getTime();
    this.persist();
    this.emit();
  }

  /** Dev/test only: return to the real system clock. */
  reset() {
    if (!isTestControlAllowed()) return;
    this.offsetMs = 0;
    this.frozenAt = null;
    this.persist();
    this.emit();
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  // Dev/test clock state survives a page reload via sessionStorage (tab-scoped,
  // never persisted anywhere durable, and never read in a production build) so
  // that E2E tests can time-travel and then assert persistence across reloads.
  private loadPersisted() {
    if (!isTestControlAllowed() || typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedClockState;
      this.offsetMs = parsed.offsetMs ?? 0;
      this.frozenAt = parsed.frozenAt ?? null;
    } catch {
      // Corrupt/unavailable storage: fall back to the real clock.
    }
  }

  private persist() {
    if (!isTestControlAllowed() || typeof window === "undefined") return;
    try {
      const state: PersistedClockState = { offsetMs: this.offsetMs, frozenAt: this.frozenAt };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Best-effort only.
    }
  }
}

export function isTestControlAllowed(): boolean {
  // Test-clock controls must never be reachable in a production build.
  return process.env.NODE_ENV !== "production";
}

export const clock = new Clock();

export function nowISO(): string {
  return clock.nowISO();
}

export function now(): Date {
  return clock.now();
}
