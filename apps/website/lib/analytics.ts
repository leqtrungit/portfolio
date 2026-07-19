// Client-side pageview + engagement beacon (blog-api beacon v2).
// Contract: docs/frontend-analytics-handoff.md in the blog-api repo.
const API = "https://blog-api.lequoctrung.id.vn";

let viewId = "";
let maxScroll = 0;
let activeMs = 0;
let lastVisibleAt = 0;
let ticking = false;
let listenersReady = false;

function enabled(): boolean {
  return typeof window !== "undefined" && window.location.hostname === "lequoctrung.vn";
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

export function initAnalyticsListeners() {
  if (!enabled() || listenersReady) return;
  listenersReady = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", sendEngagement);
  document.addEventListener("visibilitychange", onVisibility);
}
