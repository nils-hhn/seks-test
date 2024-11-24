class User {
  constructor(id, name, isSelf) {
    this.id = id;
    this.name = name;
    this.isSelf = isSelf;
    this.userList = document.getElementById("user-list");
  }

  setup() {
    this.userListItem = document.createElement("div");
    this.userListItem.classList.add("user");
    this.userListItem.textContent = this.name;

    if(this.isSelf) {
      this.userListItem.style.backgroundColor = "lightgreen";
    }

    this.userList.appendChild(this.userListItem);
  }

  update(newName) {
    this.name = newName;
    this.userListItem.textContent = this.name;
  }

  remove() {
    this.userList.removeChild(this.userListItem);
  }
}
