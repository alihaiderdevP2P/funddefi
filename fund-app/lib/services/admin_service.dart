import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/admin.dart';
import '../models/campaign.dart';
import '../models/user.dart';

class AdminService {
  AdminService(this._api);

  final ApiClient _api;

  Future<AdminStats> stats() async {
    final data = await _api.get<dynamic>('/admin/stats');
    return AdminStats.fromJson(asMap(data));
  }

  Future<List<ActivityItem>> activity({int limit = 20}) async {
    final data = await _api.get<dynamic>('/admin/activity', query: {
      'limit': limit,
    });
    return extractMaps(data).map(ActivityItem.fromJson).toList();
  }

  Future<Map<String, dynamic>> health() async {
    final data = await _api.get<dynamic>('/admin/health');
    return asMap(data);
  }

  Future<Map<String, dynamic>> analytics() async {
    final data = await _api.get<dynamic>('/admin/analytics');
    return asMap(data);
  }

  Future<CampaignListResult> campaigns({
    String? status,
    String? search,
    int page = 1,
    int limit = 50,
  }) async {
    final data = await _api.get<dynamic>('/admin/campaigns', query: {
      if (status != null && status.isNotEmpty) 'status': status,
      if (search != null && search.isNotEmpty) 'search': search,
      'page': page,
      'limit': limit,
    });
    return CampaignListResult.fromJson(data);
  }

  Future<void> updateCampaignStatus(String id, String status) {
    return _api.patch<dynamic>('/admin/campaigns/$id/status', data: {
      'status': status,
    });
  }

  Future<List<User>> users({String? search, String? role}) async {
    final data = await _api.get<dynamic>('/admin/users', query: {
      if (search != null && search.isNotEmpty) 'search': search,
      if (role != null && role.isNotEmpty) 'role': role,
    });
    return extractMaps(data, ['users']).map(User.fromJson).toList();
  }

  Future<void> updateUser(
    String id, {
    bool? isVerified,
    bool? isSuspended,
  }) {
    return _api.patch<dynamic>('/admin/users/$id', data: {
      if (isVerified != null) 'isVerified': isVerified,
      if (isSuspended != null) 'isSuspended': isSuspended,
    });
  }

  Future<List<ModerationReport>> moderation() async {
    final data = await _api.get<dynamic>('/admin/moderation');
    return extractMaps(data).map(ModerationReport.fromJson).toList();
  }

  Future<void> moderationAction(String id, String action) {
    return _api.post<dynamic>('/admin/moderation/$id/action', data: {
      'action': action,
    });
  }
}
