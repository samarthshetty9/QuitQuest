"use client";
import type { InterventionKey } from "@/lib/domain/types";
import { TapGame } from "@/components/battle/games/TapGame";
import { MemoryGame } from "@/components/battle/games/MemoryGame";
import { PuzzleGame } from "@/components/battle/games/PuzzleGame";
import { SearchGame } from "@/components/battle/games/SearchGame";
import { TriviaGame } from "@/components/battle/games/TriviaGame";

export function DistractionRouter({ intervention, onDone }: { intervention: InterventionKey; onDone: () => void }) {
  switch (intervention) {
    case "distraction_tap":
      return <TapGame onComplete={onDone} />;
    case "distraction_memory":
      return <MemoryGame onComplete={onDone} />;
    case "distraction_puzzle":
      return <PuzzleGame onComplete={onDone} />;
    case "distraction_search":
      return <SearchGame onComplete={onDone} />;
    case "distraction_trivia":
      return <TriviaGame onComplete={onDone} />;
    default:
      return null;
  }
}
