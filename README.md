# CHRONOLOCK

<p align="center">
  <img src="icons/chronolocklogo.png" width="200" />
</p>

A lightweight Firefox extension for filtering YouTube videos by upload age.

ChronoLock allows you to hide, dim, or fade videos newer than a selected cutoff year, reshaping YouTube into something slower, stranger, and more archival. Built for nostalgia, intentional browsing, old internet archaeology, and resisting the platform’s constant pressure toward recency.

![ChronoLock UI](screenshots/Screenshot1.png)

---

## Features

* Filter videos newer than a chosen year
* Three filtering modes:

  * **Hide** — removes videos entirely
  * **Dim** — desaturates and lowers opacity
  * **Fade** — visually suppresses videos without removing layout space
* Floating in-page control panel
* Persistent saved settings
* Lightweight vanilla JavaScript implementation
* No telemetry
* No tracking
* No data collection

![ChronoLock UI](screenshots/screenshot2.png)
![ChronoLock UI](screenshots/screenshot3.png)

---

## Installation (Firefox)

### Temporary Install (Developer Mode)

1. Open Firefox
2. Navigate to:

```text
about:debugging#/runtime/this-firefox
```

3. Click:

```text
Load Temporary Add-on
```

4. Select `manifest.json`

---

### Permanent Install

Install through the Firefox Add-ons page once published.

---

## Folder Structure

```text
chronolock/
├── manifest.json
├── content.js
├── LICENSE
├── README.md
└── icons/
    ├── 48.png
    └── 96.png
```

---

## License

ChronoLock is licensed under the GNU General Public License v3.0 (GPLv3).

Forks, modifications, and redistribution are welcome, provided derivatives remain open-source under the same license.

---

## Notes

YouTube changes its internal structure frequently. Future platform updates may occasionally break filtering behavior until the extension is updated.

ChronoLock intentionally avoids heavy frameworks and build pipelines in favor of a small, transparent codebase that can be easily modified and understood.

---

Created by Enargeia.
