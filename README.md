# QA Practice App

A lightweight web app intentionally packed with behaviors that automation testers can target.

## What you can automate

- **Form validation** and success/failure states in the login form.
- **CRUD flows** in the task board (create, edit, mark complete, delete).
- **Async testing** in the fake API panel (loading state, random error path, success rendering).
- **Search/filter/sort/pagination** in the catalog.
- **Control coverage** in the controls lab with radios, checkboxes, multi-select, range, date, color, textarea, file input, and reset/save flows.
- **State persistence** via `localStorage` for theme, tasks, remembered email, and saved control settings.
- **Toast notifications** and accessibility-focused live regions.

All major interactive elements include stable `data-testid` attributes.

## Run locally

Because this app uses plain HTML/CSS/JS, you can run it with any static server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
