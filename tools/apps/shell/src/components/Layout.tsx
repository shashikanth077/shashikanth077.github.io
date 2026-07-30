import { useEffect, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { groupByCategory, ROUTER_HOME, routerPath } from "@devtools/tools-core";
import { setTheme, toggleSidebar, type AppDispatch, type RootState } from "../store.js";

const THEME_LABEL = { system: "Auto", light: "Light", dark: "Dark" } as const;
const THEME_ORDER = ["system", "light", "dark"] as const;

export function Layout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((s: RootState) => s.preferences.theme);
  const sidebarOpen = useSelector((s: RootState) => s.preferences.sidebarOpen);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    if (sidebarOpen) dispatch(toggleSidebar(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function cycleTheme() {
    const index = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(index + 1) % THEME_ORDER.length] ?? "system";
    dispatch(setTheme(next));
  }

  return (
    <div className="shell">
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

        <NavLink to={ROUTER_HOME} className="shell-brand">
          <span className="shell-brand__mark" aria-hidden="true" />
          <span className="shell-brand__name">DevTools</span>
        </NavLink>

        <div className="shell-header__spacer" />

        <a className="shell-header__link" href="/">
          Portfolio
        </a>
        <button className="dt-btn dt-btn--quiet" type="button" onClick={cycleTheme}>
          {THEME_LABEL[theme]}
        </button>
      </header>

      <div className="shell-body">
        <aside className={sidebarOpen ? "shell-sidebar shell-sidebar--open" : "shell-sidebar"}>
          <nav aria-label="Tools">
            {groupByCategory().map(([category, routes]) => (
              <div className="shell-navgroup" key={category}>
                <h2 className="shell-navgroup__title">{category}</h2>
                <ul>
                  {routes.map((route) => (
                    <li key={route.slug}>
                      <NavLink
                        to={routerPath(route.slug)}
                        className={({ isActive }) =>
                          isActive ? "shell-navlink shell-navlink--active" : "shell-navlink"
                        }
                      >
                        {route.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <button
            className="shell-scrim"
            type="button"
            aria-label="Close navigation"
            onClick={() => dispatch(toggleSidebar(false))}
          />
        )}

        <main className="shell-main" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
