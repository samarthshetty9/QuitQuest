"use client";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/Button";
import { Phone, MessageCircle } from "lucide-react";
import { getDB } from "@/lib/db/db";
import { createSupportContact, CURRENT_USER_ID } from "@/lib/db/repo";
import { inputClass } from "@/components/onboarding/Field";

export function SocialSupportIntervention({ onDone }: { onDone: () => void }) {
  const contacts = useLiveQuery(() => getDB().supportContacts.where({ userId: CURRENT_USER_ID }).toArray(), []) ?? [];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="text-lg font-semibold">Talk to someone for five minutes.</p>
      {contacts.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--fg-muted)]">No accountability contacts saved yet. Add one now, or just reach out directly.</p>
          <input className={inputClass} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputClass} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button
            variant="secondary"
            disabled={!name.trim()}
            onClick={() => createSupportContact({ name: name.trim(), phone: phone.trim() || undefined })}
          >
            Save contact
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-3">
              <span className="text-sm font-medium">{c.name}</span>
              {c.phone && (
                <div className="flex gap-2">
                  <a href={`tel:${c.phone}`} className="rounded-full bg-[var(--accent-soft)] p-2 text-[var(--accent-strong)]" aria-label="Call">
                    <Phone size={16} />
                  </a>
                  <a href={`sms:${c.phone}`} className="rounded-full bg-[var(--accent-soft)] p-2 text-[var(--accent-strong)]" aria-label="Message">
                    <MessageCircle size={16} />
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <Button size="lg" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
