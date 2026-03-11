import { isAdmin, isEditor } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";
import DashboardClient from "./DashboardClient";
import type { SignalDomain } from "@/types/supabase";

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50;

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string;
    domain?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page ?? "0", 10));
  const domain = params.domain as SignalDomain | undefined;
  const sort = params.sort === 'score' ? 'score' : 'date';
  const dir = params.dir === 'asc' ? 'asc' : 'desc';

  const [adminFlag, editorFlag, dashData] = await Promise.all([
    isAdmin(),
    isEditor(),
    getDashboardData({
      domain,
      sort,
      dir,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
  ]);

  return (
    <DashboardClient
      isAdmin={adminFlag}
      isEditor={editorFlag}
      signals={dashData.recentSignals}
      count={dashData.count}
      tier={dashData.tier}
      permissions={dashData.permissions}
      page={page}
      domain={domain ?? null}
      sort={sort}
      dir={dir}
    />
  );
}