import { Suspense } from "react";
import TeamsPageClient from "./components/TeamsPageClient";

export default function TeamsPage() {
  return (
    <Suspense fallback={null}>
      <TeamsPageClient />
    </Suspense>
  );
}
