import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar, type AppDispatch, type RootState } from "../store.js";
import { Header } from "./Header.js";
import { Footer } from "./Footer.js";
import { MobileMenu } from "./MobileMenu.js";

/**
 * No persistent side nav (desktop or mobile) — tools are reached via the
 * header's search and per-toolkit mega-menus (Header.tsx), the home page's
 * own catalog, and each tool page's breadcrumb/related-tools. On narrow
 * viewports the header's burger opens MobileMenu, a full-screen overlay,
 * instead of a docked drawer.
 */
export function Layout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const menuOpen = useSelector((s: RootState) => s.preferences.sidebarOpen);
  const location = useLocation();

  useEffect(() => {
    if (menuOpen) dispatch(toggleSidebar(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="shell">
      <Header />
      <MobileMenu open={menuOpen} />

      <div className="shell-body">
        <main className="shell-main" id="main">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
