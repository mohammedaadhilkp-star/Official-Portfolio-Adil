# Mohammed Adil KP — personal portfolio

Five static pages made with semantic HTML, CSS, and vanilla JavaScript. No framework, backend, build step, external libraries, or font downloads.

## Local preview

Run from this folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/index.html. The pages are also readable directly from disk; HTTP is recommended for verification.

## Latest visual direction

The hero uses the supplied `adil.png` photograph, compressed to `assets/adil-portrait.webp` with its transparent background and original aspect ratio preserved. The portrait is scaled by height, centered, and softly blended at its lower edge. Desktop has a location badge, professional introduction on the right, and a large moving name across the lower hero. Mobile reorganizes the professional text and links below the portrait.

The hero composition is inspired by [Dennis Snellenberg](https://dennissnellenberg.com/). The scroll-led presentation takes inspiration from [Lusion](https://lusion.co/), with original CSS project frames, reveal masks, gentle scaling, word reveals, and colored stripes. No reference site code, images, portfolio work, or claims were copied.

The page opens directly into the hero. There is no loading screen, 3D character, MacBook scene, or WebGL dependency.

## Animation controls

`js/motion.js` runs the scroll choreography using one requestAnimationFrame loop, with native browser scrolling:

- The oversized name moves horizontally and responds to scroll.
- The portrait moves by a bounded 45 px as the hero leaves view.
- The introductory words brighten in sequence.
- Blue, violet, teal, and warm stripes shift and become more visible with scrolling. Colors and thickness are in `.scroll-stripes` in `css/style.css`.
- Project art scales gently, moves vertically, and rotates its geometric accents.
- `js/main.js` fades sections and cards into view and expands project reveal masks. Timeline progress still follows scrolling in both directions.

Reduced motion disables moving stripes, marquee motion, portrait movement, project movement, and word fading; active reveals are cancelled. No content is hidden by default, so the page remains readable if JavaScript fails. The animation loop pauses when the tab is hidden and settles when the hero is offscreen and scrolling stops.

## Edit your content

- Personal details and page text: edit the five HTML files directly.
- Shared navigation and footer: update all five files to preserve no-JavaScript navigation.
- Hero and About photo: replace `assets/adil-portrait.webp` and update image dimensions and alt text. Use a transparent portrait with enough surrounding space.
- Services: edit `services.html` and the homepage accordion in `index.html`.
- Projects: edit each `.project` article in `index.html` and `projects.html`. Add a real title, category, image, description, role, and optional real URL. Existing graphics are explicitly labelled placeholders and are not claimed as completed client work. Add an anchor only when a real URL is available.
- Experience: edit `.milestone` articles in `index.html` and `about.html`. Only the supplied dates and role titles are included; no employers, descriptions, achievements, or logos have been invented.
- Contact: add your email or full `https://` contact URLs in `js/config.js`. Empty contacts stay hidden. A prototype notice remains until a contact is supplied. There is no form pretending to send a message. For no-JavaScript contact access, add the real links directly to the HTML as well.
- Fonts: the site uses Arial/Helvetica. If licensed PP Neue Montreal files become available, add an `@font-face` and update the body font family in `css/style.css`.

## GitHub

Create a repository, then run from this folder:

```sh
git init
git add .
git commit -m "Add personal portfolio"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

No repository push or deployment was performed in this delivery.

## Vercel

Import your GitHub repository. Select **Other** as the framework preset, enable the Build Command override and leave it empty, and use the repository root as the output directory. If committing a parent directory, set the project root to `portfolio`. No build is required.

[Official Vercel build settings](https://vercel.com/docs/builds/configure-a-build)

Each page has a unique title and description. Add domain-dependent canonical URLs and a sitemap only after your real domain is known. All assets and page links are relative.

## Accessibility and performance

One H1 per page, visible keyboard focus, semantic headings/landmarks, keyboard-operable mobile navigation and accordions, image alt text, and reduced-motion handling. Mobile navigation remains expanded without JavaScript. The hero photo reserves its dimensions and the About image is lazy-loaded. Motion uses bounded transforms; native scrolling is retained. No remote media or oversized 3D asset is loaded.
