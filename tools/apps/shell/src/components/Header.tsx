import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TOOLKIT_META,
  brand,
  groupByToolkit,
  ROUTER_HOME,
  routerPath,
  type Toolkit,
} from "@devtools/tools-core";
import { setTheme, toggleSidebar, type AppDispatch, type RootState } from "../store.js";
import { ToolSearch } from "./ToolSearch.js";

const THEME_LABEL = { system: "Auto", light: "Light", dark: "Dark" } as const;
const THEME_ORDER = ["system", "light", "dark"] as const;

const TOOLKIT_MENUS = groupByToolkit();

export function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((s: RootState) => s.preferences.theme);
  const sidebarOpen = useSelector((s: RootState) => s.preferences.sidebarOpen);

  const [openMenu, setOpenMenu] = useState<Toolkit | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

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
        <span className="shell-brand__mark" aria-hidden="true">{brand.productIcon}</span>
        <span className="shell-brand__text">
          <span className="shell-brand__name">{brand.productName}</span>
          <span className="shell-brand__by">by {brand.authorName}</span>
        </span>
      </NavLink>

      <nav className="shell-megaNav" aria-label="Tool categories" ref={navRef}>
        {TOOLKIT_MENUS.map(([toolkit, categories]) => (
          <div className={`shell-megaNav__item tk-${toolkit}`} key={toolkit}>
            <button
              type="button"
              className={
                openMenu === toolkit ? "shell-megaNav__trigger shell-megaNav__trigger--open" : "shell-megaNav__trigger"
              }
              aria-expanded={openMenu === toolkit}
              onClick={() => setOpenMenu((current) => (current === toolkit ? null : toolkit))}
            >
              <span className="shell-megaNav__dot" aria-hidden="true" />
              {TOOLKIT_META[toolkit].label}
              <svg className="shell-megaNav__chevron" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {openMenu === toolkit && (
              <div className="shell-megaPanel" role="menu">
                <div className="shell-megaPanel__inner">
                  <div className="shell-megaPanel__grid">
                    {categories.map(([category, routes]) => (
                      <div className="shell-megaPanel__col" key={category}>
                        {categories.length > 1 && (
                          <h3 className="shell-megaPanel__heading">{category}</h3>
                        )}
                        <ul>
                          {routes.map((route) => (
                            <li key={route.slug}>
                              <NavLink
                                to={routerPath(route.slug)}
                                className="shell-megaPanel__link"
                                onClick={() => setOpenMenu(null)}
                              >
                                <span className="shell-megaPanel__linkIcon" aria-hidden="true">
                                  {route.icon}
                                </span>
                                {route.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="shell-header__search">
        <ToolSearch variant="header" placeholder="Search tools…" />
      </div>

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
