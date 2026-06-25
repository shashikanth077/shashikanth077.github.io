# Shashikanth H R — Personal Portfolio

A personal portfolio website for **Shashikanth H R**, Principal Engineer with 12+ years of experience in full-stack development, systems architecture, and engineering leadership.

Live site: [shashikanth077.github.io](https://shashikanth077.github.io)

## Tech Stack

| Layer        | Technology                                                   |
| ------------ | ------------------------------------------------------------ |
| Framework    | [Next.js](https://nextjs.org/) 12                            |
| UI Library   | [React](https://reactjs.org/) 18                             |
| Styling      | CSS (custom + plugins)                                       |
| Animations   | [WOW.js](https://wowjs.uk/)                                  |
| Slider       | [Swiper](https://swiperjs.com/) 8                            |
| Counter      | [react-countup](https://github.com/glennreyes/react-countup) |
| Contact Form | [EmailJS](https://www.emailjs.com/)                          |
| Deployment   | GitHub Pages (static export)                                 |

---

## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn

### Installation

```bash
git clone https://github.com/shashikanth077/shashikanth077.github.io.git
cd shashikanth077.github.io
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Export (Static)

```bash
npm run export
```

This runs `next build && next export` and outputs a static site to the `out/` directory, ready for GitHub Pages deployment.

---

## Project Structure

```
├── pages/               # Next.js pages (index, dark mode variant)
├── public/
│   ├── css/             # Global stylesheets and fonts
│   └── img/             # All images (hero, about, portfolio, etc.)
├── src/
│   ├── components/      # Sections: Home, About, Skills, Portfolio…
│   ├── layouts/         # Header, Footer, Mobile nav, Preloader…
│   └── utilits.js       # Shared utility functions
└── styles/
    └── globals.css      # Global CSS overrides
```

### Key Sections

- **Home** — Hero banner with name, title, and CTA
- **About** — Bio, experience, and downloadable CV
- **Skills** — Technical skills with progress bars
- **Portfolio** — Project showcase with detail popups
- **Services** — Service offerings
- **Process** — Work process / methodology
- **Counter** — Stats (years of experience, projects, etc.)
- **Contact** — EmailJS-powered contact form

## Customization

All personal data (name, bio, images, project details, skills, etc.) is defined directly inside each component file under `src/components/`. Update the data objects at the top of each component to personalize the content.

---

## License

This project is for personal portfolio use. All rights reserved by Shashikanth H R.
