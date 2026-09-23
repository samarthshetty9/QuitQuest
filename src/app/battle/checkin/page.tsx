import { Suspense } from "react";
import { ContextCheckInFlow } from "@/components/battle/ContextCheckInFlow";

export default function ContextCheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <ContextCheckInFlow />
    </Suspense>
  );
}
