import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Funding, FundingStatus } from "./entities/funding.entity";
import { CampaignsService } from "../campaigns/campaigns.service";
import { CreateFundingDto } from "./dto/create-funding.dto";
import { UpdateFundingDto } from "./dto/update-funding.dto";
import { WebsocketGateway } from "../websocket/websocket.gateway";

@Injectable()
export class FundingService {
  constructor(
    @InjectRepository(Funding)
    private fundingRepository: Repository<Funding>,
    @Inject(forwardRef(() => CampaignsService))
    private campaignsService: CampaignsService,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway
  ) {}

  async create(
    createFundingDto: CreateFundingDto,
    userId: string
  ): Promise<Funding> {
    // Verify campaign exists and is active
    const campaign = await this.campaignsService.findOne(
      createFundingDto.campaignId
    );

    if (campaign.status !== "active") {
      throw new BadRequestException("Campaign is not active");
    }

    if (new Date() > new Date(campaign.endDate)) {
      throw new BadRequestException("Campaign has ended");
    }

    const funding = this.fundingRepository.create({
      ...createFundingDto,
      userId,
      status: FundingStatus.PENDING,
    });

    const savedFunding = await this.fundingRepository.save(funding);

    // Update campaign stats when funding is confirmed
    if (createFundingDto.status === FundingStatus.CONFIRMED) {
      await this.campaignsService.updateCampaignStats(
        createFundingDto.campaignId,
        createFundingDto.amount
      );

      await this.websocketGateway.broadcastNewFunding(
        createFundingDto.campaignId,
        {
          id: savedFunding.id,
          amount: savedFunding.amount,
          message: savedFunding.message,
          backerInfo: savedFunding.backerInfo,
        }
      );
    }

    return this.findOne(savedFunding.id);
  }

  async findAll(userId?: string): Promise<Funding[]> {
    const where = userId ? { userId } : {};
    return this.fundingRepository.find({
      where,
      relations: ["user", "campaign", "reward"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Funding> {
    const funding = await this.fundingRepository.findOne({
      where: { id },
      relations: ["user", "campaign", "reward"],
    });

    if (!funding) {
      throw new NotFoundException(`Funding with ID ${id} not found`);
    }

    return funding;
  }

  async update(
    id: string,
    updateFundingDto: UpdateFundingDto
  ): Promise<Funding> {
    const funding = await this.findOne(id);

    // If status is being updated to confirmed, update campaign stats
    if (
      updateFundingDto.status === FundingStatus.CONFIRMED &&
      funding.status !== FundingStatus.CONFIRMED
    ) {
      await this.campaignsService.updateCampaignStats(
        funding.campaignId,
        funding.amount
      );

      await this.websocketGateway.broadcastNewFunding(funding.campaignId, {
        id: funding.id,
        amount: funding.amount,
        message: funding.message,
        backerInfo: funding.backerInfo,
      });
    }

    await this.fundingRepository.update(id, updateFundingDto);
    return this.findOne(id);
  }

  async getFundingsByCampaign(campaignId: string): Promise<Funding[]> {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(campaignId)) {
      throw new BadRequestException(
        `Invalid campaign ID format. Expected UUID, got: ${campaignId}. Campaign IDs must be in UUID format.`
      );
    }

    return this.fundingRepository.find({
      where: { campaignId },
      relations: ["user", "reward"],
      order: { createdAt: "DESC" },
    });
  }

  async getFundingsByUser(userId: string): Promise<Funding[]> {
    return this.fundingRepository.find({
      where: { userId },
      relations: ["campaign", "reward"],
      order: { createdAt: "DESC" },
    });
  }

  async getTotalFundingStats(): Promise<{
    totalAmount: number;
    totalFundings: number;
    totalBackers: number;
  }> {
    const result = await this.fundingRepository
      .createQueryBuilder("funding")
      .select([
        "SUM(funding.amount) as totalAmount",
        "COUNT(funding.id) as totalFundings",
        "COUNT(DISTINCT funding.userId) as totalBackers",
      ])
      .where("funding.status = :status", { status: FundingStatus.CONFIRMED })
      .getRawOne();

    return {
      totalAmount: Number.parseFloat(result.totalAmount) || 0,
      totalFundings: Number.parseInt(result.totalFundings) || 0,
      totalBackers: Number.parseInt(result.totalBackers) || 0,
    };
  }

  async getPlatformStats(): Promise<{
    totalAmount: number;
    totalFundings: number;
    totalBackers: number;
    activeCampaigns: number;
    totalCampaigns: number;
    fundedCampaigns: number;
  }> {
    const [fundingStats, campaignCounts] = await Promise.all([
      this.getTotalFundingStats(),
      this.campaignsService.getCampaignCounts(),
    ]);

    return {
      ...fundingStats,
      ...campaignCounts,
    };
  }

  async getUserDashboard(userId: string) {
    const [myFundings, myCampaigns, recentUpdates] = await Promise.all([
      this.getFundingsByUser(userId),
      this.campaignsService.getCampaignsByCreator(userId),
      this.campaignsService.getUpdatesByCreator(userId, 10),
    ]);

    const confirmedFundings = myFundings.filter(
      (f) => f.status === FundingStatus.CONFIRMED
    );
    const campaignIds = myCampaigns.map((c) => c.id);

    let receivedFundings: Funding[] = [];
    if (campaignIds.length > 0) {
      receivedFundings = await this.fundingRepository.find({
        where: {
          campaignId: In(campaignIds),
          status: FundingStatus.CONFIRMED,
        },
        relations: ["user", "campaign"],
        order: { createdAt: "ASC" },
      });
    }

    const totalBacked = confirmedFundings.reduce(
      (sum, f) => sum + Number(f.amount),
      0
    );
    const backedCampaignIds = [
      ...new Set(confirmedFundings.map((f) => f.campaignId)),
    ];
    const backedCampaignMap = new Map<string, (typeof myFundings)[0]["campaign"]>();
    for (const f of confirmedFundings) {
      if (f.campaign) backedCampaignMap.set(f.campaignId, f.campaign);
    }
    const uniqueBackedCampaigns = [...backedCampaignMap.values()];
    const successfulBacked = uniqueBackedCampaigns.filter(
      (c) => c.status === "funded"
    ).length;
    const backedSuccessRate =
      uniqueBackedCampaigns.length > 0
        ? Math.round(
            (successfulBacked / uniqueBackedCampaigns.length) * 1000
          ) / 10
        : 0;

    const activeCreated = myCampaigns.filter((c) => c.status === "active");
    const totalRaised = myCampaigns.reduce(
      (sum, c) => sum + Number(c.raisedAmount),
      0
    );
    const totalGoal = myCampaigns.reduce(
      (sum, c) => sum + Number(c.goalAmount),
      0
    );
    const totalBackersOnCreated = myCampaigns.reduce(
      (sum, c) => sum + (c.backersCount || 0),
      0
    );

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthBacked = confirmedFundings
      .filter((f) => new Date(f.createdAt) >= thisMonthStart)
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const lastMonthBacked = confirmedFundings
      .filter((f) => {
        const d = new Date(f.createdAt);
        return d >= lastMonthStart && d <= lastMonthEnd;
      })
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const backedGrowth =
      lastMonthBacked > 0
        ? Math.round(
            ((thisMonthBacked - lastMonthBacked) / lastMonthBacked) * 1000
          ) / 10
        : thisMonthBacked > 0
          ? 100
          : 0;

    const monthMap = new Map<
      string,
      { amount: number; backers: Set<string>; fundings: number }
    >();
    for (const f of receivedFundings) {
      const d = new Date(f.createdAt);
      const key = d.toLocaleString("en", { month: "short" });
      const entry = monthMap.get(key) || {
        amount: 0,
        backers: new Set<string>(),
        fundings: 0,
      };
      entry.amount += Number(f.amount);
      entry.backers.add(f.userId);
      entry.fundings += 1;
      monthMap.set(key, entry);
    }

    const fundingTrends = Array.from(monthMap.entries()).map(
      ([date, data]) => ({
        date,
        amount: Math.round(data.amount * 10000) / 10000,
        backers: data.backers.size,
        fundings: data.fundings,
      })
    );

    const categoryMap = new Map<string, number>();
    for (const c of myCampaigns) {
      const raised = Number(c.raisedAmount);
      categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + raised);
    }
    const categoryColors: Record<string, string> = {
      technology: "#10b981",
      health: "#3b82f6",
      environment: "#8b5cf6",
      creative: "#f59e0b",
      business: "#ef4444",
      community: "#06b6d4",
      education: "#a855f7",
    };
    const categoryDistribution = Array.from(categoryMap.entries()).map(
      ([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value * 10000) / 10000,
        color: categoryColors[name] || "#6b7280",
      })
    );

    const campaignPerformance = myCampaigns.map((c) => ({
      id: c.id,
      name: c.title,
      raised: Number(c.raisedAmount),
      goal: Number(c.goalAmount),
      backers: c.backersCount || 0,
      status: c.status,
    }));

    const thisMonthFundings = receivedFundings.filter(
      (f) => new Date(f.createdAt) >= thisMonthStart
    );
    const lastMonthFundings = receivedFundings.filter((f) => {
      const d = new Date(f.createdAt);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });

    const fundingGrowth =
      lastMonthFundings.reduce((s, f) => s + Number(f.amount), 0) > 0
        ? Math.round(
            ((thisMonthFundings.reduce((s, f) => s + Number(f.amount), 0) -
              lastMonthFundings.reduce((s, f) => s + Number(f.amount), 0)) /
              lastMonthFundings.reduce((s, f) => s + Number(f.amount), 0)) *
              1000
          ) / 10
        : thisMonthFundings.length > 0
          ? 100
          : 0;

    const newBackersThisMonth = new Set(
      thisMonthFundings.map((f) => f.userId)
    ).size;

    const avgPledge =
      receivedFundings.length > 0
        ? receivedFundings.reduce((s, f) => s + Number(f.amount), 0) /
          receivedFundings.length
        : 0;

    const lastMonthAvg =
      lastMonthFundings.length > 0
        ? lastMonthFundings.reduce((s, f) => s + Number(f.amount), 0) /
          lastMonthFundings.length
        : 0;
    const avgPledgeGrowth =
      lastMonthAvg > 0
        ? Math.round(((avgPledge - lastMonthAvg) / lastMonthAvg) * 1000) / 10
        : avgPledge > 0
          ? 100
          : 0;

    const estimatedViews = myCampaigns.reduce(
      (sum, c) => sum + (c.backersCount || 0) * 12 + 100,
      0
    );
    const conversionRate =
      estimatedViews > 0
        ? Math.round((totalBackersOnCreated / estimatedViews) * 1000) / 10
        : 0;

    const pledgeBuckets = [
      { range: "< 0.05 ETH", min: 0, max: 0.05 },
      { range: "0.05 - 0.1", min: 0.05, max: 0.1 },
      { range: "0.1 - 0.5", min: 0.1, max: 0.5 },
      { range: "0.5 - 1", min: 0.5, max: 1 },
      { range: "1+ ETH", min: 1, max: Infinity },
    ];
    const pledgeDistribution = pledgeBuckets.map((bucket) => ({
      range: bucket.range,
      count: receivedFundings.filter((f) => {
        const amt = Number(f.amount);
        return amt >= bucket.min && amt < bucket.max;
      }).length,
    }));

    const recentActivity: Array<{
      type: string;
      campaign: string;
      campaignId: string;
      amount: number | null;
      timestamp: string;
    }> = [];

    for (const f of receivedFundings.slice(-20).reverse()) {
      recentActivity.push({
        type: "new_backer",
        campaign: f.campaign?.title || "Campaign",
        campaignId: f.campaignId,
        amount: Number(f.amount),
        timestamp: f.createdAt.toISOString(),
      });
    }
    for (const u of recentUpdates) {
      const campaign = myCampaigns.find((c) => c.id === u.campaignId);
      recentActivity.push({
        type: "campaign_update",
        campaign: campaign?.title || "Campaign",
        campaignId: u.campaignId,
        amount: null,
        timestamp: u.createdAt.toISOString(),
      });
    }
    recentActivity.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const nearestEnding = activeCreated
      .filter((c) => new Date(c.endDate) > now)
      .sort(
        (a, b) =>
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      )[0];

    const daysLeft = nearestEnding
      ? Math.max(
          0,
          Math.ceil(
            (new Date(nearestEnding.endDate).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

    const goalProgress =
      totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 1000) / 10 : 0;

    return {
      summary: {
        totalBacked: Math.round(totalBacked * 10000) / 10000,
        backedCampaignCount: backedCampaignIds.length,
        backedGrowth,
        campaignsCreated: myCampaigns.length,
        activeCampaigns: activeCreated.length,
        totalBackersOnCreated,
        totalRaised: Math.round(totalRaised * 10000) / 10000,
        goalProgress,
        daysLeft,
        backedSuccessRate,
        successfulBacked,
        totalBackedCampaigns: uniqueBackedCampaigns.length,
      },
      metrics: {
        fundingGrowth,
        newBackersThisMonth,
        avgPledge: Math.round(avgPledge * 10000) / 10000,
        avgPledgeGrowth,
        conversionRate,
        estimatedViews,
      },
      fundingTrends,
      campaignPerformance,
      categoryDistribution,
      pledgeDistribution,
      recentActivity: recentActivity.slice(0, 10),
    };
  }
}
