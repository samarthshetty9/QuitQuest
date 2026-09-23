import { Suspense } from "react";
import { SlipFlow } from "@/components/battle/SlipFlow";

export default function SlipPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <SlipFlow />
    </Suspense>
  );
}
