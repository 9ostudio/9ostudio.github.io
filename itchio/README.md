# 9ostudio itch.io theme

Matches the monochrome Japanese Web 1.0 look of [9o.studio](https://9o.studio).

## 1. Theme editor colors (no CSS required)

On your **profile** and each **project**, open **Edit theme** and set:

| Setting | Value |
|--------|--------|
| Background | `#000000` |
| Background 2 / panel | `#0a0a0a` |
| Text | `#cccccc` |
| Link | `#ffffff` |
| Button | `#333333` |
| Button text | `#ffffff` |
| Border | `#666666` |

Font (if available): system sans / Gothic-like, or leave default.

Layout tips:
- Profile: **My projects → Layout: Grid** (or List)
- Banner: optional; solid black also works

## 2. Custom CSS (best match)

Custom CSS must be enabled on your itch account:

1. [Contact itch.io support](https://itch.io/support)
2. Ask for **Custom CSS** access
3. Say you want a monochrome / high-contrast page theme that scopes rules to `#wrapper` and keeps the site footer/header usable

Then:

| Page type | File to paste |
|-----------|----------------|
| Profile (`9ostudio.itch.io`) | [`profile.css`](profile.css) |
| Each game page | [`project.css`](project.css) |

**Edit theme → Custom CSS** → paste → Save.

Character limit on profile CSS is tight (~5KB). `profile.css` is kept compact.

## 3. Optional profile blurb (HTML mode)

In the profile description editor, switch to `<>` HTML and you can use:

```html
<div class="custom-9o-box">
  <div class="custom-9o-nav">9ostudio · solo · ASM / C</div>
  <p>9oと申します。ASMとCプログラマー。ひとりでゲームを作っています。</p>
  <p><a href="https://9o.studio">→ 9o.studio</a></p>
</div>
```

Classes must start with `custom-` on itch.io.

## 4. Files

- `profile.css` — creator page
- `project.css` — game / project pages
- `theme-colors.txt` — quick copy for the theme editor

## Note

itch.io can change markup over time. If something breaks, re-check [CSS guide](https://itch.io/docs/creators/css-guide) and keep rules scoped to `#wrapper`.
