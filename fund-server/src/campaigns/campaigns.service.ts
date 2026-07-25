import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Campaign,
  CampaignStatus,
  type CampaignCategory,
} from "./entities/campaign.entity";
import { Reward } from "./entities/reward.entity";
import { CampaignUpdate } from "./entities/campaign-update.entity";
import { SavedCampaign } from "./entities/saved-campaign.entity";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { CreateRewardDto } from "./dto/create-reward.dto";
import { CreateCampaignUpdateDto } from "./dto/create-campaign-update.dto";
import { WebsocketGateway } from "../websocket/websocket.gateway";
import { I18nService } from "../i18n/i18n.service";

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(Reward)
    private rewardsRepository: Repository<Reward>,
    @InjectRepository(CampaignUpdate)
    private updatesRepository: Repository<CampaignUpdate>,
    @InjectRepository(SavedCampaign)
    private savedRepository: Repository<SavedCampaign>,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway,
    private i18nService: I18nService
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    creatorId: string
  ): Promise<Campaign> {
    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      creatorId,
      status: CampaignStatus.DRAFT,
    });

    const savedCampaign = await this.campaignsRepository.save(campaign);

    // Create rewards if provided
    if (createCampaignDto.rewards && createCampaignDto.rewards.length > 0) {
      const rewards = createCampaignDto.rewards.map((reward) =>
        this.rewardsRepository.create({
          ...reward,
          campaignId: savedCampaign.id,
        })
      );
      await this.rewardsRepository.save(rewards);
    }

    return this.findOne(savedCampaign.id);
  }

  async findAll(options?: {
    status?: CampaignStatus;
    category?: CampaignCategory;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ campaigns: Campaign[]; total: number }> {
    const { status, category, search, page = 1, limit = 10 } = options || {};

    const queryBuilder = this.campaignsRepository
      .createQueryBuilder("campaign")
      .leftJoinAndSelect("campaign.creator", "creator")
      .leftJoinAndSelect("campaign.rewards", "rewards")
      .leftJoinAndSelect("campaign.fundings", "fundings");

    if (status) {
      queryBuilder.andWhere("campaign.status = :status", { status });
    }

    if (category) {
      queryBuilder.andWhere("campaign.category = :category", { category });
    }

    if (search) {
      queryBuilder.andWhere(
        "(campaign.title ILIKE :search OR campaign.description ILIKE :search)",
        {
          search: `%${search}%`,
        }
      );
    }

    queryBuilder
      .orderBy("campaign.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [campaigns, total] = await queryBuilder.getManyAndCount();

    return { campaigns, total };
  }

  async findOne(id: string, locale: string = "en"): Promise<Campaign> {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(
        this.i18nService.translate("campaigns.invalid_uuid", locale as any, {
          id,
        })
      );
    }

    const campaign = await this.campaignsRepository.findOne({
      where: { id },
      relations: ["creator", "rewards", "fundings", "fundings.user"],
    });

    if (!campaign) {
      throw new NotFoundException(
        this.i18nService.translate("campaigns.not_found", locale as any, { id })
      );
    }

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    userId: string,
    locale: string = "en"
  ): Promise<Campaign> {
    const campaign = await this.findOne(id, locale);

    if (campaign.creatorId !== userId) {
      throw new ForbiddenException(
        this.i18nService.translate("campaigns.update_own_only", locale as any)
      );
    }

    await this.campaignsRepository.update(id, updateCampaignDto);
    const updatedCampaign = await this.findOne(id);

    await this.websocketGateway.broadcastCampaignUpdate(id, {
      title: updatedCampaign.title,
      description: updatedCampaign.description,
      status: updatedCampaign.status,
      raisedAmount: updatedCampaign.raisedAmount,
      backersCount: updatedCampaign.backersCount,
    });

    if (
      updateCampaignDto.status &&
      updateCampaignDto.status !== campaign.status
    ) {
      await this.websocketGateway.broadcastCampaignStatusChange(
        id,
        updateCampaignDto.status,
        {
          previousStatus: campaign.status,
        }
      );
    }

    return updatedCampaign;
  }

  async adminUpdate(
    id: string,
    updateCampaignDto: UpdateCampaignDto
  ): Promise<Campaign> {
    const campaign = await this.findOne(id);
    await this.campaignsRepository.update(id, updateCampaignDto);
    const updatedCampaign = await this.findOne(id);

    await this.websocketGateway.broadcastCampaignUpdate(id, {
      title: updatedCampaign.title,
      description: updatedCampaign.description,
      status: updatedCampaign.status,
      raisedAmount: updatedCampaign.raisedAmount,
      backersCount: updatedCampaign.backersCount,
    });

    if (
      updateCampaignDto.status &&
      updateCampaignDto.status !== campaign.status
    ) {
      await this.websocketGateway.broadcastCampaignStatusChange(
        id,
        updateCampaignDto.status,
        { previousStatus: campaign.status }
      );
    }

    return updatedCampaign;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(
        `Invalid campaign ID format. Expected UUID, got: ${id}`
      );
    }
    const campaign = await this.findOne(id);

    if (campaign.creatorId !== userId) {
      throw new ForbiddenException("You can only delete your own campaigns");
    }

    const result = await this.campaignsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
  }

  async addReward(
    campaignId: string,
    createRewardDto: CreateRewardDto,
    userId: string
  ): Promise<Reward> {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(campaignId)) {
      throw new BadRequestException(
        `Invalid campaign ID format. Expected UUID, got: ${campaignId}`
      );
    }
    const campaign = await this.findOne(campaignId);

    if (campaign.creatorId !== userId) {
      throw new ForbiddenException(
        "You can only add rewards to your own campaigns"
      );
    }

    const reward = this.rewardsRepository.create({
      ...createRewardDto,
      campaignId,
    });

    return this.rewardsRepository.save(reward);
  }

  async updateCampaignStats(
    campaignId: string,
    fundingAmount: number
  ): Promise<void> {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(campaignId)) {
      throw new BadRequestException(
        `Invalid campaign ID format. Expected UUID, got: ${campaignId}`
      );
    }

    await this.campaignsRepository
      .createQueryBuilder()
      .update(Campaign)
      .set({
        raisedAmount: () => `raised_amount + ${fundingAmount}`,
        backersCount: () => "backers_count + 1",
      })
      .where("id = :id", { id: campaignId })
      .execute();
  }

  async getFeaturedCampaigns(): Promise<Campaign[]> {
    return this.campaignsRepository.find({
      where: { status: CampaignStatus.ACTIVE },
      relations: ["creator", "rewards"],
      order: { raisedAmount: "DESC" },
      take: 6,
    });
  }

  async getCampaignCounts(): Promise<{
    activeCampaigns: number;
    totalCampaigns: number;
    fundedCampaigns: number;
  }> {
    const [activeCampaigns, totalCampaigns, fundedCampaigns] =
      await Promise.all([
        this.campaignsRepository.count({
          where: { status: CampaignStatus.ACTIVE },
        }),
        this.campaignsRepository.count(),
        this.campaignsRepository.count({
          where: { status: CampaignStatus.FUNDED },
        }),
      ]);

    return { activeCampaigns, totalCampaigns, fundedCampaigns };
  }

  async getCampaignsByCreator(creatorId: string): Promise<Campaign[]> {
    return this.campaignsRepository.find({
      where: { creatorId },
      relations: ["rewards", "fundings"],
      order: { createdAt: "DESC" },
    });
  }

  async getCampaignUpdates(campaignId: string): Promise<CampaignUpdate[]> {
    await this.findOne(campaignId);
    return this.updatesRepository.find({
      where: { campaignId },
      relations: ["author"],
      order: { createdAt: "DESC" },
    });
  }

  async createCampaignUpdate(
    campaignId: string,
    dto: CreateCampaignUpdateDto,
    userId: string
  ): Promise<CampaignUpdate> {
    const campaign = await this.findOne(campaignId);
    if (campaign.creatorId !== userId) {
      throw new ForbiddenException(
        "Only the campaign creator can post updates"
      );
    }

    const update = this.updatesRepository.create({
      ...dto,
      campaignId,
      authorId: userId,
    });
    return this.updatesRepository.save(update);
  }

  async saveCampaign(campaignId: string, userId: string): Promise<{ saved: true }> {
    await this.findOne(campaignId);
    const existing = await this.savedRepository.findOne({
      where: { userId, campaignId },
    });
    if (!existing) {
      await this.savedRepository.save(
        this.savedRepository.create({ userId, campaignId })
      );
    }
    return { saved: true };
  }

  async unsaveCampaign(
    campaignId: string,
    userId: string
  ): Promise<{ saved: false }> {
    await this.savedRepository.delete({ userId, campaignId });
    return { saved: false };
  }

  async getSaveStatus(
    campaignId: string,
    userId: string
  ): Promise<{ saved: boolean }> {
    const record = await this.savedRepository.findOne({
      where: { userId, campaignId },
    });
    return { saved: !!record };
  }

  async getSavedCampaigns(userId: string): Promise<Campaign[]> {
    const saved = await this.savedRepository.find({
      where: { userId },
      relations: ["campaign", "campaign.creator", "campaign.rewards"],
      order: { createdAt: "DESC" },
    });
    return saved.map((s) => s.campaign);
  }

  async getUpdatesByCreator(
    creatorId: string,
    limit = 10
  ): Promise<CampaignUpdate[]> {
    return this.updatesRepository
      .createQueryBuilder("update")
      .innerJoin("update.campaign", "campaign")
      .where("campaign.creatorId = :creatorId", { creatorId })
      .leftJoinAndSelect("update.author", "author")
      .orderBy("update.createdAt", "DESC")
      .take(limit)
      .getMany();
  }
}
