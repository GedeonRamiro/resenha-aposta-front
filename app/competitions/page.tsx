import { Suspense } from "react";
import CompetitionsPageClient from "./components/CompetitionsPageClient";

export default function CompetitionsPage() {
  return (
    <Suspense fallback={null}>
      <CompetitionsPageClient />
    </Suspense>
  );
}
