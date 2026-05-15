# 🌿 TreeCraft

**Free, browser-based tree diagram builder. Type indented text → get a clean visual tree. No login. No install. No server.**

---

## ✨ Features

- **Live preview** — diagram updates as you type
- **Text-first input** — plain indented text, no drag-and-drop fiddling
- **30+ Google Fonts** — grouped by use case: handdrawn, academic, monospace, and more
- **Indian & world language support** — Bengali, Hindi, Tamil, Telugu, Kannada, Arabic, Chinese, Japanese, Korean, Urdu, and more
- **Font size & weight control** — independent of node sizing
- **Node Scale** — control padding inside nodes separately from text size
- **Node styles** — Rectangle, Rounded, Pill, or No box
- **Two layouts** — Top→Down and Left→Right
- **Full colour control** — background, node fill, border/lines, text
- **H/V spacing sliders** — horizontal and vertical gaps independently
- **Indent/Outdent buttons** — promote or demote lines like Word's list controls
- **Dark mode**
- **Export PNG** — download your diagram as an image
- **Drag-to-resize** — adjustable editor/preview split

---

## 🚀 Usage

Just open `https://durbarghosh.com/tool/tree-diagram-maker/` in any modern browser. That's it.

```bash
# Clone the repo
git clone https://github.com/yourusername/treecraft.git

# Open in browser
open treecraft/tree-diagram-builder.html
```

Or [download the HTML file directly](tree-diagram-builder.html) and open it locally.

---

## 📝 Input Format

Write your hierarchy as plain indented text. Each level of indentation = one level deeper in the tree. Use **2 spaces** or **Tab** per level.

```
Root Node
  Child A
  Child B
    Grandchild B1
    Grandchild B2
  Child C
```

The parser also strips standard tree-drawing characters (`└─`, `├─`, `│`) so you can paste terminal tree output directly.

### Example — Bengali classification tree

```
নিয়ত ভূমিবিন্যাস
  নকর
  নকলপার্শ্বীয়
    বৃদ্ধিসংকোচন
    হ্রাসবৃদ্ধি
  দ্বি-পার্শ্বীয়
  বহুপার্শ্বীয়
```

---

## 🎛 Controls

| Control                     | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| **Font**                    | 30+ Google Fonts in 7 categories                            |
| **Font Size**               | Exact text size in px (8–72)                                |
| **Weight**                  | Light / Regular / Semi-Bold / Bold                          |
| **Node Scale**              | Padding around text inside nodes — independent of font size |
| **Layout**                  | Top→Down or Left→Right                                      |
| **Nodes**                   | Rectangle / Rounded / Pill / No box                         |
| **⇥ Child / ⇤ Parent**      | Indent or outdent the current line                          |
| **H Spacing / V Spacing**   | Horizontal and vertical gaps between nodes                  |
| **BG / Node / Line / Text** | Individual colour pickers                                   |
| **↺ Reset**                 | Restore default colours                                     |
| **◑ Dark**                  | Toggle dark mode                                            |
| **Export PNG**              | Download diagram as PNG                                     |

---

## 🔤 Font Categories

| Category                | Fonts                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ✏ Handdrawn             | Architects Daughter, Caveat                                                                                          |
| 📐 Modern / UI          | Syne, Roboto, Open Sans, Unbounded                                                                                   |
| 🎓 Academic / Formal    | EB Garamond, Libre Baskerville, Source Serif 4, Merriweather, Spectral                                               |
| 📖 Editorial / Literary | DM Serif Display, Playfair Display, Crimson Pro, Lora                                                                |
| 💻 Monospace            | Space Mono, JetBrains Mono                                                                                           |
| 🇮🇳 Indian Languages     | Noto Sans Bengali, Noto Sans Devanagari, Tiro Devanagari, Hind, Noto Sans Tamil, Noto Sans Telugu, Noto Sans Kannada |
| 🌍 World Languages      | Noto Sans, Noto Sans SC, Noto Sans JP, Noto Sans KR, Noto Sans Arabic, Noto Nastaliq Urdu                            |

---

## 🏗 How it works

- Canvas-based rendering — diagrams draw to a `<canvas>` element, which exports cleanly as PNG
- No frameworks, no build step, no npm
- Fonts loaded from Google Fonts CDN (requires internet connection for font loading)

---

## 📐 What kind of diagram is this?

Depending on context, this type of diagram is called:

- **Hierarchical tree diagram** — general term
- **Classification tree** / **Taxonomy diagram** — when categorising things
- **Dendrogram** — in biology or data science
- **Org chart** — when showing people or roles
- **Hyponymy tree** — in linguistics

The underlying data structure is a **rooted tree** in computer science.

---

Built by [Durbar Ghosh](https://github.com/yourusername)
