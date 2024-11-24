const express = require("express");
const app = express();
var expressWs = require("express-ws")(app);
const path = require("path");

const clients = new Set();

// Serve client
app.use(express.static(path.join(__dirname, "./client")));

app.ws("/socket", function (client, req) {
  clients.add(client);
  console.log(`New client: ${clients.size} clients connected`);

  client.on("message", function (msg) {
    console.log(`message: ${msg}`);

    // Send message to all connected clients
    for (const client of clients) {
      client.send(msg.toString());
    }
  });

  // handle errors
  client.on("error", (e) => {
    console.log(e);
  });

  client.on("close", function () {
    console.log("Client disconnected");
    clients.delete(client);
  });
});

app.listen(3000);
console.log("Server running at http://localhost:3000/");
