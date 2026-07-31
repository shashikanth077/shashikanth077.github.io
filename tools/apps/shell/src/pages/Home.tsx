import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { TOOLKIT_META, findTool, groupByToolkit, routerPath, visibleRoutes } from "@devtools/tools-core";
import type { RootState } from "../store.js";

const TOOLKIT_SECTIONS = groupByToolkit();
const VISIBLE_COUNT = visibleRoutes().length;

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
        <div className="home-hero__badges">
          {(["pdf", "image", "qr", "dev"] as const).map((tk) => (
            <span key={tk} className={`home-hero__badge tk-${tk}`}>
              <span className="home-hero__badge-dot" />
              {TOOLKIT_META[tk].label}
            </span>
          ))}
        </div>
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
        <section className={`home-toolkit tk-${toolkit}`} key={toolkit}>
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
