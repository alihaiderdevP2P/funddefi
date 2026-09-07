import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/notification.dart';

class NotificationService {
  NotificationService(this._api);

  final ApiClient _api;

  Future<NotificationInbox> list({bool unreadOnly = false}) async {
    final data = await _api.get<dynamic>('/notifications', query: {
      'unreadOnly': unreadOnly,
      'limit': 50,
    });
    return NotificationInbox.fromJson(data);
  }

  Future<void> markRead(String id) =>
      _api.patch<dynamic>('/notifications/$id/read');

  Future<void> markAllRead() =>
      _api.post<dynamic>('/notifications/read-all');

  Future<NotificationPreferences> preferences() async {
    final data = await _api.get<dynamic>('/notifications/preferences');
    return NotificationPreferences.fromJson(asMap(data));
  }

  Future<NotificationPreferences> updatePreferences(
    NotificationPreferences prefs,
  ) async {
    final data = await _api.patch<dynamic>(
      '/notifications/preferences',
      data: prefs.toJson(),
    );
    return NotificationPreferences.fromJson(asMap(data));
  }
}
