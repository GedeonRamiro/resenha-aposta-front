import { redirect } from "next/navigation";

export default function DeprecatedCreateCompetitionPage() {
  redirect("/competitions");
}
