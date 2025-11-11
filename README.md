# CodeCanvas

CodeCanvas is a browser-based tool that turns your code into beautiful PNG images with syntax highlighting, customizable themes, and high-quality export up to 3x. It is crafted for clarity and style and built by [Teda.dev](https://teda.dev), the AI app builder for everyday problems.

## Features
- Paste or write code and see instant syntax highlighting
- Multiple programming languages with auto-detect
- Theme switcher powered by highlight.js
- Custom solid background color with quick swatches
- Optional window chrome, soft shadow, line numbers, and line wrapping
- Export crisp PNGs at 1x, 2x, or 3x scale
- Copy PNG directly to clipboard when supported
- Local storage remembers your settings and last code

## Getting Started
1. Open index.html for the landing page.
2. Click "Launch the editor" to go to app.html.
3. Paste or type your code, choose language and theme, adjust background and layout, then Export PNG.

## Tech Stack
- Tailwind CSS (via CDN) for rapid, responsive UI
- jQuery 3.7.x for DOM and interactions
- highlight.js for syntax highlighting + line numbers plugin
- html-to-image for high quality PNG export

## Accessibility
- Keyboard-navigable switches and controls
- WCAG-conscious color choices and contrast
- Respects prefers-reduced-motion

## Notes
- Export performance depends on the size of your code block and selected pixel ratio. If the page becomes slow at 3x for very large snippets, try 2x.

## Development
The app uses a modular structure:
- scripts/helpers.js: storage, utilities, and helpers
- scripts/ui.js: UI logic, state, rendering, and export handlers
- scripts/main.js: app bootstrapper and contract validation
- styles/main.css: custom CSS (no Tailwind directives here)

You can extend languages by including more highlight.js language scripts and adding them to the language dropdown in scripts/ui.js.
