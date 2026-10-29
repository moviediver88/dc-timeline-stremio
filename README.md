# DC Timeline

### Free DC catalogs and watch orders for Stremio

Browse DC movies, TV series, and animation through a simple **11-category menu**.

An independent fan project by **DolphinDiver**. Not affiliated with DC, Warner Bros., or Stremio.

## Install

1. Open **Stremio**.
2. Paste this URL into the add-on search field:

   ```text
   https://dc-timeline-stremio.onrender.com/manifest.json
   ```

3. Select **Install**.
4. Open **Discover**, select **DC**, and choose a category.

Use the same Stremio account on your other devices. Restart their apps if the add-on has not appeared yet.

## Explore the catalogs

| Category | Browse |
| --- | --- |
| Movies | DC movies |
| Series | DC television series |
| Animation | Animated movies and series |
| DCEU Story Order | A suggested DCEU story sequence |
| DCEU Release Order | DCEU titles by release date |
| DCU | Titles from the new DC Universe |
| Batman | Batman movies and series |
| Superman | Superman movies and series |
| Wonder Woman | Wonder Woman titles |
| Arrowverse | Arrowverse series |
| Animated Universes | Selected DCAU, DCAMU, and Tomorrowverse titles |

## Playback

DC Timeline provides catalogs and watch-order guides. **It does not host video streams.**

Playback requires other installed add-ons and depends on their availability.

## Support the project

Enjoying DC Timeline? Optional tips help support maintenance and future improvements.

### [☕ Support DolphinDiver on Ko-fi](https://ko-fi.com/dolphindiver)

**The add-on remains free.** Donations do not purchase movies, streams, or access.

## Current version and notes

**Version 3.1.0 · 11 browsing categories**

- This catalog is a work in progress, not a complete collection of every DC production. Some titles or artwork may be missing or incorrect; existing IMDb links and artwork have not all been independently audited.
- The underlying dataset contains 326 records, including 159 unfinished reference records hidden from browsing.
- DCEU Story Order is a suggested title-level guide, not a verified scene-by-scene or season-by-season chronology.
- *Justice League* and *Zack Snyder’s Justice League* are alternate versions of the story, not consecutive story events.
- Arrowverse lists series, rather than an episode-by-episode crossover sequence.
- Animated Universes combines selected titles from several continuities in release order.
- Smallville episode browsing and playback have been tested on Windows. DC catalog browsing has also been checked on an onn Google TV device.

## Feedback

Found a missing title, incorrect poster, or catalog issue?

[Report an issue on GitHub](https://github.com/moviediver88/dc-timeline-stremio/issues)

Include the **title, year, device, and Stremio app version**.

Please do not include passwords, API keys, payment details, or private add-on URLs.

## Run locally

Requires **Node.js 18 or newer**.

```bash
npm install
npm start
```

Then open:

http://localhost:7000/manifest.json
