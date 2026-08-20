import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { TOOLKIT_META, groupByToolkit, routerPath } from "@devtools/tools-core";
import { toggleSidebar, type AppDispatch } from "../store.js";
import { ToolSearch } from "./ToolSearch.js";

const TOOLKIT_MENUS = groupByToolkit();

/**
 * Full-screen tool browser for narrow viewports — there's no persistent
 * sidebar (see Layout.tsx), so this is the only way to reach the catalog
 * on mobile short of going back to the home page. Opened by the header's
 * burger button, closed by its own header, Escape, or picking a tool.
 *
 * Deliberately full-screen rather than a slim drawer: a 15rem drawer just
 * repeats the same cramped list this platform already had, whereas a full
 * screen gives every toolkit's tools room to show as icon tiles, same as
 * the desktop mega-menu.
 */
export function MobileMenu({ open }: { open: boolean }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dispatch(toggleSidebar(false));
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, dispatch]);

  if (!open) return null;

  return (
    <div className="mobileMenu" role="dialog" aria-modal="true" aria-label="Browse tools">
      <div className="mobileMenu__head">
        <ToolSearch
          variant="sidebar"
          placeholder="Search tools…"
          autoFocus
          onNavigate={() => dispatch(toggleSidebar(false))}
        />
        <button
          type="button"
          className="mobileMenu__close"
          onClick={() => dispatch(toggleSidebar(false))}
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6 6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav className="mobileMenu__body" aria-label="Tools">
        {TOOLKIT_MENUS.map(([toolkit, categories]) => (
          <section className={`mobileMenu__toolkit tk-${toolkit}`} key={toolkit}>
            <h2 className="mobileMenu__toolkitTitle">
              <span className="mobileMenu__toolkitIcon" aria-hidden="true">
                {TOOLKIT_META[toolkit].icon}
              </span>
              {TOOLKIT_META[toolkit].label}
            </h2>

            {categories.map(([category, routes]) => (
              <div className="mobileMenu__group" key={category}>
                {categories.length > 1 && (
                  <h3 className="mobileMenu__groupTitle">{category}</h3>
                )}
                <div className="mobileMenu__grid">
                  {routes.map((route) => (
                    <NavLink
                      key={route.slug}
                      to={routerPath(route.slug)}
                      className="mobileMenu__link"
                      onClick={() => dispatch(toggleSidebar(false))}
                    >
                      <span className="mobileMenu__linkIcon" aria-hidden="true">
                        {route.icon}
                      </span>
                      {route.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </nav>
    </div>
  );
}
