class UserService {
  users = new Set();
  static USER_MESSAGE_TYPE = "user";
  static USER_DELETED_MESSAGE_TYPE = "user-deleted";

  constructor() {
    this.storageKey = "userId";
    WebSocketService.getInstance().subscribe(
      UserService.USER_MESSAGE_TYPE,
      this.userMessageReceived.bind(this)
    );
    WebSocketService.getInstance().subscribe(
      UserService.USER_DELETED_MESSAGE_TYPE,
      this.userDeleteMessageReceived.bind(this)
    );
    WebSocketService.getInstance().subscribe(
        WebSocketService.WEBSOCKET_CONNECTED,
        this.sendUserChangedMessage.bind(this)
      );
  }

  userMessageReceived(receivedUser) {
    var existingUser;
    for (let user of this.users) {
      if (user.id === receivedUser.id) {
        existingUser = user;
      }
    }

    if (existingUser !== undefined) {
      // Update user
      existingUser.update(receivedUser.name);
    } else {
      // Add user
      const isSelf = receivedUser.id === this.ensureUserId();
      let user = new User(receivedUser.id, receivedUser.name, isSelf);
      user.setup();
      this.users.add(user);
    }
  }

  userDeleteMessageReceived(userToDelete) {
    for (let user of this.users) {
      if (user.id === userToDelete.id) {
        user.remove();
        this.users.delete(user);
        break;
      }
    }
  }

  getUserId() {
    return localStorage.getItem(this.storageKey);
  }

  setUserId(userId) {
    localStorage.setItem(this.storageKey, userId);
  }

  ensureUserId() {
    let userId = this.getUserId();
    if (!userId) {
      // Generate new user ID
      userId = crypto.randomUUID();
      this.setUserId(userId);
    }
    return userId;
  }

  sendUserChangedMessage(name) {
    const userId = this.ensureUserId();
    let message = {
      type: UserService.USER_MESSAGE_TYPE,
      content: {
        id: userId,
        name: name,
      },
    };
    WebSocketService.getInstance().sendMessage(message);
  }

  sendUserDeletedMessage() {
    const userId = this.ensureUserId();
    let message = {
      type: UserService.USER_DELETED_MESSAGE_TYPE,
      content: {
        id: userId,
      },
    };
    WebSocketService.getInstance().sendMessage(message);
  }
}
