import { brand } from "@devtools/tools-core";

/**
 * Deliberately the same voice as the portfolio's Copyright.js — "Developed by
 * {name} © {year}" — so the two sites read as one person's work rather than
 * two unrelated products. The header is where this platform gets its own
 * identity; the footer is where it hands credit back to the portfolio.
 *
 * Kept to the same two links as the portfolio footer (nothing here is a real
 * distinct destination beyond the tools themselves, so a footer sitemap of
 * links that all resolve to the same home page would be padding, not navigation).
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shell-footer">
      <div className="shell-footer__row">
        <p className="shell-footer__credit">
          Developed by{" "}
          <a href={brand.linkedinUrl} target="_blank" rel="noreferrer">
            {brand.authorName}
          </a>{" "}
          © {year}
        </p>

        <nav className="shell-footer__links" aria-label="Footer">
          <a href={brand.portfolioUrl}>Portfolio</a>
          <a href={brand.linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
      </div>
    </footer>
  );
}
