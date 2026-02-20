# 🎨 Claude Avatar Studio

> _Because even an AI deserves a wardrobe._ 👗

Give your Claude Code CLI a personal touch! Swap out the default avatar for
party hats, crowns, cat ears, and more — all rendered in glorious Unicode
block art, right in your terminal.

**Feel free to submit your own creations!** 🎉

> [!TIP]
> **Enjoying Avatar Studio?** Give the repo a ⭐ so others can find it too!
> It helps us know how many people are rocking custom hats. 👒

---

## 🚀 Quickstart

```bash
# Pick from the menu
./custom_claude.sh

# Or go direct
./custom_claude.sh 3          # by number
./custom_claude.sh crown      # by key
./custom_claude.sh random     # feeling lucky?

# Undo everything
./custom_claude.sh 0
```

> [!IMPORTANT]
> After installing, you must **fully restart Claude**
> (`Ctrl+D` then `claude`) for the new look to appear.

---

## 👒 The Collection

| # | Key | Name | Vibe |
|:---:|-----|------|------|
| 1 | `party_hat` | 🥳 Party Hat | `▲▲▲` on top — it's a celebration |
| 2 | `crown` | 👑 Crown | `█▄█▄█` golden royalty |
| 3 | `birthday_hat_red` | 🔴 Birthday Hat — Red | `✦│▄█▄` festive in red |
| 4 | `birthday_hat_green` | 🟢 Birthday Hat — Green | `✦│▄█▄` festive in green |
| 5 | `birthday_hat_yellow` | 🟡 Birthday Hat — Yellow | `✦│▄█▄` festive in yellow |
| 6 | `birthday_hat_purple` | 🟣 Birthday Hat — Purple | `✦│▄█▄` festive in purple |
| 7 | `cat_ears` | 🐱 Cat Ears | `▲    ▲` meow |
| 8 | `thinking_cap` | 🎩 Top Hat | `🎩` distinguished |
| 9 | `bloomberg_terminal` | 🖥️ Bloomberg Terminal | `▓▓ ▓▓` dual monitors |
| 0 | — | ↩️ Restore Original | back to factory settings |

> [!TIP]
> Can't decide? Try `./custom_claude.sh random` and let fate choose for you! 🎲

---

## 🔧 How It Works

```
 ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
 │  avatars.js  │ ──>  │  compiler   │ ──>  │   cli.js    │
 │  (config)    │      │  (engine)   │      │  (patched)  │
 └─────────────┘      └─────────────┘      └─────────────┘
```

1. 📄 **`avatars.js`** — Pure data. Every avatar is defined as a readable
   object with preview art and a structured layout. Want a new hat?
   Edit this file.

2. ⚙️ **`do_claude_replacement.js`** — The compiler. Reads an avatar
   definition, compiles it into React `createElement` calls, and
   patches `cli.js` with a targeted string replacement.

3. 🐚 **`custom_claude.sh`** — Thin shell wrapper. Handles backup/restore,
   generates the menu dynamically from `avatars.js`, and invokes the
   compiler.

The shell script always restores from backup before applying a new avatar,
so each install starts from a clean slate. If anything goes wrong, the
backup is restored automatically.

---

## ✏️ Adding Your Own Avatar

Open `avatars.js` and add a new entry. Here's the anatomy:

```js
my_avatar: {
    name: "My Avatar",
    menuLabel: "My Avatar (♦)",
    preview: `
           ♦
          ▐▛███▜▌
         ▝▜█████▛▘
           ▘▘ ▝▝
    `,
    layout: "column",
    lines: [
        { text: "    ♦    ", color: "warning" },  // hat/accessory
        { ref: "q" },                              // face (don't touch)
        BASE_EYES,                                 // eyes (or customize)
        BASE_MOUTH,                                // mouth (or customize)
    ],
},
```

### Line types

| Type | Example | What it does |
|------|---------|-------------|
| `{ ref: "q" }` | Face | Emits the face variable as-is |
| `{ text: "...", color: "..." }` | Single span | One colored text element |
| `{ args: [...], color: "..." }` | Multi-arg span | Multiple strings in one element (like the mouth) |
| `{ segments: [...] }` | Multi-color line | Several colored spans on one line (like the eyes) |

### 🎨 Available theme colors

> [!NOTE]
> Use these **theme tokens** — not raw CSS color names like `"red"` or `"green"`.
> Raw names will render as white!

| Token | Color | Preview |
|-------|-------|---------|
| `clawd_body` | Claude orange | 🟠 |
| `error` | Red | 🔴 |
| `success` | Green | 🟢 |
| `warning` | Yellow / Gold | 🟡 |
| `permission` | Purple / Blue | 🟣 |
| `subtle` | Grey | ⚪ |
| `ide` | Teal / Blue | 🔵 |

### Layouts

**Column** (`layout: "column"`) — Lines stacked vertically. Use `lines: [...]`.

**Row** (`layout: "row"`) — Side-by-side elements per line. Use `rows: [{ left: ..., right: ... }]`.
Good for placing accessories next to Claude (see Bloomberg Terminal).

### 🧪 Dry run

Preview the compiled output without modifying anything:

```bash
node do_claude_replacement.js /dev/null my_avatar --dry-run
```

---

## 🩹 Troubleshooting

| Problem | Fix |
|---------|-----|
| 😶 Avatar doesn't show up | Restart Claude completely (`Ctrl+D` then `claude`) |
| 🔍 "Search pattern not found" | CLI may have updated — delete `cli.js.backup` and run again |
| ✂️ Avatar is cut off vertically | Keep to 2 lines max above the face |
| 🏳️ Colors appear white | Use theme tokens (`error`, `success`) not raw names (`red`, `green`) |

---

## 🗑️ Uninstall

```bash
./custom_claude.sh 0
```

> [!CAUTION]
> This restores the original `cli.js` from backup. Your beautiful hat will be gone! 😢

But don't worry — you can always put it back on. 🎩
