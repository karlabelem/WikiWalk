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

## 🚧 Status

Wiki Walk is under active development. Current focus: scaffolding the WXT project structure and building out the core trail-tracking and visualization pipeline.

---

## 📦 Getting Started

```bash
# clone the repo
git clone https://github.com/<your-username>/wiki-walk.git
cd wiki-walk

# install dependencies
npm install

# run in dev mode
npm run dev
```

Then load the unpacked extension from the generated `.output/chrome-mv3` directory into Chrome via `chrome://extensions` (Developer Mode → Load unpacked).

---

## 📄 License

MIT
