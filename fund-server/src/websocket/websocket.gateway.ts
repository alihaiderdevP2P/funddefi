import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { Logger, UseGuards, Inject, forwardRef } from "@nestjs/common";
import { CampaignsService } from "../campaigns/campaigns.service";
import { FundingService } from "../funding/funding.service";
import { WsJwtGuard } from "./guards/ws-jwt.guard";
import type { JoinCampaignDto } from "./dto/websocket-events.dto";

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
  };
}

const websocketAllowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://funddefi-client.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: websocketAllowedOrigins,
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger("WebsocketGateway");
  private connectedClients: Map<string, AuthenticatedSocket> = new Map();

  constructor(
    @Inject(forwardRef(() => CampaignsService))
    private campaignsService: CampaignsService,
    @Inject(forwardRef(() => FundingService))
    private fundingService: FundingService
  ) { }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage("join-campaign")
  async handleJoinCampaign(
    @MessageBody() data: JoinCampaignDto,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { campaignId } = data;

    try {
      const campaign = await this.campaignsService.findOne(campaignId);
      client.join(`campaign-${campaignId}`);

      client.emit("joined-campaign", {
        campaignId,
        message: `Joined campaign: ${campaign.title}`,
      });

      this.logger.log(`Client ${client.id} joined campaign ${campaignId}`);
    } catch (error) {
      client.emit("error", { message: "Campaign not found" });
    }
  }

  @SubscribeMessage("leave-campaign")
  handleLeaveCampaign(
    @MessageBody() data: JoinCampaignDto,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { campaignId } = data;
    client.leave(`campaign-${campaignId}`);

    client.emit("left-campaign", {
      campaignId,
      message: `Left campaign room`,
    });

    this.logger.log(`Client ${client.id} left campaign ${campaignId}`);
  }

  @SubscribeMessage("join-blog-feed")
  handleJoinBlogFeed(@ConnectedSocket() client: AuthenticatedSocket) {
    client.join("blog-feed");
    client.emit("joined-blog-feed", {
      message: "Subscribed to blog updates",
    });
    this.logger.log(`Client ${client.id} joined blog-feed`);
  }

  @SubscribeMessage("leave-blog-feed")
  handleLeaveBlogFeed(@ConnectedSocket() client: AuthenticatedSocket) {
    client.leave("blog-feed");
    client.emit("left-blog-feed", { message: "Unsubscribed from blog updates" });
  }

  @SubscribeMessage("join-careers-feed")
  handleJoinCareersFeed(@ConnectedSocket() client: AuthenticatedSocket) {
    client.join("careers-feed");
    client.emit("joined-careers-feed", {
      message: "Subscribed to careers updates",
    });
    this.logger.log(`Client ${client.id} joined careers-feed`);
  }

  @SubscribeMessage("leave-careers-feed")
  handleLeaveCareersFeed(@ConnectedSocket() client: AuthenticatedSocket) {
    client.leave("careers-feed");
    client.emit("left-careers-feed", {
      message: "Unsubscribed from careers updates",
    });
  }

  @SubscribeMessage("join-support-feed")
  handleJoinSupportFeed(@ConnectedSocket() client: AuthenticatedSocket) {
    client.join("support-feed");
    client.emit("joined-support-feed", {
      message: "Subscribed to support updates",
    });
    this.logger.log(`Client ${client.id} joined support-feed`);
  }

  @SubscribeMessage("leave-support-feed")
  handleLeaveSupportFeed(@ConnectedSocket() client: AuthenticatedSocket) {
    client.leave("support-feed");
    client.emit("left-support-feed", {
      message: "Unsubscribed from support updates",
    });
  }

  @SubscribeMessage("get-live-stats")
  async handleGetLiveStats(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const platformStats = await this.fundingService.getPlatformStats();
      const featuredCampaigns =
        await this.campaignsService.getFeaturedCampaigns();

      client.emit("live-stats", {
        platformStats,
        featuredCampaigns: featuredCampaigns.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      client.emit("error", { message: "Failed to fetch live stats" });
    }
  }

  @SubscribeMessage("authenticate")
  @UseGuards(WsJwtGuard)
  handleAuthenticate(
    @MessageBody() _data: { token: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    // Authentication is handled by the guard
    client.emit("authenticated", {
      message: "Successfully authenticated",
      userId: client.user?.id,
    });

    this.logger.log(
      `Client ${client.id} authenticated as user ${client.user?.id}`
    );
  }

  // Server-side methods to broadcast events
  async broadcastCampaignUpdate(campaignId: string, updateData: any) {
    this.server.to(`campaign-${campaignId}`).emit("campaign-updated", {
      campaignId,
      ...updateData,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Broadcasted campaign update for ${campaignId}`);
  }

  async broadcastNewFunding(campaignId: string, fundingData: any) {
    // Get updated campaign data
    const campaign = await this.campaignsService.findOne(campaignId);

    this.server.to(`campaign-${campaignId}`).emit("new-funding", {
      campaignId,
      funding: fundingData,
      campaignStats: {
        raisedAmount: campaign.raisedAmount,
        backersCount: campaign.backersCount,
        // progressPercentage: (campaign.raisedAmount / campaign.goalAmount) * 100,
        progressPercentage:
          campaign.goalAmount > 0
            ? (campaign.raisedAmount / campaign.goalAmount) * 100
            : 0,
      },
      timestamp: new Date().toISOString(),
    });

    const platformStats = await this.fundingService.getPlatformStats();

    this.server.emit("platform-stats-updated", {
      type: "new-funding",
      campaignId,
      amount: fundingData.amount,
      platformStats,
      campaignStats: {
        raisedAmount: campaign.raisedAmount,
        backersCount: campaign.backersCount,
        progressPercentage:
          campaign.goalAmount > 0
            ? (campaign.raisedAmount / campaign.goalAmount) * 100
            : 0,
      },
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Broadcasted new funding for campaign ${campaignId}`);
  }

  async broadcastCampaignStatusChange(
    campaignId: string,
    newStatus: string,
    additionalData?: any
  ) {
    this.server.to(`campaign-${campaignId}`).emit("campaign-status-changed", {
      campaignId,
      newStatus,
      ...additionalData,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Broadcasted status change for campaign ${campaignId}: ${newStatus}`
    );
  }

  async broadcastToUser(userId: string, event: string, data: any) {
    // Find all sockets for this user
    const userSockets = Array.from(this.connectedClients.values()).filter(
      (socket) => socket.user?.id === userId
    );

    userSockets.forEach((socket) => {
      socket.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    this.logger.log(`Broadcasted ${event} to user ${userId}`);
  }

  broadcastBlogPostUpdate(data: {
    type: "published" | "unpublished" | "updated" | "archived" | "deleted";
    post: Record<string, unknown>;
  }) {
    this.server.to("blog-feed").emit("blog-post-updated", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.server.emit("blog-feed-changed", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted blog post update: ${data.type}`);
  }

  broadcastBlogEngagement(
    postId: string,
    stats: { slug: string; views: number; likes: number }
  ) {
    this.server.emit("blog-engagement-updated", {
      postId,
      ...stats,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastCareersUpdate(data: {
    type:
    | "published"
    | "unpublished"
    | "updated"
    | "closed"
    | "deleted"
    | "new_application"
    | "new_inquiry";
    job?: Record<string, unknown>;
    applicationId?: string;
    inquiryId?: string;
  }) {
    this.server.to("careers-feed").emit("careers-updated", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.server.emit("careers-feed-changed", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted careers update: ${data.type}`);
  }

  broadcastSupportUpdate(data: {
    type: "new_ticket" | "ticket_updated";
    ticketId: string;
    ticketNumber?: string;
    priority?: string;
  }) {
    this.server.to("support-feed").emit("support-updated", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.server.emit("support-feed-changed", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted support update: ${data.type}`);
  }

  @SubscribeMessage("join-contact-feed")
  handleJoinContactFeed(@ConnectedSocket() client: AuthenticatedSocket) {
    client.join("contact-feed");
    client.emit("joined-contact-feed", {
      message: "Subscribed to contact updates",
    });
    this.logger.log(`Client ${client.id} joined contact-feed`);
  }

  @SubscribeMessage("leave-contact-feed")
  handleLeaveContactFeed(@ConnectedSocket() client: AuthenticatedSocket) {
    client.leave("contact-feed");
    client.emit("left-contact-feed", {
      message: "Unsubscribed from contact updates",
    });
  }

  broadcastContactUpdate(data: {
    type: "new_message" | "message_updated" | "new_chat_message";
    messageId?: string;
    referenceNumber?: string;
    sessionId?: string;
  }) {
    this.server.to("contact-feed").emit("contact-updated", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.server.emit("contact-feed-changed", {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcasted contact update: ${data.type}`);
  }

  async broadcastGlobalNotification(notification: {
    type: "success" | "info" | "warning" | "error";
    title: string;
    message: string;
    data?: any;
  }) {
    this.server.emit("global-notification", {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Broadcasted global notification: ${notification.title}`);
  }

  // Method to get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Method to get clients in a specific room
  getClientsInRoom(room: string): number {
    const roomClients = this.server.sockets.adapter.rooms.get(room);
    return roomClients ? roomClients.size : 0;
  }
}
