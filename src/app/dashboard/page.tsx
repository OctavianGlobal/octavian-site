import { isAdmin, isEditor } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [adminFlag, editorFlag, dashData] = await Promise.all([
    isAdmin(),
    isEditor(),
    getDashboardData(),
  ]);

  return (
    <DashboardClient
      isAdmin={adminFlag}
      isEditor={editorFlag}
      signals={dashData.recentSignals}
      tier={dashData.tier}
    />
  );
}