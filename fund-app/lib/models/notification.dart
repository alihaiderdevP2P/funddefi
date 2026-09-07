import '../core/utils/json_utils.dart';

class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    this.type = 'system',
    this.isRead = false,
    this.createdAt,
  });

  final String id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final DateTime? createdAt;

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: parseString(json['id']) ?? '',
      title: parseString(json['title']) ?? '',
      message: parseString(json['message']) ?? '',
      type: parseString(json['type']) ?? 'system',
      isRead: parseBool(json['isRead']),
      createdAt: parseDate(json['createdAt']),
    );
  }
}

class NotificationInbox {
  const NotificationInbox({
    this.notifications = const [],
    this.unreadCount = 0,
  });

  final List<AppNotification> notifications;
  final int unreadCount;

  factory NotificationInbox.fromJson(dynamic data) {
    if (data is List) {
      final items = data
          .whereType<Map>()
          .map((e) => AppNotification.fromJson(asMap(e)))
          .toList();
      return NotificationInbox(
        notifications: items,
        unreadCount: items.where((n) => !n.isRead).length,
      );
    }
    final map = asMap(data);
    final items = asList(map['notifications'])
        .whereType<Map>()
        .map((e) => AppNotification.fromJson(asMap(e)))
        .toList();
    return NotificationInbox(
      notifications: items,
      unreadCount: parseInt(map['unreadCount'] ?? items.where((n) => !n.isRead).length),
    );
  }
}

class NotificationPreferences {
  const NotificationPreferences({
    this.emailNotifications = true,
    this.campaignUpdates = true,
    this.fundingAlerts = true,
    this.marketingEmails = false,
  });

  final bool emailNotifications;
  final bool campaignUpdates;
  final bool fundingAlerts;
  final bool marketingEmails;

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      emailNotifications: parseBool(json['emailNotifications'], fallback: true),
      campaignUpdates: parseBool(json['campaignUpdates'], fallback: true),
      fundingAlerts: parseBool(json['fundingAlerts'], fallback: true),
      marketingEmails: parseBool(json['marketingEmails']),
    );
  }

  Map<String, dynamic> toJson() => {
        'emailNotifications': emailNotifications,
        'campaignUpdates': campaignUpdates,
        'fundingAlerts': fundingAlerts,
        'marketingEmails': marketingEmails,
      };

  NotificationPreferences copyWith({
    bool? emailNotifications,
    bool? campaignUpdates,
    bool? fundingAlerts,
    bool? marketingEmails,
  }) {
    return NotificationPreferences(
      emailNotifications: emailNotifications ?? this.emailNotifications,
      campaignUpdates: campaignUpdates ?? this.campaignUpdates,
      fundingAlerts: fundingAlerts ?? this.fundingAlerts,
      marketingEmails: marketingEmails ?? this.marketingEmails,
    );
  }
}
