# COMP 4537 – Lab 1: JSON, Object Constructor, LocalStorage

**Student:** Heraldo Abreu 

---

## Overview
This lab implements a **simple note-taking web app** using **HTML5 LocalStorage**.  
The app demonstrates:
- **Serialization** of objects to JSON
- **Object Constructors / ES6 Classes**
- **Autosaving & autoretrieving notes**
- **Cross-tab synchronization** via the `storage` event
- **Modular project structure** (HTML, JS, CSS, messages separated)
- **Hosted over HTTPS** (GitHub Pages)

---

## Pages

- **[`index.html`](https://hmute.github.io/AbreuLab1/index.html)**  
  Landing page with links to Writer and Reader.

- **[`writer.html`](https://hmute.github.io/AbreuLab1/writer.html)**  
  - Add, edit, and remove notes dynamically.  
  - Notes are autosaved every 2 seconds.  
  - Timestamp at top right shows last save time.  
  - Existing notes prepopulate on load.  

- **[`reader.html`](https://hmute.github.io/AbreuLab1/reader.html)**  
  - Retrieves notes every 2 seconds.  
  - Timestamp at top right shows last retrieval.  
  - Updates automatically when Writer tab modifies notes.  

---

## Project Structure

```
AbreuLab1/
│
├── index.html
├── writer.html
├── reader.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
└── lang/
    └── messages/
        └── en/
            └── user.js
```

- **`script.js`** – All logic (OOP design with `Note`, `NotesModel`, `WriterPage`, `ReaderPage`).  
- **`user.js`** – Stores all user-facing strings and constants.  
- **`style.css`** – Minimal custom styles; Bootstrap 5 provides most UI components.  

---

## Hosting

This project is hosted via **GitHub Pages** at:  

🔗 **Root URL:** [https://hmute.github.io/AbreuLab1/](https://hmute.github.io/AbreuLab1/)  

- Index: [https://hmute.github.io/AbreuLab1/index.html](https://hmute.github.io/AbreuLab1/index.html)  
- Writer: [https://hmute.github.io/AbreuLab1/writer.html](https://hmute.github.io/AbreuLab1/writer.html)  
- Reader: [https://hmute.github.io/AbreuLab1/reader.html](https://hmute.github.io/AbreuLab1/reader.html)  

---

## Part 2 – Questions

1. **Same browser, two tabs** – Yes.  
   Both tabs share the same `localStorage` for the same origin, so the reader sees writer updates in real time.  

2. **Different browsers (e.g., Chrome vs Firefox)** – No.  
   LocalStorage is per-browser and per-origin, so one browser cannot access another’s storage.  

---

## Rubric Compliance

- **OOP / Classes:** Used `class Note`, `class NotesModel`, `WriterPage`, and `ReaderPage`.  
- **Dynamic UI:** Notes and buttons created dynamically, no fixed/predefined textareas.  
- **JSON + LocalStorage:** Notes stored as JSON array of objects.  
- **Cross-tab sync:** Achieved via `storage` events.  
- **External files only:** No inline JS; HTML, CSS, and JS are separated.  
- **Bootstrap 5:** Used for styling and layout.  
- **HTTPS Hosting:** Works with GitHub Pages without warnings.  
- **No `var`:** All variables declared with `const` or `let`.  
- **No hardcoded strings:** All user messages in `user.js`.  
- **Disclosure:** This lab was partially prepared with help from ChatGPT (permitted).  

---

## Running Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/Hmute/AbreuLab1.git
   cd AbreuLab1
   ```

2. Open `index.html` in your browser (or run a local static server for cleaner testing).

3. Test:
   - Add/remove/edit notes in **Writer**.  
   - Open **Reader** in another tab — it updates live.  

---

## License

This project is for academic purposes (COMP 4537 Lab 1).  
