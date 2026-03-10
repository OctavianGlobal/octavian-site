import { isAdmin, isEditor, getSubscriptionTier } from "@/lib/auth";
import { getArchivedSignals } from "@/lib/queries";
import ArchiveClient from "./ArchiveClient";
import type { SignalDomain } from "@/types/supabase";

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25;

interface ArchivePageProps {
  searchParams: Promise<{
    page?: string;
    domain?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page ?? "0", 10));
  const domain = params.domain as SignalDomain | undefined;
  const dateFrom = params.from;
  const dateTo = params.to;

  const [adminFlag, editorFlag, tier, archiveData] = await Promise.all([
    isAdmin(),
    isEditor(),
    getSubscriptionTier(),
    getArchivedSignals({
      domain,
      dateFrom,
      dateTo,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
  ]);

  return (
    <ArchiveClient
      isAdmin={adminFlag}
      isEditor={editorFlag}
      signals={archiveData.signals}
      count={archiveData.count}
      restricted={archiveData.restricted}
      tier={tier}
      page={page}
      domain={domain ?? null}
      dateFrom={dateFrom ?? null}
      dateTo={dateTo ?? null}
    />
  );
}