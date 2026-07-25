import { io, type Socket } from "socket.io-client";

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

    this.socket = io(serverUrl, {
      transports: ["websocket"],
      auth: {
        token: token || localStorage.getItem("auth_token"),
      },
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from WebSocket server:", reason);

      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      this.handleReconnect();
    });

    this.socket.on("authenticated", (data) => {
      console.log("🔐 WebSocket authenticated:", data);
    });

    this.socket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
      );

      setTimeout(() => {
        this.socket?.connect();
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Campaign-related methods
  joinCampaign(campaignId: string) {
    this.socket?.emit("join-campaign", { campaignId });
  }

  leaveCampaign(campaignId: string) {
    this.socket?.emit("leave-campaign", { campaignId });
  }

  onCampaignUpdate(callback: (data: any) => void) {
    this.socket?.on("campaign-updated", callback);
  }

  onNewFunding(callback: (data: any) => void) {
    this.socket?.on("new-funding", callback);
  }

  onCampaignStatusChange(callback: (data: any) => void) {
    this.socket?.on("campaign-status-changed", callback);
  }

  // Platform stats
  getLiveStats() {
    this.socket?.emit("get-live-stats");
  }

  onLiveStats(callback: (data: any) => void) {
    this.socket?.on("live-stats", callback);
  }

  onPlatformStatsUpdate(callback: (data: any) => void) {
    this.socket?.on("platform-stats-updated", callback);
  }

  // Notifications
  onGlobalNotification(callback: (data: any) => void) {
    this.socket?.on("global-notification", callback);
  }

  // Blog real-time
  joinBlogFeed() {
    this.socket?.emit("join-blog-feed", {});
  }

  leaveBlogFeed() {
    this.socket?.emit("leave-blog-feed", {});
  }

  onBlogPostUpdate(callback: (data: any) => void) {
    this.socket?.on("blog-post-updated", callback);
  }

  onBlogFeedChanged(callback: (data: any) => void) {
    this.socket?.on("blog-feed-changed", callback);
  }

  onBlogEngagementUpdate(callback: (data: any) => void) {
    this.socket?.on("blog-engagement-updated", callback);
  }

  // Careers real-time
  joinCareersFeed() {
    this.socket?.emit("join-careers-feed", {});
  }

  leaveCareersFeed() {
    this.socket?.emit("leave-careers-feed", {});
  }

  onCareersUpdate(callback: (data: any) => void) {
    this.socket?.on("careers-updated", callback);
  }

  onCareersFeedChanged(callback: (data: any) => void) {
    this.socket?.on("careers-feed-changed", callback);
  }

  // Support real-time
  joinSupportFeed() {
    this.socket?.emit("join-support-feed", {});
  }

  leaveSupportFeed() {
    this.socket?.emit("leave-support-feed", {});
  }

  onSupportUpdate(callback: (data: any) => void) {
    this.socket?.on("support-updated", callback);
  }

  onSupportFeedChanged(callback: (data: any) => void) {
    this.socket?.on("support-feed-changed", callback);
  }

  // Contact real-time
  joinContactFeed() {
    this.socket?.emit("join-contact-feed", {});
  }

  leaveContactFeed() {
    this.socket?.emit("leave-contact-feed", {});
  }

  onContactUpdate(callback: (data: any) => void) {
    this.socket?.on("contact-updated", callback);
  }

  onContactFeedChanged(callback: (data: any) => void) {
    this.socket?.on("contact-feed-changed", callback);
  }

  // Authentication
  authenticate(token: string) {
    this.socket?.emit("authenticate", { token });
  }

  // Generic event listeners
  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
