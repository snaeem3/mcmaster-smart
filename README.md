# McMaster-Smart

> Browser extension to find cheaper hardware alternatives

I use [McMaster-Carr](mcmaster.com) a lot, but have frequently found their prices to be higher than their competitors ([MSC](mscdirect.com), [Grainger](grainger.com), etc.). However, the UI on competitor websites makes searching for alternatives frustrating.

This extension aims to solve this problem by quickly searching for your McMaster product elsewhere.

<p align="center">
<sub>McMaster Content Script</sub><br/>
<img width="655" src=""><br/>
</p>

## Features

- Perform a 1-click search for MSC alternatives upon visiting a McMaster-Carr Product page
- Refine the search by disabling unneccesary product features and re-ranking important ones
- Adjust search parameters using the Search Settings control panel

## Planned Features

- Price comparisons
- Additional search result data reporting
- Search other competitor sites

## Usage

### Folders

- `src` - main source.
  - `contentScripts` - scripts and components to be injected as `content_script`
  - `background` - scripts for background.
  - `components` - auto-imported Vue components that are shared in popup and options page.
  - `styles` - styles shared in popup and options page
  - `assets` - assets used in Vue components
  - `msc` - functions for mscdirect.com data extraction/processing
  - `utils` - miscellaneous helper functions
  - `manifest.ts` - manifest for the extension.
- `extension` - extension package root.
  - `assets` - static assets (mainly for `manifest.json`).
  - `dist` - built files, also serve stub entry for Vite on development.
- `scripts` - development and bundling helper scripts.

### Development

```bash
pnpm dev
```

Then **load extension in browser with the `extension/` folder**.

For Firefox developers, you can run the following command instead:

```bash
pnpm dev-firefox
```

`web-ext` auto reload the extension when `extension/` files changed.

> While Vite handles HMR automatically in the most of the case, [Extensions Reloader](https://chrome.google.com/webstore/detail/fimgfedafeadlieiabdeeaodndnlbhid) is still recommended for cleaner hard reloading.

<!-- ## Using Gitpod

If you have a web browser, you can get a fully pre-configured development environment with one click:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/antfu/vitesse-webext) -->

### Build

To build the extension, run

```bash
pnpm build
```

And then pack files under `extension`, you can upload `extension.crx` or `extension.xpi` to appropriate extension store.

## Credits

This extension was built from the [Vitesse Web Extension](https://github.com/antfu-collective/vitesse-webext) template.
