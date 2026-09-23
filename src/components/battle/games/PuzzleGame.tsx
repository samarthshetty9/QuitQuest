"use client";
import { useState } from "react";
import { GameDone } from "@/components/battle/games/TapGame";
import { cn } from "@/lib/utils";

function makeQuestion() {
  const a = 2 + Math.floor(Math.random() * 12);
  const b = 2 + Math.floor(Math.random() * 12);
  const op = Math.random() > 0.5 ? "+" : "-";
  const answer = op === "+" ? a + b : a - b;
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    options.add(answer + (Math.floor(Math.random() * 9) - 4));
  }
  return { text: `${a} ${op} ${b} = ?`, answer, options: Array.from(options).sort(() => Math.random() - 0.5) };
}

const TOTAL_QUESTIONS = 5;

export function PuzzleGame({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [question, setQuestion] = useState(makeQuestion);
  const [selected, setSelected] = useState<number | null>(null);

  if (index >= TOTAL_QUESTIONS) {
    return <GameDone label={`${correct}/${TOTAL_QUESTIONS} correct.`} onComplete={onComplete} />;
  }

  function pick(opt: number) {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === question.answer) setCorrect((c) => c + 1);
    setTimeout(() => {
      setSelected(null);
      setIndex((i) => i + 1);
      setQuestion(makeQuestion());
    }, 500);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-xs text-[var(--fg-subtle)]">
        Question {index + 1} / {TOTAL_QUESTIONS}
      </p>
      <p className="text-3xl font-bold tabular-nums">{question.text}</p>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => pick(opt)}
            className={cn(
              "min-h-[56px] min-w-[100px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] text-lg font-semibold transition-colors",
              selected === opt && opt === question.answer && "border-[var(--success)] bg-[var(--success-soft)]",
              selected === opt && opt !== question.answer && "border-[var(--danger)] bg-[var(--danger-soft)]"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
