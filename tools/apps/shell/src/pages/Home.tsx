import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { AUDIENCE_META, findTool, groupByAudience, routerPath, toolRoutes } from "@devtools/tools-core";
import type { RootState } from "../store.js";

export default function Home() {
  const recentSlugs = useSelector((s: RootState) => s.preferences.recentSlugs);
  const recent = recentSlugs.map(findTool).filter((t) => t !== undefined);

  return (
    <div className="home">
      <section className="home-hero">
        <h1 className="home-hero__title">Free tools that never upload your data</h1>
        <p className="home-hero__lede">
          {toolRoutes.length} PDF, image and developer utilities that run entirely in your browser.
          No account, no server, no file leaves your machine — open the network tab and check.
        </p>
        <p className="home-hero__meta">
          Built as a micro-frontend platform with React, TypeScript and Module Federation.
        </p>
      </section>

      {recent.length > 0 && (
        <section className="home-section">
          <h2 className="home-section__title">Recently used</h2>
          <ul className="home-grid">
            {recent.map((tool) => (
              <li key={tool.slug}>
                <Link to={routerPath(tool.slug)} className="home-card">
                  <span className="home-card__name">{tool.name}</span>
                  <span className="home-card__desc">{tool.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {groupByAudience().map(([audience, categories]) => (
        <section className="home-audience" key={audience}>
          <header className="home-audience__head">
            <h2 className="home-audience__title">{AUDIENCE_META[audience].label}</h2>
            <p className="home-audience__tagline">{AUDIENCE_META[audience].tagline}</p>
          </header>

          {categories.map(([category, routes]) => (
            <section className="home-section" key={category}>
              <h3 className="home-section__title">{category}</h3>
              <ul className="home-grid">
                {routes.map((tool) => (
                  <li key={tool.slug}>
                    <Link to={routerPath(tool.slug)} className="home-card">
                      <span className="home-card__name">{tool.name}</span>
                      <span className="home-card__desc">{tool.tagline}</span>
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
