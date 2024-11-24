class StickyNoteService {
  static STICKY_NOTE_MESSAGE_TYPE = "sticky-note-update";
  static STICKY_NOTE_DELETED_MESSAGE_TYPE = "sticky-note-deleted";
  USER_MESSAGE_TYPE = "user";
  USER_DELETED_MESSAGE_TYPE = "user-deleted";
  stickyNotes = new Set();
  users = new Set();
  addingStickyNote = false;

  constructor() {
    WebSocketService.getInstance().subscribe(StickyNoteService.STICKY_NOTE_MESSAGE_TYPE, this.createOrUpdateStickyNote.bind(this));
    WebSocketService.getInstance().subscribe(StickyNoteService.STICKY_NOTE_DELETED_MESSAGE_TYPE, this.removeStickyNote.bind(this));
    this.configure();
  }

  createOrUpdateStickyNote(stickyNote) {
    var existingNote;
    for (let note of this.stickyNotes) {
      if (note.id === stickyNote.id) {
        existingNote = note;
      }
    }

    if (existingNote !== undefined) {
      // Update existing note
      const stickyNoteView = document.getElementById(stickyNote.id);
      this.updateStickyNoteViewFromObject(stickyNote, stickyNoteView);
    } else {
      // Create new note
      this.createStickyNote(stickyNote);
    }
  }

  createStickyNote(stickyNote) {
    let note = document.createElement("div");
    note = this.updateStickyNoteViewFromObject(stickyNote, note);
    note.classList.add("sticky-note");

    stickyNote = new StickyNote(note, stickyNote.id);
    this.stickyNotes.add(stickyNote);
  }

  updateStickyNoteViewFromObject(stickyNoteObject, viewObject) {
    // Add transition class before updates
    viewObject.classList.add("sticky-note-transition");
    viewObject.contentEditable = "true";
    viewObject.style.left = `${stickyNoteObject.x}px`;
    viewObject.style.top = `${stickyNoteObject.y}px`;
    viewObject.textContent = stickyNoteObject.text;
    viewObject.style.backgroundColor = stickyNoteObject.color;
    viewObject.style.height = `${stickyNoteObject.height}px`;
    viewObject.style.width = `${stickyNoteObject.width}px`;
    viewObject.id = stickyNoteObject.id;
    // Remove transition class after animation completed
    setTimeout(() => {
      viewObject.classList.remove("sticky-note-transition");
    }, 300); // Match transition duration in CSS

    return viewObject;
  }

  removeStickyNote(stickyNote) {
    for (let note of this.stickyNotes) {
      if (note.id === stickyNote.id) {
        note.remove();
        this.stickyNotes.delete(note);
        break;
      }
    }
  }

  configure() {
    document.getElementById("add-note-btn").addEventListener("click", () => {
      if(this.addingStickyNote) {
        return;
      }

      this.addingStickyNote = true;
      const canvas = document.getElementById("canvas");
      canvas.classList.add("adding-note");
      canvas.addEventListener(
        "click",
        (e) => {
          canvas.classList.remove("adding-note");
          this.addStickyNote(e);
          this.addingStickyNote = false;
        },
        { once: true }
      );
    });
  }

  addStickyNote(event) {
    // Canvas offset is needed to calculate the correct position of the sticky note
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
  
    let stickyNoteOptions = {
      id: crypto.randomUUID(),
      text: "",
      x: x,
      y: y,
      height: 150,
      width: 150,
      color: this.getRandomColor(),
    };

    StickyNote.sendUpdateMessage(
      stickyNoteOptions.id,
      stickyNoteOptions.text,
      stickyNoteOptions.x,
      stickyNoteOptions.y,
      stickyNoteOptions.height,
      stickyNoteOptions.width,
      stickyNoteOptions.color
    );
  }
  
  // Funktion zur Generierung einer zufälligen Farbe
  getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
