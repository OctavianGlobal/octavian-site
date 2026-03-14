import { isAdmin, isEditor, getSubscriptionTier } from "@/lib/auth";
import { getPublishedSignals } from "@/lib/queries";
import PublishedClient from "./PublishedClient";
import type { SignalDomain } from "@/types/supabase";

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

interface PublishedPageProps {
  searchParams: Promise<{ page?: string; domain?: string; }>;
}

export default async function PublishedPage({ searchParams }: PublishedPageProps) {
  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page ?? "0", 10));
  const domain = params.domain as SignalDomain | undefined;

  const [adminFlag, editorFlag, tier, { signals, count }] = await Promise.all([
    isAdmin(),
    isEditor(),
    getSubscriptionTier(),
    getPublishedSignals({ domain, limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
  ]);

  return (
    <PublishedClient
      isAdmin={adminFlag}
      isEditor={editorFlag}
      signals={signals}
      count={count}
      page={page}
      domain={domain ?? null}
      tier={tier}
    />
  );
}