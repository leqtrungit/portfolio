// Client-side pageview + engagement beacon (blog-api beacon v2).
// Contract: docs/frontend-analytics-handoff.md in the blog-api repo.
const API = "https://blog-api.lequoctrung.id.vn";

let viewId = "";
let maxScroll = 0;
let activeMs = 0;
let lastVisibleAt = 0;
let ticking = false;
let listenersReady = false;

const NO_TRACK_KEY = "lqt_no_track";

// Owner opt-out: visiting with ?no_track=1 persists a flag that suppresses
// the beacon entirely (no network call), so the owner's own visits never
// reach analytics. ?no_track=0 clears it. Must run before initAnalyticsListeners.
function applyNoTrackParam(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("no_track")) return;
  if (params.get("no_track") === "1") {
    window.localStorage.setItem(NO_TRACK_KEY, "1");
  } else if (params.get("no_track") === "0") {
    window.localStorage.removeItem(NO_TRACK_KEY);
  }
}

function isOptedOut(): boolean {
  return typeof window !== "undefined" && window.localStorage.getItem(NO_TRACK_KEY) === "1";
}

function enabled(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname === "lequoctrung.vn" &&
    !isOptedOut()
  );
}

function scrollPct(): number {
  const el = document.documentElement;
  const scrollable = el.scrollHeight - el.clientHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.round((el.scrollTop / scrollable) * 100));
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    maxScroll = Math.max(maxScroll, scrollPct());
    ticking = false;
  });
}

function startTimer() {
  if (!document.hidden) lastVisibleAt = performance.now();
}

function pauseTimer() {
  if (lastVisibleAt > 0) {
    activeMs += performance.now() - lastVisibleAt;
    lastVisibleAt = 0;
  }
}

function sendEngagement() {
  if (!viewId) return;
  pauseTimer();
  maxScroll = Math.max(maxScroll, scrollPct());
  const body = JSON.stringify({
    view_id: viewId,
    duration_ms: Math.round(activeMs),
    scroll_pct: maxScroll,
  });
  // text/plain avoids a CORS preflight; server still parses JSON. Idempotent
  // server-side (GREATEST on both fields), so repeat fires are safe.
  navigator.sendBeacon(
    `${API}/api/v1/analytics/engagement`,
    new Blob([body], { type: "text/plain" }),
  );
}

function onVisibility() {
  if (document.visibilityState === "hidden") {
    sendEngagement();
  } else {
    startTimer();
  }
}

export function trackPage() {
  if (!enabled()) return;
  // Flush the previous page's engagement before starting a new view (SPA nav).
  sendEngagement();
  viewId = "";
  maxScroll = 0;
  activeMs = 0;
  lastVisibleAt = 0;

  fetch(`${API}/api/v1/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: location.pathname,
      referrer: document.referrer || "",
      query: location.search || "",
    }),
    keepalive: true,
  })
    .then(async (res) => {
      if (!res.ok) return; // includes 429: never retry
      const json = (await res.json()) as { data?: { view_id?: string } };
      viewId = json?.data?.view_id || "";
      if (viewId) startTimer();
    })
    .catch(() => {});
}

export function initAnalyticsOptOut() {
  applyNoTrackParam();
}

export function initAnalyticsListeners() {
  if (!enabled() || listenersReady) return;
  listenersReady = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", sendEngagement);
  document.addEventListener("visibilitychange", onVisibility);
}
