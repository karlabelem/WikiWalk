# 🚶 Wiki Walk

**Wiki Walk** is a Chrome extension that turns your Wikipedia browsing sessions into a navigable trail — visualizing where you clicked, how far you wandered, and how it all connects. Instead of losing track of your rabbit hole, you can watch your path unfold, pin the articles that mattered, and retrace your steps whenever you want.

Built for curious wanderers and researchers alike: casual users get a fun, shareable map of their browsing; researchers get a structured, exportable record of how they got from a question to an answer.

---

## ✨ Features

- **Footprints trail view** — your browsing history rendered as a winding, animated path rather than a static graph
- **Distance walked** — track how many articles and links you've traversed in a session
- **Landmarks** — pin key articles along your walk to mark sources that actually mattered
- **Retrace your steps** — replay your path in order, article by article
- **Research export** — export your trail as a structured outline for notes, citations, or further reading

---

## 🛠️ Tech Stack

- **[WXT](https://wxt.dev/)** — modern Manifest V3 extension framework (content scripts, background service worker, dev HMR)
- **React + TypeScript** — UI for the popup, side panel, and trail visualization
- **Tailwind CSS** — styling

---

## 📁 Project structure

```
entrypoints/
  background.ts     # owns the walk session: appends footprints, toggles landmarks, resets
  content.ts         # runs on wikipedia.org/wiki/* pages, reports each article visit
  popup/              # toolbar popup: quick stats + "Open trail" / "Reset"
  sidepanel/          # main trail view: list of footprints, retrace, export
lib/
  types.ts            # WalkNode / WalkSession data model
  storage.ts          # reads/writes the active session in browser.storage.local
  messaging.ts        # typed request/response protocol between UI and background
```

## 🧑‍💻 Development

```
npm install
npm run dev       # launches Chrome with the extension loaded, with HMR
npm run build     # production build, output in .output/chrome-mv3
```

---

## 🚧 Status

The WXT project is scaffolded and end-to-end tracking works: visiting Wikipedia articles builds a session in the background, and the popup/side panel read it live. The **footprints trail visualization** is still a plain ordered list — the winding path/footprint graphic is the next major piece to build, along with richer branch handling (currently a session is a single append-only path with no history-based reset).

---

## 📄 License

MIT
