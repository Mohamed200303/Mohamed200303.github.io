# mohamed200303.github.io

Personal site of Mohamed Salem: CS + AI at the University of Nottingham.

Plain HTML, CSS and JavaScript. No frameworks, no build step. Open `index.html` in a browser to preview.

---

## Add a project (about 10 minutes)

All projects live in one file: **`assets/js/projects.js`**. You never need to touch the HTML to add one.

**Before you start, have these ready:**
- The project's name and one or two sentences on what it does
- The tech you used (for example Python, Flask, SQL)
- Optional: a link to the code on GitHub, a link to try it, and a screenshot

**Steps:**

1. **Open** `assets/js/projects.js` in VS Code (right-click the file, choose *Open With → Visual Studio Code*).
2. **Scroll to the bottom** and find the block that starts with `TEMPLATE: copy from here`.
3. **Copy** everything between `copy from here` and `copy to here` (from the line with `{` to the line with `},`).
4. **Scroll up** to the list of projects. Find the last project's closing `},` just above the `];` line, and **paste** your copy on the empty line after it.
5. **Fill it in.** Change only the text inside the quotes:

   | Line | What to write |
   |---|---|
   | `id` | A short name for links, lowercase with dashes: `'study-timer'` |
   | `title` | The name people see: `'Study Timer'` |
   | `status` | `'finished'`, `'live'` (people can use it now), `'building'` or `'draft'` |
   | `stage` | Only if status is `'building'`: `'Plan'`, `'Build'` or `'Launch'` |
   | `type` / `role` | For example `'Web app'` and `'Solo'` or `'Team of 3'` |
   | `featured` | `true` puts it big at the top. Only one project at a time. |
   | `summary` | One or two sentences shown on the card |
   | `tags` | The tech, each in quotes: `['Python', 'Flask']` |
   | `image` | Leave `''` for an automatic picture, or add a screenshot (below) |
   | `links` | Delete any link you don't have |
   | `caseStudy` | The story people read when they click: the problem, how you built it, what you learned |

6. **Save** (⌘S) and **refresh** the page in your browser. Your project appears in Work and in the ⌘K menu.

**Adding a screenshot:** put the image in `assets/projects/` (create the folder if it isn't there), for example `assets/projects/study-timer.png`, then set `image: 'assets/projects/study-timer.png'`. Wide images (about 1600 × 1000) look best.

**If the Work section is empty after you save,** there's a typo in `projects.js`. The usual causes:
- A missing comma: every `}` that closes a project needs `},`
- A quote that isn't closed, or an apostrophe inside single quotes. Write `"it's"` with double quotes instead.
- Open the page, press **⌥⌘J** (Chrome) or **⌥⌘C** (Safari) and the console names the line with the problem.

**Finishing a project you were building:** change `status: 'building'` to `status: 'finished'` (or `'live'`), delete the `stage` line, and rewrite the case study with what you actually built and learned.

**When your first real projects are up,** remove the line *"Week 7 of my degree. This is where the projects start."* under the Work section in `index.html` (search for `work-note`).

---

## Files

| File | What it is |
|---|---|
| `assets/js/projects.js` | **Your projects.** The only file you edit to add one. |
| `index.html` | The homepage: hero, thoughts, writing, toolbox, about, contact. |
| `blog/first-year-of-cs.html` | The first essay. Copy it to add more posts. |
| `assets/css/style.css` | Every colour, font and layout rule. Colours are at the top. |
| `assets/js/network.js` | The neural network in the hero. |
| `assets/js/main.js` | Draws the projects, plus the theme toggle, ⌘K menu, thoughts and GitHub stats. |
| `assets/og.png` | The preview image shown when the link is shared. |
| `favicon.svg` | The browser tab icon. |

## Editing other content

- **Thoughts**: each thought is a `<figure class="card thought">` in `index.html`. Give it a unique `id` (used for share links) and a `data-topic` that matches one of the filter buttons.
- **New blog post**: copy `blog/first-year-of-cs.html`, change the text, then add a row to the `Writing` list in `index.html` and a command in the `commands` list in `main.js`.
- **⌘K menu**: projects are added automatically. Other entries are in the `commands` list in `assets/js/main.js`.
- **Accent colour**: change `--grad`, `--accent` and `--accent-2` near the top of `style.css`.

## Publishing on GitHub Pages

1. Create a public repository named exactly **`Mohamed200303.github.io`**.
2. Upload every file and folder here into it, keeping the folder structure.
3. In the repo, go to **Settings → Pages**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at **https://mohamed200303.github.io**.

After that, every change you push to GitHub goes live within a minute.
