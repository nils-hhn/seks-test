class WebSocketService {
  static WEBSOCKET_CONNECTED = "websocket-connected";

  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    } else {
      WebSocketService.instance = this;
    }
    this.subscribers = {};
    this.setup();
    this.configure();
  }

  setup() {
    this.canvas = document.getElementById("canvas");
    this.status = document.getElementById("connection-status");
    this.addStickyNoteButton = document.getElementById("add-note-btn");
  }

  configure() {
    const search = document.location.search;
    const params = new URLSearchParams(search);

    // setup user name
    if (params.has("name")) {
      this.name = params.get("name");
    } else {
      params.set("name", "Alice");
      document.location.search = "?" + params.toString();
    }

    // setup host
    if (params.has("host")) {
      this.host = params.get("host");
      this.server = `ws://${this.host}/socket`;
    } else {
      params.set("host", window.location.host);
      document.location.search = "?" + params.toString();
    }

    this.server = `${window.location.protocol}//${this.host}/socket`;
  }

  connect() {
    this.socket = new WebSocket(this.server);

    // Handle error
    this.socket.addEventListener("error", (event) => {
      console.log(event);
      this.status.textContent = "Connection error";
      this.status.classList.add("not-connected");
    });

    // Handle connected
    this.socket.addEventListener("open", (event) => {
      console.log(event);
      this.status.textContent = "Connected";
      this.status.classList.add("connected");

      // Enable the "Add Sticky Note" button
      this.addStickyNoteButton.disabled = false;

      // Send user message
      this.notifySubscribers(WebSocketService.WEBSOCKET_CONNECTED, this.name);
    });

    // Handle incoming messages
    this.socket.addEventListener("message", (event) => {
      this.receiveMessage(event.data);
    });
  }

  sendMessage(message) {
    let encoded = JSON.stringify(message);
    this.socket.send(encoded);
  }

  receiveMessage(data) {
    // Notify all subscribers
    const message = JSON.parse(data);
    const topic = message.type;

    this.notifySubscribers(topic, message.content);
  }

  notifySubscribers(topic, content) {
    // Notify all subscribers for the specific topic
    if (this.subscribers[topic]) {
      this.subscribers[topic].forEach((callback) => callback(content));
    }
  }

  subscribe(topic, callback) {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = [];
    }
    this.subscribers[topic].push(callback);
  }

  unsubscribe(topic, callback) {
    if (this.subscribers[topic]) {
      this.subscribers[topic] = this.subscribers[topic].filter(
        (sub) => sub !== callback
      );
    }
  }

  static getInstance() {
    if (!WebSocketService.instance) {
      new WebSocketService();
    }
    return WebSocketService.instance;
  }
}
