import Head from "next/head";
import { homeData, siteConfig, SKILL_BAR_COLOR } from "../constants";

const Seo = ({ title, description, path, noindex = false }) => {
  const url = `${siteConfig.siteUrl}${path}`;
  const image = `${siteConfig.siteUrl}${siteConfig.ogImage}`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.fullName,
    alternateName: siteConfig.shortName,
    jobTitle: homeData.designation,
    description: homeData.bio,
    url: siteConfig.siteUrl,
    image,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vilnius",
      addressCountry: "LT",
    },
    sameAs: [siteConfig.socialLinks.linkedin],
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content={SKILL_BAR_COLOR} />
      <meta
        name="robots"
        content={noindex ? "noindex, follow" : "index, follow"}
      />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="profile" />
      <meta property="og:site_name" content={siteConfig.shortName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {!noindex && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      )}
    </Head>
  );
};

export default Seo;
