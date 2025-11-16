const { Server } = require("socket.io");

module.exports = function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
      credentials: true
    }
  });

  // Fake moving GPS path (replace with real GPS or DB data)
  let route = [
    [17.385, 78.486],
    [17.386, 78.487],
    [17.387, 78.488],
    [17.389, 78.491],
    [17.392, 78.493]
  ];

  let index = 0;

  setInterval(() => {
    io.emit("locationUpdate", route[index]);
    index = (index + 1) % route.length;
  }, 1000); // every 1 second

  console.log("🚗 Live tracking socket initialized - sending location updates every second");

  return io;
};