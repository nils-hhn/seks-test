const canvas = document.getElementById("canvas");

var instance = WebSocketService.getInstance();
const stickyNoteService = new StickyNoteService();
const userService = new UserService();
instance.connect();

// const stickyNoteService = new StickyNoteService();

window.addEventListener('beforeunload', (event) => {
  // Send user delete message when the window is closed
  userService.sendUserDeletedMessage();
});
