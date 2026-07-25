const io = require("socket.io-client")

// Test WebSocket connection
const socket = io("http://localhost:3001", {
  transports: ["websocket"],
})

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server")

  // Test joining a campaign
  socket.emit("join-campaign", { campaignId: "660e8400-e29b-41d4-a716-446655440001" })

  // Test getting live stats
  socket.emit("get-live-stats")
})

socket.on("joined-campaign", (data) => {
  console.log("📢 Joined campaign:", data)
})

socket.on("live-stats", (data) => {
  console.log("📊 Live stats:", data)
})

socket.on("new-funding", (data) => {
  console.log("💰 New funding received:", data)
})

socket.on("campaign-updated", (data) => {
  console.log("🔄 Campaign updated:", data)
})

socket.on("campaign-status-changed", (data) => {
  console.log("📋 Campaign status changed:", data)
})

socket.on("platform-stats-updated", (data) => {
  console.log("📈 Platform stats updated:", data)
})

socket.on("global-notification", (data) => {
  console.log("🔔 Global notification:", data)
})

socket.on("error", (error) => {
  console.error("❌ WebSocket error:", error)
})

socket.on("disconnect", () => {
  console.log("❌ Disconnected from WebSocket server")
})

// Keep the script running
process.stdin.resume()
