import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AUDIENCE_META,
  brand,
  groupByAudience,
  ROUTER_HOME,
  routerPath,
  type Audience,
} from "@devtools/tools-core";
import { setTheme, toggleSidebar, type AppDispatch, type RootState } from "../store.js";

const THEME_LABEL = { system: "Auto", light: "Light", dark: "Dark" } as const;
const THEME_ORDER = ["system", "light", "dark"] as const;

const AUDIENCE_MENUS = groupByAudience();

/**
 * The primary header — deliberately not a copy of the portfolio's anchor-nav
 * header. This one carries the platform's own identity (DevTools Studio, not
 * the person) and its own interaction pattern: two audience mega-menus, the
 * way a multi-category tool site like Smallpdf organises "PDF" vs "Sign" vs
 * "Convert" behind top-level dropdowns rather than a flat link list.
 */
export function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((s: RootState) => s.preferences.theme);
  const sidebarOpen = useSelector((s: RootState) => s.preferences.sidebarOpen);

  const [openMenu, setOpenMenu] = useState<Audience | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape — a mega-menu that only closes by
  // re-clicking its own trigger reads as broken.
  useEffect(() => {
    if (!openMenu) return;

    function onPointerDown(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  function cycleTheme() {
    const index = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(index + 1) % THEME_ORDER.length] ?? "system";
    dispatch(setTheme(next));
  }

  return (
    <header className="shell-header">
      <button
        className="shell-burger"
        type="button"
        onClick={() => dispatch(toggleSidebar())}
        aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={sidebarOpen}
      >
        <span aria-hidden="true">{sidebarOpen ? "✕" : "☰"}</span>
      </button>

      <NavLink to={ROUTER_HOME} className="shell-brand" onClick={() => setOpenMenu(null)}>
        <span className="shell-brand__mark" aria-hidden="true" />
        <span className="shell-brand__text">
          <span className="shell-brand__name">{brand.productName}</span>
          <span className="shell-brand__by">by {brand.authorName}</span>
        </span>
      </NavLink>

      <nav className="shell-megaNav" aria-label="Tool categories" ref={navRef}>
        {AUDIENCE_MENUS.map(([audience, categories]) => (
          <div className="shell-megaNav__item" key={audience}>
            <button
              type="button"
              className={
                openMenu === audience ? "shell-megaNav__trigger shell-megaNav__trigger--open" : "shell-megaNav__trigger"
              }
              aria-expanded={openMenu === audience}
              onClick={() => setOpenMenu((current) => (current === audience ? null : audience))}
            >
              {AUDIENCE_META[audience].label}
              <svg className="shell-megaNav__chevron" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {openMenu === audience && (
              <div className="shell-megaPanel" role="menu">
                <p className="shell-megaPanel__tagline">{AUDIENCE_META[audience].tagline}</p>
                <div className="shell-megaPanel__grid">
                  {categories.map(([category, routes]) => (
                    <div className="shell-megaPanel__col" key={category}>
                      <h3 className="shell-megaPanel__heading">{category}</h3>
                      <ul>
                        {routes.map((route) => (
                          <li key={route.slug}>
                            <NavLink
                              to={routerPath(route.slug)}
                              className="shell-megaPanel__link"
                              onClick={() => setOpenMenu(null)}
                            >
                              {route.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="shell-header__spacer" />

      <a className="shell-header__link" href={brand.portfolioUrl}>
        Portfolio
      </a>
      <button className="dt-btn dt-btn--quiet" type="button" onClick={cycleTheme}>
        {THEME_LABEL[theme]}
      </button>
    </header>
  );
}
