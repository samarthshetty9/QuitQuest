"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, Upload, Trash2, Plus, X, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/onboarding/Field";
import { Chip } from "@/components/onboarding/Chip";
import { useGameData } from "@/hooks/useGameData";
import { getDB } from "@/lib/db/db";
import * as repo from "@/lib/db/repo";
import { CURRENT_USER_ID } from "@/lib/db/repo";
import { formatCurrency } from "@/lib/domain/calculations";
import { rewardProgress } from "@/lib/game/stats";
import { HEALTH_MILESTONES, WITHDRAWAL_INFO, TREATMENT_INFO } from "@/lib/config/health";
import { SUPPORT_RESOURCES } from "@/lib/config/support";
import { TRIGGERS } from "@/lib/config/triggers";
import { createPlanAction, addRewardGoalAction } from "@/lib/game/engine";
import { resetToFreshInstall } from "@/lib/dev/seed";
import type { TriggerKey } from "@/lib/domain/types";

export default function YouPage() {
  const router = useRouter();
  const data = useGameData();
  const reasons = useLiveQuery(() => getDB().reasonsForQuitting.where({ userId: CURRENT_USER_ID }).toArray(), []) ?? [];
  const futureMessage = useLiveQuery(() => getDB().futureSelfMessages.get(CURRENT_USER_ID), []);
  const settings = useLiveQuery(() => getDB().appSettings.get(CURRENT_USER_ID), []);
  const contacts = useLiveQuery(() => getDB().supportContacts.where({ userId: CURRENT_USER_ID }).toArray(), []) ?? [];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPlan, setNewPlan] = useState({ trigger: "stress" as TriggerKey, ifText: "", thenText: "" });
  const [newGoal, setNewGoal] = useState({ title: "", emoji: "🎁", target: 5000 });
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const currency = data.profile?.currency ?? "INR";

  async function handleExport() {
    const exported = await repo.exportAllData();
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quitquest-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json || typeof json !== "object" || !json.tables) {
        setImportStatus("That file doesn't look like a QuitQuest export.");
        return;
      }
      await repo.importAllData(json);
      setImportStatus("Import complete.");
    } catch {
      setImportStatus("Couldn't read that file.");
    }
  }

  async function handleReset() {
    if (!confirm("This will permanently delete all local QuitQuest data on this device. Continue?")) return;
    await resetToFreshInstall();
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold">You</h1>
      <p className="mb-6 text-[var(--fg-muted)]">Your quit profile, reasons, rewards, and settings.</p>

      {/* Profile */}
      <Section title="Profile">
        <Card>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Nickname" value={data.profile?.nickname ?? "-"} />
            <InfoRow label="Currency" value={currency} />
            <InfoRow label="Cigs/day (baseline)" value={String(data.profile?.cigarettesPerDayBaseline ?? "-")} />
            <InfoRow label="Price/pack" value={formatCurrency(data.profile?.pricePerPack ?? 0, currency)} />
          </div>
        </Card>
      </Section>

      {/* Why I quit */}
      <Section title="Why I Quit">
        <Card>
          {futureMessage?.message && (
            <p className="mb-3 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] p-3 text-sm italic text-[var(--accent-strong)]">
              &ldquo;{futureMessage.message}&rdquo;
            </p>
          )}
          {reasons.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {reasons.map((r) => (
                <span key={r.id} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">
                  {r.customText || r.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--fg-muted)]">No reasons saved yet.</p>
          )}
        </Card>
      </Section>

      {/* Reward store */}
      <Section title="Reward Store">
        <div className="space-y-3">
          {data.rewardGoals.length === 0 && (
            <Card>
              <p className="text-sm text-[var(--fg-muted)]">
                Turn money you aren&apos;t spending on cigarettes into something you actually want.
              </p>
            </Card>
          )}
          {data.rewardGoals
            .sort((a, b) => a.priority - b.priority)
            .map((g) => {
              const progress = rewardProgress(g, data.stats?.moneySaved ?? 0);
              return (
                <Card key={g.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="text-xl">{g.emoji}</span> {g.title}
                    </span>
                    {g.unlockedAt ? (
                      <span className="rounded-full bg-[var(--gold-soft)] px-2.5 py-1 text-xs font-bold text-[var(--gold)]">
                        REWARD UNLOCKED
                      </span>
                    ) : (
                      <button onClick={() => repo.deleteRewardGoal(g.id)} className="text-[var(--fg-subtle)]">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-[var(--gold)]"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--fg-subtle)]">
                    {formatCurrency(data.stats?.moneySaved ?? 0, currency)} / {formatCurrency(g.targetCost, currency)}
                  </p>
                </Card>
              );
            })}
          <Card>
            <p className="mb-2 text-sm font-bold">Add a reward goal</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={inputClass}
                placeholder="e.g. Headphones"
                value={newGoal.title}
                onChange={(e) => setNewGoal((g) => ({ ...g, title: e.target.value }))}
              />
              <input
                type="number"
                className={inputClass + " sm:w-32"}
                value={newGoal.target}
                onChange={(e) => setNewGoal((g) => ({ ...g, target: Number(e.target.value) }))}
              />
              <Button
                disabled={!newGoal.title.trim()}
                onClick={async () => {
                  await addRewardGoalAction({
                    title: newGoal.title.trim(),
                    emoji: newGoal.emoji,
                    targetCost: newGoal.target,
                    priority: data.rewardGoals.length + 1,
                  });
                  setNewGoal({ title: "", emoji: "🎁", target: 5000 });
                }}
              >
                <Plus size={16} /> Add
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* IF-THEN plans */}
      <Section title="IF-THEN Plans">
        <div className="space-y-3">
          {data.ifThenPlans.length === 0 && (
            <Card>
              <p className="text-sm text-[var(--fg-muted)]">No plans yet. Prepare for a specific situation before it happens.</p>
            </Card>
          )}
          {data.ifThenPlans.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm">
                    <span className="font-bold">IF</span> {p.ifText}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold">THEN</span> {p.thenText}
                  </p>
                </div>
                <button onClick={() => repo.deleteIfThenPlan(p.id)} className="shrink-0 text-[var(--fg-subtle)]">
                  <X size={16} />
                </button>
              </div>
            </Card>
          ))}
          <Card>
            <p className="mb-2 text-sm font-bold">Create a plan</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {TRIGGERS.filter((t) => t.key !== "custom").map((t) => (
                <Chip key={t.key} selected={newPlan.trigger === t.key} onClick={() => setNewPlan((p) => ({ ...p, trigger: t.key }))}>
                  {t.label}
                </Chip>
              ))}
            </div>
            <Field label="IF">
              <input className={inputClass} value={newPlan.ifText} onChange={(e) => setNewPlan((p) => ({ ...p, ifText: e.target.value }))} />
            </Field>
            <div className="h-2" />
            <Field label="THEN">
              <input className={inputClass} value={newPlan.thenText} onChange={(e) => setNewPlan((p) => ({ ...p, thenText: e.target.value }))} />
            </Field>
            <Button
              className="mt-3"
              disabled={!newPlan.ifText.trim() || !newPlan.thenText.trim()}
              onClick={async () => {
                await createPlanAction(newPlan);
                setNewPlan({ trigger: "stress", ifText: "", thenText: "" });
              }}
            >
              Save plan
            </Button>
          </Card>
        </div>
      </Section>

      {/* Support contacts */}
      <Section title="Accountability Contacts">
        <div className="space-y-3">
          {contacts.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {c.name} {c.phone && <span className="text-[var(--fg-subtle)]">&middot; {c.phone}</span>}
              </span>
              <button onClick={() => repo.deleteSupportContact(c.id)} className="text-[var(--fg-subtle)]">
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
          <Card>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input className={inputClass} placeholder="Name" value={newContact.name} onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))} />
              <input className={inputClass} placeholder="Phone (optional)" value={newContact.phone} onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))} />
              <Button
                disabled={!newContact.name.trim()}
                onClick={async () => {
                  await repo.createSupportContact({ name: newContact.name.trim(), phone: newContact.phone.trim() || undefined });
                  setNewContact({ name: "", phone: "" });
                }}
              >
                <Plus size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* Settings */}
      <Section title="Settings">
        <Card className="space-y-4">
          <ToggleRow
            label="Reduced motion"
            checked={!!settings?.reducedMotion}
            onChange={(v) => settings && repo.saveAppSettings({ ...settings, reducedMotion: v })}
          />
          <ToggleRow
            label="Notifications (opt-in)"
            checked={!!settings?.notificationsEnabled}
            onChange={(v) => settings && repo.saveAppSettings({ ...settings, notificationsEnabled: v })}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <select
              className={inputClass + " w-32"}
              value={settings?.theme ?? "system"}
              onChange={(e) => settings && repo.saveAppSettings({ ...settings, theme: e.target.value as never })}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </Card>
      </Section>

      {/* Data */}
      <Section title="Your Data">
        <Card className="space-y-3">
          <p className="text-xs text-[var(--fg-subtle)]">Your quit data stays on this device unless you export it.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} /> Export JSON
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
          </div>
          {importStatus && <p className="text-xs text-[var(--fg-muted)]">{importStatus}</p>}
          <Button variant="danger" onClick={handleReset}>
            <Trash2 size={16} /> Reset all data
          </Button>
        </Card>
      </Section>

      {/* Health info */}
      <Section title="Recovery Information">
        <Card className="space-y-3">
          <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] p-3 text-xs text-[var(--accent-strong)]">
            <Info size={14} className="mt-0.5 shrink-0" />
            General population-level information. Individual recovery varies. Not medical advice.
          </div>
          {HEALTH_MILESTONES.map((m) => (
            <div key={m.key}>
              <p className="text-sm font-semibold">
                {m.timeLabel} &middot; {m.headline}
              </p>
              <p className="text-xs text-[var(--fg-muted)]">{m.detail}</p>
            </div>
          ))}
          <p className="pt-1 text-[10px] text-[var(--fg-subtle)]">Sources: WHO, CDC, National Cancer Institute, Smokefree.gov (paraphrased).</p>
        </Card>
      </Section>

      <Section title="Withdrawal">
        <Card className="space-y-2">
          <p className="text-sm text-[var(--fg-muted)]">{WITHDRAWAL_INFO.intro}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {WITHDRAWAL_INFO.commonSymptoms.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="text-xs text-[var(--fg-subtle)]">{WITHDRAWAL_INFO.caution}</p>
        </Card>
      </Section>

      <Section title="Support & Treatment">
        <Card className="space-y-2">
          <p className="text-sm text-[var(--fg-muted)]">{TREATMENT_INFO.intro}</p>
          <ul className="space-y-1.5 text-sm">
            {TREATMENT_INFO.options.map((o) => (
              <li key={o.label}>
                <span className="font-semibold">{o.label}:</span> {o.detail}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--fg-subtle)]">{TREATMENT_INFO.disclaimer}</p>
        </Card>
      </Section>

      <Section title="Support Resources">
        <div className="space-y-3">
          {SUPPORT_RESOURCES.map((r) => (
            <Card key={r.name}>
              <p className="text-sm font-semibold">{r.name}</p>
              <p className="text-sm text-[var(--accent-strong)]">{r.phone}</p>
              <p className="text-xs text-[var(--fg-muted)]">{r.description}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--fg-subtle)]">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[var(--fg-subtle)]">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
