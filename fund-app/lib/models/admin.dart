import '../core/utils/json_utils.dart';

class AdminStats {
  const AdminStats({
    this.totalUsers = 0,
    this.activeCampaigns = 0,
    this.totalFunding = 0,
    this.pendingApprovals = 0,
    this.flaggedCampaigns = 0,
    this.totalFundings = 0,
    this.totalBackers = 0,
  });

  final int totalUsers;
  final int activeCampaigns;
  final double totalFunding;
  final int pendingApprovals;
  final int flaggedCampaigns;
  final int totalFundings;
  final int totalBackers;

  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      totalUsers: parseInt(json['totalUsers']),
      activeCampaigns: parseInt(json['activeCampaigns']),
      totalFunding: parseNum(json['totalFunding'] ?? json['totalAmount']),
      pendingApprovals: parseInt(json['pendingApprovals']),
      flaggedCampaigns: parseInt(json['flaggedCampaigns']),
      totalFundings: parseInt(json['totalFundings']),
      totalBackers: parseInt(json['totalBackers']),
    );
  }
}

class ActivityItem {
  const ActivityItem({
    required this.id,
    required this.action,
    this.details,
    this.type,
    this.timestamp,
  });

  final String id;
  final String action;
  final String? details;
  final String? type;
  final DateTime? timestamp;

  factory ActivityItem.fromJson(Map<String, dynamic> json) {
    return ActivityItem(
      id: parseString(json['id']) ?? '',
      action: parseString(json['action'] ?? json['type']) ?? 'Activity',
      details: parseString(json['details'] ?? json['message']),
      type: parseString(json['type']),
      timestamp: parseDate(json['timestamp'] ?? json['createdAt']),
    );
  }
}

class ModerationReport {
  const ModerationReport({
    required this.id,
    required this.campaignTitle,
    required this.reason,
    this.campaignId,
    this.severity = 'medium',
    this.status = 'open',
    this.reporterName,
    this.createdAt,
  });

  final String id;
  final String campaignTitle;
  final String reason;
  final String? campaignId;
  final String severity;
  final String status;
  final String? reporterName;
  final DateTime? createdAt;

  factory ModerationReport.fromJson(Map<String, dynamic> json) {
    return ModerationReport(
      id: parseString(json['id']) ?? '',
      campaignTitle: parseString(json['campaignTitle']) ?? 'Campaign',
      reason: parseString(json['reason']) ?? '',
      campaignId: parseString(json['campaignId']),
      severity: parseString(json['severity']) ?? 'medium',
      status: parseString(json['status']) ?? 'open',
      reporterName: parseString(json['reporterName']),
      createdAt: parseDate(json['createdAt']),
    );
  }
}
