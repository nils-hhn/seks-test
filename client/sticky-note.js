class StickyNote {
  constructor(stickyNoteView, id) {
    this.stickyNoteView = stickyNoteView;
    this.isDragging = false;
    this.id = id;

    this.stickyNoteView.style.color = this.getContrastYIQ(
      this.stickyNoteView.style.backgroundColor
    );

    this.handleKeyPress = (e) => this.keyPressed(e);
    this.handleDoubleClick = () => this.doubleClicked();
    this.handleContextMenu = (e) => e.preventDefault();
    this.handleMouseDown = (e) => this.mouseDown(e);

    this.addStickyNote();
  }

  addStickyNote() {
    this.stickyNoteView.addEventListener("keypress", this.handleKeyPress);
    this.stickyNoteView.addEventListener("dblclick", this.handleDoubleClick);
    this.stickyNoteView.addEventListener("contextmenu", this.handleContextMenu);
    this.stickyNoteView.addEventListener("mousedown", this.handleMouseDown);
    this.stickyNoteView.addEventListener("keydown", this.handleKeyPress); // Add keydown listener

    this.stickyNoteView.classList.add("hidden");
    document.getElementById("canvas").appendChild(this.stickyNoteView);
    // Force a reflow to apply the initial styles
    this.stickyNoteView.offsetHeight; // Trigger reflow
    this.stickyNoteView.classList.remove("hidden");
    this.stickyNoteView.focus();
  }

  keyPressed(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      // Prevent text from bein changed
      this.stickyNoteView.contentEditable = "false";
      this.stickyNoteView.style.userSelect = "none";
      this.updateStickyNote();
    } else if (e.key === "Escape") {
      // Send delete sticky note message
      this.sendDeleteMessage(this.id);
    }
  }

  doubleClicked() {
    this.stickyNoteView.contentEditable = "true";
    this.stickyNoteView.style.userSelect = "text";
  }

  mouseDown(e) {
    const RESIZE_HANDLE = 10; // pixels from edge
    const view = e.target;
    const rect = view.getBoundingClientRect();

    // Check if click is in resize area
    const isRightEdge = e.clientX > rect.right - RESIZE_HANDLE;
    const isBottomEdge = e.clientY > rect.bottom - RESIZE_HANDLE;

    if (isRightEdge || isBottomEdge) {
      // Handle resize
      // Store initial dimensions
      let initialWidth = this.stickyNoteView.offsetWidth;
      let initialHeight = this.stickyNoteView.offsetHeight;

      // Add one time mouseup listener
      document.addEventListener(
        "mouseup",
        () => {
          // Check if dimensions changed
          if (
            this.stickyNoteView.offsetWidth !== initialWidth ||
            this.stickyNoteView.offsetHeight !== initialHeight
          ) {
            this.updateStickyNote();
          }
        },
        { once: true }
      );
      return;
    }

    if (e.button === 0) {
      // Right mouse click
      this.isDragging = true;
      const offsetX = e.clientX - view.offsetLeft;
      const offsetY = e.clientY - view.offsetTop;

      const onMouseMove = (e) => {
        if (this.isDragging) {
          let newX = e.clientX - offsetX;
          let newY = e.clientY - offsetY;

          // Begrenzungen innerhalb des Canvas

          if (newX < 0) newX = 0;
          if (newY < 0) newY = 0;

          view.style.left = `${newX}px`;
          view.style.top = `${newY}px`;
        }
      };

      const onMouseUp = (e) => {
        this.isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        // Send notification that sticky note has been moved
        this.updateStickyNote();
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  }

  remove() {
    this.stickyNoteView.removeEventListener("keypress", this.handleKeyPress);
    this.stickyNoteView.removeEventListener("dblclick", this.handleDoubleClick);
    this.stickyNoteView.removeEventListener(
      "contextmenu",
      this.handleContextMenu
    );
    this.stickyNoteView.removeEventListener("mousedown", this.handleMouseDown);

    // Hidden animation
    this.stickyNoteView.classList.add("hidden");
    setTimeout(() => {
      document.getElementById("canvas").removeChild(this.stickyNoteView);
    }, 500 /*Match css transition time*/);
  }

  updateStickyNote() {
    const left = parseInt(this.stickyNoteView.style.left, 10);
    const top = parseInt(this.stickyNoteView.style.top, 10);
    let height = parseInt(this.stickyNoteView.style.height, 10);
    let width = parseInt(this.stickyNoteView.style.width, 10);

    if(height < 100) {
      height = 100;
    }

    if(width < 100) {
      width = 100;
    }

    StickyNote.sendUpdateMessage(
      this.id,
      this.stickyNoteView.textContent,
      left,
      top,
      height,
      width,
      this.stickyNoteView.style.backgroundColor
    );
  }

  sendDeleteMessage(id) {
    let message = {
      type: StickyNoteService.STICKY_NOTE_DELETED_MESSAGE_TYPE,
      content: {
        id: id,
      },
    };
    WebSocketService.getInstance().sendMessage(message);
  }

  static sendUpdateMessage(id, text, x, y, height, width, color) {
    let message = {
      type: StickyNoteService.STICKY_NOTE_MESSAGE_TYPE,
      content: {
        id: id,
        text: text,
        x: x,
        y: y,
        height: height,
        width: width,
        color: color,
      },
    };
    WebSocketService.getInstance().sendMessage(message);
  }
}
