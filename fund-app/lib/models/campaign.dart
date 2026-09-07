import '../core/utils/json_utils.dart';
import 'reward.dart';
import 'user.dart';

class Campaign {
  const Campaign({
    required this.id,
    required this.title,
    required this.description,
    required this.summary,
    required this.goalAmount,
    required this.raisedAmount,
    this.endDate,
    this.status = 'draft',
    this.category = 'technology',
    this.imageUrl,
    this.videoUrl,
    this.contractAddress,
    this.backersCount = 0,
    this.creator,
    this.creatorId,
    this.rewards = const [],
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String title;
  final String description;
  final String summary;
  final double goalAmount;
  final double raisedAmount;
  final DateTime? endDate;
  final String status;
  final String category;
  final String? imageUrl;
  final String? videoUrl;
  final String? contractAddress;
  final int backersCount;
  final User? creator;
  final String? creatorId;
  final List<Reward> rewards;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  double get progress =>
      goalAmount <= 0 ? 0 : (raisedAmount / goalAmount).clamp(0, 1);
  bool get isActive => status == 'active';
  bool get isEnded =>
      status == 'expired' ||
      status == 'cancelled' ||
      (endDate != null && endDate!.isBefore(DateTime.now()));

  factory Campaign.fromJson(Map<String, dynamic> json) {
    return Campaign(
      id: parseString(json['id']) ?? '',
      title: parseString(json['title']) ?? 'Untitled campaign',
      description: parseString(json['description']) ?? '',
      summary: parseString(json['summary']) ?? '',
      goalAmount: parseNum(json['goalAmount']),
      raisedAmount: parseNum(json['raisedAmount']),
      endDate: parseDate(json['endDate']),
      status: parseString(json['status']) ?? 'draft',
      category: parseString(json['category']) ?? 'technology',
      imageUrl: parseString(json['imageUrl']),
      videoUrl: parseString(json['videoUrl']),
      contractAddress: parseString(json['contractAddress']),
      backersCount: parseInt(json['backersCount']),
      creator: json['creator'] is Map
          ? User.fromJson(asMap(json['creator']))
          : null,
      creatorId: parseString(json['creatorId']),
      rewards: asList(json['rewards'])
          .whereType<Map>()
          .map((e) => Reward.fromJson(asMap(e)))
          .toList(),
      createdAt: parseDate(json['createdAt']),
      updatedAt: parseDate(json['updatedAt']),
    );
  }
}

class CampaignListResult {
  const CampaignListResult({required this.campaigns, required this.total});

  final List<Campaign> campaigns;
  final int total;

  factory CampaignListResult.fromJson(dynamic data) {
    if (data is List) {
      final items = data
          .whereType<Map>()
          .map((e) => Campaign.fromJson(asMap(e)))
          .toList();
      return CampaignListResult(campaigns: items, total: items.length);
    }
    final map = asMap(data);
    final items = asList(map['campaigns'])
        .whereType<Map>()
        .map((e) => Campaign.fromJson(asMap(e)))
        .toList();
    return CampaignListResult(
      campaigns: items,
      total: parseInt(map['total'] ?? items.length),
    );
  }
}

class CampaignUpdate {
  const CampaignUpdate({
    required this.id,
    required this.title,
    required this.content,
    this.campaignId,
    this.authorId,
    this.author,
    this.createdAt,
  });

  final String id;
  final String title;
  final String content;
  final String? campaignId;
  final String? authorId;
  final User? author;
  final DateTime? createdAt;

  factory CampaignUpdate.fromJson(Map<String, dynamic> json) {
    return CampaignUpdate(
      id: parseString(json['id']) ?? '',
      title: parseString(json['title']) ?? '',
      content: parseString(json['content']) ?? '',
      campaignId: parseString(json['campaignId']),
      authorId: parseString(json['authorId']),
      author: json['author'] is Map ? User.fromJson(asMap(json['author'])) : null,
      createdAt: parseDate(json['createdAt']),
    );
  }
}

class CampaignConstants {
  CampaignConstants._();

  static const categories = [
    'technology',
    'creative',
    'community',
    'business',
    'environment',
    'health',
    'education',
  ];

  static const statuses = [
    'draft',
    'active',
    'funded',
    'expired',
    'cancelled',
  ];
}
