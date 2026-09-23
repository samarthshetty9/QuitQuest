"use client";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { useGameData } from "@/hooks/useGameData";
import { formatCurrency } from "@/lib/domain/calculations";
import { generateInsights } from "@/lib/domain/insights";
import { triggerLabel } from "@/lib/config/triggers";
import { computeInterventionStats } from "@/lib/domain/personalization";
import { INTERVENTIONS } from "@/lib/config/interventions";
import { cn } from "@/lib/utils";
import { format, subDays, isAfter } from "date-fns";

type Range = "7d" | "30d" | "90d" | "all";
const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90, all: 36500 };

export default function ProgressPage() {
  const data = useGameData();
  const [range, setRange] = useState<Range>("30d");

  const cutoff = subDays(data.now, RANGE_DAYS[range]);
  const eventsInRange = useMemo(
    () => data.cravingEvents.filter((e) => isAfter(new Date(e.createdAt), cutoff)),
    [data.cravingEvents, cutoff]
  );

  if (!data.stats) return <div className="min-h-dvh" />;

  if (data.cravingEvents.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <h1 className="mb-1 text-2xl font-bold">Progress</h1>
        <p className="mb-6 text-[var(--fg-muted)]">Your cessation statistics and analytics.</p>
        <Card>
          <p className="text-sm text-[var(--fg-muted)]">
            Log a few cravings and you&apos;ll start seeing patterns here.
          </p>
        </Card>
      </div>
    );
  }

  const currency = data.profile?.currency ?? "INR";
  const insights = generateInsights(eventsInRange, data.now);

  // Cravings per day (sorted chronologically)
  const dayBuckets = new Map<string, { count: number; startSum: number }>();
  for (const e of eventsInRange) {
    const sortKey = format(new Date(e.createdAt), "yyyy-MM-dd");
    const b = dayBuckets.get(sortKey) ?? { count: 0, startSum: 0 };
    b.count += 1;
    b.startSum += e.startingIntensity;
    dayBuckets.set(sortKey, b);
  }
  const frequencySeries = [...dayBuckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sortKey, b]) => ({
      date: format(new Date(sortKey), "MMM d"),
      cravings: b.count,
      avgIntensity: Number((b.startSum / b.count).toFixed(1)),
    }));

  // Trigger distribution
  const triggerCounts = new Map<string, number>();
  for (const e of eventsInRange) triggerCounts.set(e.trigger, (triggerCounts.get(e.trigger) ?? 0) + 1);
  const triggerSeries = [...triggerCounts.entries()]
    .map(([trigger, count]) => ({ trigger: triggerLabel(trigger as never), count }))
    .sort((a, b) => b.count - a.count);

  // Time of day heatmap (4-hour blocks x day-of-week)
  const heatmap = buildHeatmap(eventsInRange);

  // Intervention effectiveness
  const interventionStats = INTERVENTIONS.map((i) => computeInterventionStats(eventsInRange, i.key)).filter(
    (s) => s.uses > 0
  );

  // Coping results before/after
  const beforeAfter = eventsInRange
    .flatMap((e) => e.interventions)
    .filter((r) => typeof r.intensityAfter === "number");
  const avgBefore = avg(beforeAfter.map((r) => r.intensityBefore));
  const avgAfter = avg(beforeAfter.map((r) => r.intensityAfter as number));

  const smokeFreeRate = data.stats.smokeFreePercentage;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold">Progress</h1>
      <p className="mb-4 text-[var(--fg-muted)]">Your cessation statistics and analytics.</p>

      <div className="mb-6 flex gap-2">
        {(["7d", "30d", "90d", "all"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold",
              range === r ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] text-[var(--fg-muted)]"
            )}
          >
            {r === "all" ? "All time" : r}
          </button>
        ))}
      </div>

      {insights.length > 0 && (
        <Card className="mb-4 border-[var(--accent)] bg-[var(--accent-soft)]">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--accent-strong)]">Your patterns</p>
          <ul className="space-y-1.5 text-sm text-[var(--accent-strong)]">
            {insights.map((i) => (
              <li key={i.key}>&bull; {i.text}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-3 gap-3">
        <MiniStat label="Money saved" value={formatCurrency(data.stats.moneySaved, currency)} />
        <MiniStat label="Cigs avoided" value={String(data.stats.cigarettesAvoided)} />
        <MiniStat label="Smoke-free %" value={`${Math.round(smokeFreeRate)}%`} />
      </div>

      <Card className="mb-4">
        <p className="mb-3 text-sm font-bold">Cravings over time</p>
        {frequencySeries.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={frequencySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--fg-subtle)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--fg-subtle)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="cravings" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">Not enough data points in this range yet.</p>
        )}
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-sm font-bold">Average starting intensity</p>
        {frequencySeries.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={frequencySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--fg-subtle)" }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "var(--fg-subtle)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="avgIntensity" stroke="var(--danger)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">Not enough data points in this range yet.</p>
        )}
      </Card>

      {beforeAfter.length > 0 && (
        <Card className="mb-4">
          <p className="mb-3 text-sm font-bold">Coping results</p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-black tabular-nums">{avgBefore.toFixed(1)}</p>
              <p className="text-xs text-[var(--fg-subtle)]">avg before</p>
            </div>
            <div className="text-2xl text-[var(--fg-subtle)]">&rarr;</div>
            <div className="text-center">
              <p className="text-3xl font-black tabular-nums text-[var(--success)]">{avgAfter.toFixed(1)}</p>
              <p className="text-xs text-[var(--fg-subtle)]">avg after</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <p className="mb-3 text-sm font-bold">Trigger distribution</p>
        <ResponsiveContainer width="100%" height={Math.max(140, triggerSeries.length * 32)}>
          <BarChart data={triggerSeries} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis dataKey="trigger" type="category" width={90} tick={{ fontSize: 11, fill: "var(--fg-muted)" }} />
            <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Bar dataKey="count" fill="var(--accent)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-sm font-bold">When cravings happen</p>
        <div className="grid grid-cols-7 gap-1">
          <div />
          {["12a", "4a", "8a", "12p", "4p", "8p"].map((label) => (
            <div key={label} className="text-center text-[9px] text-[var(--fg-subtle)]">
              {label}
            </div>
          ))}
          {heatmap.map((row) => (
            <RowCells key={row.day} row={row} />
          ))}
        </div>
      </Card>

      {interventionStats.length > 0 && (
        <Card className="mb-4">
          <p className="mb-3 text-sm font-bold">Intervention effectiveness</p>
          <ul className="space-y-2.5">
            {interventionStats
              .sort((a, b) => b.avgReduction - a.avgReduction)
              .map((s) => {
                const def = INTERVENTIONS.find((i) => i.key === s.intervention)!;
                return (
                  <li key={s.intervention} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{def.emoji}</span> {def.shortLabel}
                    </span>
                    <span className="text-xs text-[var(--fg-muted)]">
                      {s.uses} uses &middot; avg -{s.avgReduction.toFixed(1)}
                    </span>
                  </li>
                );
              })}
          </ul>
          <p className="mt-3 text-[11px] text-[var(--fg-subtle)]">
            Based only on your own logged history — not a medical comparison.
          </p>
        </Card>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-base font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-[var(--fg-subtle)]">{label}</p>
    </Card>
  );
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

interface HeatRow {
  day: string;
  cells: number[];
}

function buildHeatmap(events: { createdAt: string }[]): HeatRow[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grid: number[][] = Array.from({ length: 7 }, () => Array(6).fill(0));
  for (const e of events) {
    const d = new Date(e.createdAt);
    const day = d.getDay();
    const block = Math.floor(d.getHours() / 4);
    grid[day][block]++;
  }
  const max = Math.max(1, ...grid.flat());
  return days.map((day, i) => ({ day, cells: grid[i].map((v) => v / max) }));
}

function RowCells({ row }: { row: HeatRow }) {
  return (
    <>
      <div className="flex items-center text-[9px] text-[var(--fg-subtle)]">{row.day}</div>
      {row.cells.map((v, i) => (
        <div
          key={i}
          className="aspect-square rounded-sm"
          style={{ background: v === 0 ? "var(--border)" : `color-mix(in srgb, var(--accent) ${20 + v * 80}%, transparent)` }}
        />
      ))}
    </>
  );
}
