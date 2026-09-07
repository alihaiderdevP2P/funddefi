import '../core/utils/json_utils.dart';

class Reward {
  const Reward({
    required this.id,
    required this.title,
    required this.description,
    required this.minAmount,
    this.deliveryDate,
    this.maxBackers,
    this.currentBackers = 0,
    this.imageUrl,
    this.campaignId,
  });

  final String id;
  final String title;
  final String description;
  final double minAmount;
  final DateTime? deliveryDate;
  final int? maxBackers;
  final int currentBackers;
  final String? imageUrl;
  final String? campaignId;

  bool get isSoldOut =>
      maxBackers != null && maxBackers! > 0 && currentBackers >= maxBackers!;

  factory Reward.fromJson(Map<String, dynamic> json) {
    return Reward(
      id: parseString(json['id']) ?? '',
      title: parseString(json['title']) ?? 'Reward',
      description: parseString(json['description']) ?? '',
      minAmount: parseNum(json['minAmount']),
      deliveryDate: parseDate(json['deliveryDate']),
      maxBackers: json['maxBackers'] == null ? null : parseInt(json['maxBackers']),
      currentBackers: parseInt(json['currentBackers']),
      imageUrl: parseString(json['imageUrl']),
      campaignId: parseString(json['campaignId']),
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'title': title,
        'description': description,
        'minAmount': minAmount,
        if (deliveryDate != null)
          'deliveryDate': deliveryDate!.toIso8601String(),
        if (maxBackers != null) 'maxBackers': maxBackers,
        if (imageUrl != null) 'imageUrl': imageUrl,
      };
}

class RewardDraft {
  RewardDraft({
    this.title = '',
    this.description = '',
    this.minAmount = 0.01,
    this.deliveryDate,
    this.maxBackers,
  });

  String title;
  String description;
  double minAmount;
  DateTime? deliveryDate;
  int? maxBackers;

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'minAmount': minAmount,
        if (deliveryDate != null)
          'deliveryDate': deliveryDate!.toIso8601String(),
        if (maxBackers != null) 'maxBackers': maxBackers,
      };
}
