"use strict";
exports.__esModule = true;
var path = require("path");
var express = require("express");
var app = express();
app.set("port", process.env.PORT || 3000);
var http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
var io = require("socket.io")(http);
app.get("/", function (req, res) {
    res.send("herro from chink town");
    res.sendFile(path.resolve("./client/index.html"));
});
// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on("connection", function (socket) {
    console.log("a user connected");
});
var server = http.listen(3000, function () {
    console.log("listening on *:3000");
});
