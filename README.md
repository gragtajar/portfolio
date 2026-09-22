# rajatg.in

The portfolio of Rajat Garg, product designer. Hand-written HTML, CSS and vanilla JavaScript; no build step.

- `index.html`: the homepage, one screen on desktop with a strip of work along the bottom.
- `lenskart-eye-test.html`: the Lenskart in-store eye test case study.
- `screening-room.html`: a movie bracket game (`js/screening-room.js`, films in `data/movies.json`, posters from TMDB).
- `css/site.css` holds the design system shared by every page; `css/case-study.css` and `css/screening-room.css` extend it for their pages; `css/intro.css` is the opening crawl.
- `js/site.js` runs the strip, the Sound and Lights switches and the footer; `js/cursor.js` is the Figma-style cursor; `js/intro.js` the crawl.
- `assets/fonts/`: Archivo and Bebas Neue, self-hosted under the SIL Open Font License (licence texts beside them).
- `.htaccess`: redirects, security headers and caching for the Apache host.

## Deploying

A push to `main` runs `.github/workflows/deploy.yml`, which syncs the repository to the host over FTP. The three connection details are repository secrets (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`). The workflow refuses to run if any is missing.

The site's `/cua/` path is a private tool kept in a separate private repository and deployed from there. This repository never carries a `cua` folder and its deploy excludes that path in both directions, so the two deploys cannot interfere.

## Working locally

Any static file server will do, for example `npx http-server . -p 8080 -c-1`.

Code and content © Rajat Garg. The fonts are under the SIL Open Font License.
