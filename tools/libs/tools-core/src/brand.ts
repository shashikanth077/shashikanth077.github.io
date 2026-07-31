/**
 * Platform identity, shared by the shell's Header and Footer.
 *
 * Mirrors src/constants.js in the portfolio (siteConfig.fullName, socialLinks)
 * rather than importing it — the portfolio is a separate Next.js app outside
 * this workspace, so there is nothing to import from. Keeping the values here
 * in one place is the same pattern applied one repo boundary over.
 */

export const brand = {
  /** The platform's own name — distinct from "Shashikanth H R", the person. */
  productName: "ToolNest",
  productIcon: "🏗️",
  authorName: "Shashikanth Hosur Ramegowda",
  portfolioUrl: "https://shashikanth077.github.io/",
  linkedinUrl: "https://www.linkedin.com/in/shashikanth-hr/",
};
