# DC Timeline — public free Stremio catalog v2.0

An independent fan-made metadata catalog, not affiliated with DC, Warner Bros., or Stremio. No streams hosted.

## Run locally

Requires Node.js 18+. Run `npm test` then `npm start`; open `http://localhost:7000/manifest.json`.

## Publish

1. Create a public GitHub repository. Upload **the files inside this folder** to the repository root.
2. At Render, choose New > Web Service > Connect GitHub repository. Set runtime Node, build command `npm install`, start command `npm start`, and free instance if available.
3. After deployment open `https://YOUR-SERVICE.onrender.com/manifest.json` and verify JSON appears.
4. In desktop/web Stremio install using that manifest URL while signed into the same Stremio account as your Onn 4K Plus. Restart Stremio on the TV to sync.

## Optional donations

Set Render environment variable `SUPPORT_URL` to your own HTTPS donation page. Donations are optional; the add-on is fully free. Never put payment credentials in GitHub.

## Data and known limitations

- `catalog.json`: starter 88 records; `custom-titles.json`: optional extra rows, same shape. Only records with valid IMDb tt IDs appear in catalog results.
- `collections.json`: 57 requested browse options, grouped in manifest names. Stremio may show these as one long dropdown; the group prefixes help sort visually.
- `tags.json`: manually curated classifications. Add new titles and tags to expand coverage.
- Several specialized catalogs may be empty or incomplete until more records are added. No fabricated future release dates or episode-level crossover chronology.
- Original data has release years but usually not precise dates; same-year titles retain input order.
- The global story chronology is only a provisional DCEU watch order; DC multiverses cannot be merged into one canonical timeline.
- `DC Movies/TV by Decade` currently lists titles in release order, **not** distinct selectable decade catalogs.
- The add-on does not serve video or guarantee playback; other Stremio add-ons handle streams.
- This version deliberately avoids user tracking and ad injection.

## Before promoting publicly

Verify IMDb IDs, expand coverage with licensed metadata, add accurate premiere dates and episode-level crossover metadata, and check the Stremio community directory submission requirements.
