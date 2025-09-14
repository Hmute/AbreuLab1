/* Disclosure: portions of this assignment were prepared with help from ChatGPT. */
"use strict";

/** Utility: format a time like 11:12:51 AM */
const fmtTime = (d = new Date()) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Data access keys come from lang/messages/en/user.js (window.MESSAGES) */
const LS_NOTES = () => window.MESSAGES?.LS_NOTES ?? "lab1.notes";
const LS_SAVEDAT = () => window.MESSAGES?.LS_SAVED_AT ?? "lab1.savedAt";

/** A single Note: owns its textarea and (in writer) its remove button */
class Note {
    /**
     * @param {{id:string, text:string}} dto
     * @param {(id:string)=>void} onRemove
     * @param {(id:string, text:string)=>void} onInput
     * @param {boolean} readOnly
     */
    constructor(dto, onRemove, onInput, readOnly = false) {
        this.id = dto.id;
        this.text = dto.text;

        // container
        this.el = document.createElement("div");
        this.el.className = "note d-flex align-items-start gap-2";

        // textarea
        this.ta = document.createElement("textarea");
        this.ta.value = this.text;
        this.ta.placeholder = window.MESSAGES?.emptyNotePlaceholder ?? "Type your note...";
        this.ta.className = "form-control";
        this.ta.readOnly = !!readOnly;
        if (!readOnly) {
            // make absolutely sure it's editable in writer
            this.ta.removeAttribute("readonly");
            this.ta.disabled = false;
        }
        this.el.appendChild(this.ta);

        // remove button only for writer
        if (!readOnly) {
            this.removeBtn = document.createElement("button");
            this.removeBtn.type = "button";
            this.removeBtn.className = "btn btn-warning";
            this.removeBtn.textContent = window.MESSAGES?.remove ?? "remove";
            this.el.appendChild(this.removeBtn);

            // events
            this.removeBtn.addEventListener("click", () => onRemove(this.id));
            this.ta.addEventListener("input", () => onInput(this.id, this.ta.value));
        }
    }
}

/** NotesModel: loads/saves JSON to localStorage */
class NotesModel {
    constructor(storage) {
        this.storage = storage;
        this.notes = []; // array of {id,text}
    }
    load() {
        const raw = this.storage.getItem(LS_NOTES());
        try {
            const parsed = JSON.parse(raw || "[]");
            this.notes = Array.isArray(parsed) ? parsed : [];
        } catch {
            this.notes = [];
        }
        return this.notes;
    }
    save() {
        this.storage.setItem(LS_NOTES(), JSON.stringify(this.notes));
        const iso = new Date().toISOString();
        this.storage.setItem(LS_SAVEDAT(), iso);
        return iso;
    }
    add() {
        const n = { id: crypto.randomUUID(), text: "" };
        this.notes.push(n);
        return n;
    }
    update(id, text) {
        const n = this.notes.find(x => x.id === id);
        if (n) n.text = text;
    }
    remove(id) {
        this.notes = this.notes.filter(n => n.id !== id);
    }
}

/** Base page controller */
class Page {
    constructor({ readOnly }) {
        this.readOnly = readOnly;
        this.model = new NotesModel(window.localStorage);
        this.root = document.getElementById("notesArea");
    }
    clearUI() { this.root.innerHTML = ""; }
    renderAll(notes) {
        this.clearUI();
        notes.forEach(n => {
            const view = new Note(
                n,
                (id) => this.handleRemove?.(id),
                (id, text) => this.handleEdit?.(id, text),
                this.readOnly
            );
            this.root.appendChild(view.el);
        });
    }
}

/** Writer page: add/edit/remove + autosave */
class WriterPage extends Page {
    constructor() {
        super({ readOnly: false });
        this.addBtn = document.getElementById("addBtn");
        this.savedAtLabel = document.getElementById("savedAtLabel");
        this.autosaveTimer = null;
    }

    start() {
        // ensure not marked as readonly
        document.body.classList.remove("readonly");

        // pre-load existing notes
        const initial = this.model.load();
        this.renderAll(initial);

        // add new note
        this.addBtn.addEventListener("click", () => {
            this.model.add();
            this.renderAll(this.model.notes);
            // focus new textarea
            const lastTA = this.root.querySelector(".note textarea:last-of-type");
            if (lastTA) lastTA.focus();
            // save immediately so reader updates at once
            this.showSaved(this.model.save());
        });

        // autosave every 2s (per requirements)
        this.autosaveTimer = setInterval(() => {
            this.showSaved(this.model.save());
        }, 2000);

        // live updates if another tab writes
        window.addEventListener("storage", (e) => {
            if (e.key === LS_NOTES()) {
                this.model.load();
                this.renderAll(this.model.notes);
            }
            if (e.key === LS_SAVEDAT()) {
                this.showSaved(e.newValue);
            }
        });

        // show last saved time if exists
        const iso = localStorage.getItem(LS_SAVEDAT());
        if (iso) this.showSaved(iso);
    }

    showSaved(iso) {
        const t = iso ? new Date(iso) : new Date();
        const label = window.MESSAGES?.storedAt
            ? window.MESSAGES.storedAt(fmtTime(t))
            : `stored at: ${fmtTime(t)}`;
        this.savedAtLabel.textContent = label;
    }

    handleEdit(id, text) { this.model.update(id, text); }

    handleRemove(id) {
        this.model.remove(id);
        this.renderAll(this.model.notes);
        // save immediately after deletion
        this.showSaved(this.model.save());
    }
}

/** Reader page included for completeness (no change needed for Writer to work) */
class ReaderPage extends Page {
    constructor() {
        super({ readOnly: true });
        this.updatedAtLabel = document.getElementById("updatedAtLabel");
        this.poll = null;
        document.body.classList.add("readonly");
    }
    start() {
        this.renderAll(this.model.load());
        this.showUpdated(new Date());
        this.poll = setInterval(() => {
            this.renderAll(this.model.load());
            this.showUpdated(new Date());
        }, 2000);
        window.addEventListener("storage", (e) => {
            if (e.key === LS_NOTES() || e.key === LS_SAVEDAT()) {
                this.renderAll(this.model.load());
                this.showUpdated(new Date());
            }
        });
    }
    showUpdated(date) {
        const label = window.MESSAGES?.updatedAt
            ? window.MESSAGES.updatedAt(fmtTime(date))
            : `updated at: ${fmtTime(date)}`;
        this.updatedAtLabel.textContent = label;
    }
}

/** App entry */
window.LAB1 = {
    /**
     * @param {{page:'writer'|'reader'}} opts
     */
    init(opts) {
        if (!opts || !opts.page) return;
        if (opts.page === "writer") {
            document.title = window.MESSAGES?.writerTitle ?? "Writer";
            new WriterPage().start();
        } else {
            document.title = window.MESSAGES?.readerTitle ?? "Reader";
            new ReaderPage().start();
        }
    }
};
