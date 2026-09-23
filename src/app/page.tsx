"use client";
import { useGameData } from "@/hooks/useGameData";
import { ActiveHome } from "@/components/home/ActiveHome";
import { PreparationHome } from "@/components/home/PreparationHome";

export default function HomePage() {
  const data = useGameData();

  if (data.loading || !data.profile || !data.stats) {
    return <div className="min-h-dvh" />;
  }

  if (data.stats.isPreparationMode) {
    return <PreparationHome data={data} />;
  }

  return <ActiveHome data={data} />;
}
