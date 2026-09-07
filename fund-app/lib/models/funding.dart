import '../core/utils/json_utils.dart';
import 'campaign.dart';
import 'reward.dart';
import 'user.dart';

class Funding {
  const Funding({
    required this.id,
    required this.amount,
    required this.transactionHash,
    this.status = 'pending',
    this.message,
    this.user,
    this.campaign,
    this.reward,
    this.campaignId,
    this.userId,
    this.createdAt,
  });

  final String id;
  final double amount;
  final String transactionHash;
  final String status;
  final String? message;
  final User? user;
  final Campaign? campaign;
  final Reward? reward;
  final String? campaignId;
  final String? userId;
  final DateTime? createdAt;

  factory Funding.fromJson(Map<String, dynamic> json) {
    return Funding(
      id: parseString(json['id']) ?? '',
      amount: parseNum(json['amount']),
      transactionHash: parseString(json['transactionHash']) ?? '',
      status: parseString(json['status']) ?? 'pending',
      message: parseString(json['message']),
      user: json['user'] is Map ? User.fromJson(asMap(json['user'])) : null,
      campaign:
          json['campaign'] is Map ? Campaign.fromJson(asMap(json['campaign'])) : null,
      reward: json['reward'] is Map ? Reward.fromJson(asMap(json['reward'])) : null,
      campaignId: parseString(json['campaignId']),
      userId: parseString(json['userId']),
      createdAt: parseDate(json['createdAt']),
    );
  }
}

class PlatformStats {
  const PlatformStats({
    this.totalAmount = 0,
    this.totalFundings = 0,
    this.totalBackers = 0,
    this.activeCampaigns = 0,
    this.totalCampaigns = 0,
    this.fundedCampaigns = 0,
  });

  final double totalAmount;
  final int totalFundings;
  final int totalBackers;
  final int activeCampaigns;
  final int totalCampaigns;
  final int fundedCampaigns;

  factory PlatformStats.fromJson(Map<String, dynamic> json) {
    return PlatformStats(
      totalAmount: parseNum(json['totalAmount']),
      totalFundings: parseInt(json['totalFundings']),
      totalBackers: parseInt(json['totalBackers']),
      activeCampaigns: parseInt(json['activeCampaigns']),
      totalCampaigns: parseInt(json['totalCampaigns']),
      fundedCampaigns: parseInt(json['fundedCampaigns']),
    );
  }
}

class DashboardSummary {
  const DashboardSummary({
    this.totalBacked = 0,
    this.backedCampaignCount = 0,
    this.campaignsCreated = 0,
    this.activeCampaigns = 0,
    this.totalBackersOnCreated = 0,
    this.totalRaised = 0,
    this.goalProgress = 0,
    this.daysLeft = 0,
    this.backedSuccessRate = 0,
  });

  final double totalBacked;
  final int backedCampaignCount;
  final int campaignsCreated;
  final int activeCampaigns;
  final int totalBackersOnCreated;
  final double totalRaised;
  final double goalProgress;
  final int daysLeft;
  final double backedSuccessRate;

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      totalBacked: parseNum(json['totalBacked']),
      backedCampaignCount: parseInt(json['backedCampaignCount']),
      campaignsCreated: parseInt(json['campaignsCreated']),
      activeCampaigns: parseInt(json['activeCampaigns']),
      totalBackersOnCreated: parseInt(json['totalBackersOnCreated']),
      totalRaised: parseNum(json['totalRaised']),
      goalProgress: parseNum(json['goalProgress']),
      daysLeft: parseInt(json['daysLeft']),
      backedSuccessRate: parseNum(json['backedSuccessRate']),
    );
  }
}

class DashboardActivity {
  const DashboardActivity({
    required this.type,
    required this.campaign,
    this.campaignId,
    this.amount,
    this.timestamp,
  });

  final String type;
  final String campaign;
  final String? campaignId;
  final double? amount;
  final DateTime? timestamp;

  factory DashboardActivity.fromJson(Map<String, dynamic> json) {
    return DashboardActivity(
      type: parseString(json['type']) ?? '',
      campaign: parseString(json['campaign']) ?? '',
      campaignId: parseString(json['campaignId']),
      amount: json['amount'] == null ? null : parseNum(json['amount']),
      timestamp: parseDate(json['timestamp']),
    );
  }
}

class DashboardData {
  const DashboardData({
    this.summary = const DashboardSummary(),
    this.recentActivity = const [],
    this.campaignPerformance = const [],
  });

  final DashboardSummary summary;
  final List<DashboardActivity> recentActivity;
  final List<Map<String, dynamic>> campaignPerformance;

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      summary: DashboardSummary.fromJson(asMap(json['summary'])),
      recentActivity: asList(json['recentActivity'])
          .whereType<Map>()
          .map((e) => DashboardActivity.fromJson(asMap(e)))
          .toList(),
      campaignPerformance: asList(json['campaignPerformance'])
          .whereType<Map>()
          .map(asMap)
          .toList(),
    );
  }
}
