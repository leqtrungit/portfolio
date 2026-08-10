"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalyticsListeners, initAnalyticsOptOut, trackPage } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalyticsOptOut();
    initAnalyticsListeners();
    // Fires on first load and on every App Router client navigation;
    // trackPage() flushes the previous view's engagement first, so SPA
    // transitions are not double-counted.
    trackPage();
  }, [pathname]);

  return null;
}
