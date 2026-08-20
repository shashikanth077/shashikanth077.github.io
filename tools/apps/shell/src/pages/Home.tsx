import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { TOOLKIT_META, findTool, groupByToolkit, routerPath, visibleRoutes } from "@devtools/tools-core";
import { ToolSearch } from "../components/ToolSearch.js";
import type { RootState } from "../store.js";

const TOOLKIT_SECTIONS = groupByToolkit();
const VISIBLE_COUNT = visibleRoutes().length;

const TRUST_ITEMS = [
  { label: "No upload", detail: "Files never leave your device" },
  { label: "No signup", detail: "Nothing to create or remember" },
  { label: "Works offline", detail: "After the page has loaded once" },
  { label: "Free", detail: "Every tool, no limits" },
];

export default function Home() {
  const recentSlugs = useSelector((s: RootState) => s.preferences.recentSlugs);
  const recent = recentSlugs
    .map(findTool)
    .filter((t): t is NonNullable<typeof t> => t !== undefined && !t.hidden);

  return (
    <div className="home">
      <section className="home-hero">
        <h1 className="home-hero__title">Free tools that never upload your data</h1>
        <p className="home-hero__lede">
          {VISIBLE_COUNT} PDF, image and developer utilities that run entirely in your browser.
          No account, no server, no file leaves your machine — open the network tab and check.
        </p>

        <ToolSearch
          variant="hero"
          placeholder={`Search ${VISIBLE_COUNT} tools — try "merge pdf" or "bmi"`}
        />

        <ul className="home-hero__trust">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} title={item.detail}>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M20 6 9 17l-5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section className="home-section">
          <h2 className="home-section__title">Recently used</h2>
          <ul className="home-grid">
            {recent.map((tool) => (
              <li key={tool.slug} className={`tk-${tool.toolkit}`}>
                <Link to={routerPath(tool.slug)} className="home-card">
                  <span className="home-card__icon" aria-hidden="true">{tool.icon}</span>
                  <span className="home-card__body">
                    <span className="home-card__name">{tool.name}</span>
                    <span className="home-card__desc">{tool.tagline}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {TOOLKIT_SECTIONS.map(([toolkit, categories]) => (
        <section className={`home-toolkit tk-${toolkit}`} key={toolkit} id={`tk-${toolkit}`}>
          <header className="home-toolkit__head">
            <span className="home-toolkit__icon" aria-hidden="true">
              {TOOLKIT_META[toolkit].icon}
            </span>
            <div className="home-toolkit__info">
              <h2 className="home-toolkit__title">{TOOLKIT_META[toolkit].label}</h2>
              <p className="home-toolkit__tagline">{TOOLKIT_META[toolkit].tagline}</p>
            </div>
          </header>

          {categories.map(([category, routes]) => (
            <section className="home-section" key={category}>
              {categories.length > 1 && (
                <h3 className="home-section__title">{category}</h3>
              )}
              <ul className="home-grid">
                {routes.map((tool) => (
                  <li key={tool.slug} className={`tk-${toolkit}`}>
                    <Link to={routerPath(tool.slug)} className="home-card">
                      <span className="home-card__icon" aria-hidden="true">{tool.icon}</span>
                      <span className="home-card__body">
                        <span className="home-card__name">{tool.name}</span>
                        <span className="home-card__desc">{tool.tagline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      ))}
    </div>
  );
}
