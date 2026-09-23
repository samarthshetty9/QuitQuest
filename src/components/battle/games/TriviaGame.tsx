"use client";
import { useState } from "react";
import { GameDone } from "@/components/battle/games/TapGame";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
  { q: "How many strings does a standard guitar have?", options: ["4", "5", "6", "7"], answer: 2 },
  { q: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Bangkok"], answer: 2 },
  { q: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: 1 },
];

export function TriviaGame({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  if (index >= QUESTIONS.length) {
    return <GameDone label="Trivia round complete." onComplete={onComplete} />;
  }
  const question = QUESTIONS[index];

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => {
      setSelected(null);
      setIndex((x) => x + 1);
    }, 450);
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-xs text-[var(--fg-subtle)]">
        Question {index + 1} / {QUESTIONS.length}
      </p>
      <p className="text-lg font-semibold">{question.q}</p>
      <div className="grid grid-cols-1 gap-2">
        {question.options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => pick(i)}
            className={cn(
              "min-h-[48px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-left text-sm font-medium transition-colors",
              selected === i && i === question.answer && "border-[var(--success)] bg-[var(--success-soft)]",
              selected === i && i !== question.answer && "border-[var(--danger)] bg-[var(--danger-soft)]"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
