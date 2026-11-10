import { RouteLoadingScreen } from "@/components/layout/route-loading-screen";

/**
 * Route-transition fallback for the whole app — every navigation to a
 * not-yet-streamed segment shows the branded skeleton while it loads.
 */
export default function Loading() {
  return <RouteLoadingScreen />;
}
