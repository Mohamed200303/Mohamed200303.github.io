# mohamed200303.github.io

Personal site of Mohamed Salem: CS + AI at the University of Nottingham.
Live at **https://mohamed200303.github.io**

Plain HTML, CSS and JavaScript. No frameworks, no build step. Open `index.html` in a browser to preview.
All files sit side by side in one folder (no subfolders), so the whole site can be uploaded to GitHub by dragging the files in.

---

## Put a change online (about 2 minutes)

1. Make your change in the files on your Mac and check it by opening `index.html`.
2. Go to **https://github.com/Mohamed200303/Mohamed200303.github.io** in Safari.
3. Click **Add file → Upload files**.
4. Drag in **only the files you changed** (for a new project, that's usually just `projects.js`, plus a screenshot if you have one).
5. Click the green **Commit changes** button.
6. Wait about a minute, then refresh **https://mohamed200303.github.io**. Changes can take a couple of minutes to appear; force a refresh with ⌘⇧R.

---

## Add a project (about 10 minutes)

All projects live in one file: **`projects.js`**. You never need to touch the HTML to add one.

**Before you start, have these ready:**
- The project's name and one or two sentences on what it does
- The tech you used (for example Python, Flask, SQL)
- Optional: a link to the code on GitHub, a link to try it, and a screenshot

**Steps:**

1. **Open** `projects.js` in VS Code (right-click the file, choose *Open With → Visual Studio Code*).
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
7. **Put it online** with the steps above (upload `projects.js`).

**Adding a screenshot:** save the image in the same folder as `projects.js`, for example `study-timer.png`, then set `image: 'study-timer.png'`. Upload the image too when you put the change online. Wide images (about 1600 × 1000) look best.

**If the Work section is empty after you save,** there's a typo in `projects.js`. The usual causes:
- A missing comma: every `}` that closes a project needs `},`
- A quote that isn't closed, or an apostrophe inside single quotes. Write `"it's"` with double quotes instead.
- Open the page, press **⌥⌘C** (Safari) or **⌥⌘J** (Chrome) and the console names the line with the problem.

**Finishing a project you were building:** change `status: 'building'` to `status: 'finished'` (or `'live'`), delete the `stage` line, and rewrite the case study with what you actually built and learned.

**When your first real projects are up,** remove the line *"Week 7 of my degree. This is where the projects start."* under the Work section in `index.html` (search for `work-note`).

---

## Files

| File | What it is |
|---|---|
| `projects.js` | **Your projects.** The only file you edit to add one. |
| `index.html` | The homepage: hero, thoughts, writing, toolbox, about, contact. |
| `first-year-of-cs.html` | The first essay. Copy it to add more posts. |
| `style.css` | Every colour, font and layout rule. Colours are at the top. |
| `network.js` | The neural network in the hero. |
| `main.js` | Draws the projects, plus the theme toggle, ⌘K menu, thoughts and GitHub stats. |
| `og.png` | The preview image shown when the link is shared. |
| `favicon.svg` | The browser tab icon. |

## Editing other content

- **Thoughts**: each thought is a `<figure class="card thought">` in `index.html`. Give it a unique `id` (used for share links) and a `data-topic` that matches one of the filter buttons.
- **New blog post**: copy `first-year-of-cs.html` to a new name, change the text, then add a row to the `Writing` list in `index.html` and a command in the `commands` list in `main.js`.
- **⌘K menu**: projects are added automatically. Other entries are in the `commands` list in `main.js`.
- **Accent colour**: change `--grad`, `--accent` and `--accent-2` near the top of `style.css`.
