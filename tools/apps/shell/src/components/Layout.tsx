import { useEffect, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TOOLKIT_META, groupByToolkit, routerPath } from "@devtools/tools-core";
import { toggleSidebar, type AppDispatch, type RootState } from "../store.js";
import { Header } from "./Header.js";
import { Footer } from "./Footer.js";

const TOOLKIT_MENUS = groupByToolkit();

export function Layout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const sidebarOpen = useSelector((s: RootState) => s.preferences.sidebarOpen);
  const location = useLocation();

  useEffect(() => {
    if (sidebarOpen) dispatch(toggleSidebar(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="shell">
      <Header />

      <div className="shell-body">
        <aside className={sidebarOpen ? "shell-sidebar shell-sidebar--open" : "shell-sidebar"}>
          <nav aria-label="Tools">
            {TOOLKIT_MENUS.map(([toolkit, categories]) => (
              <div className={`shell-navtoolkit tk-${toolkit}`} key={toolkit}>
                <h2 className="shell-navtoolkit__title">
                  <span className="shell-navtoolkit__dot" aria-hidden="true" />
                  {TOOLKIT_META[toolkit].label}
                </h2>
                {categories.map(([category, routes]) => (
                  <div className="shell-navgroup" key={category}>
                    {categories.length > 1 && (
                      <h3 className="shell-navgroup__title">{category}</h3>
                    )}
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

      <Footer />
    </div>
  );
}
