import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/campaign.dart';
import '../models/reward.dart';

class CampaignService {
  CampaignService(this._api);

  final ApiClient _api;

  Future<CampaignListResult> list({
    String? status,
    String? category,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    final data = await _api.get<dynamic>('/campaigns', query: {
      if (status != null && status.isNotEmpty) 'status': status,
      if (category != null && category.isNotEmpty) 'category': category,
      if (search != null && search.isNotEmpty) 'search': search,
      'page': page,
      'limit': limit,
    });
    return CampaignListResult.fromJson(data);
  }

  Future<List<Campaign>> featured() async {
    final data = await _api.get<dynamic>('/campaigns/featured');
    return extractMaps(data).map(Campaign.fromJson).toList();
  }

  Future<Campaign> getById(String id) async {
    final data = await _api.get<dynamic>('/campaigns/$id');
    return Campaign.fromJson(asMap(data));
  }

  Future<List<Campaign>> myCampaigns() async {
    final data = await _api.get<dynamic>('/campaigns/my-campaigns');
    return extractMaps(data).map(Campaign.fromJson).toList();
  }

  Future<List<Campaign>> saved() async {
    final data = await _api.get<dynamic>('/campaigns/me/saved');
    return extractMaps(data).map(Campaign.fromJson).toList();
  }

  Future<bool> saveStatus(String id) async {
    final data = await _api.get<dynamic>('/campaigns/$id/save-status');
    return parseBool(asMap(data)['saved']);
  }

  Future<void> save(String id) => _api.post<dynamic>('/campaigns/$id/save');

  Future<void> unsave(String id) => _api.delete<dynamic>('/campaigns/$id/save');

  Future<Campaign> create(Map<String, dynamic> body) async {
    final data = await _api.post<dynamic>('/campaigns', data: body);
    return Campaign.fromJson(asMap(data));
  }

  Future<Campaign> update(String id, Map<String, dynamic> body) async {
    final data = await _api.patch<dynamic>('/campaigns/$id', data: body);
    return Campaign.fromJson(asMap(data));
  }

  Future<void> delete(String id) => _api.delete<dynamic>('/campaigns/$id');

  Future<Reward> addReward(String campaignId, Map<String, dynamic> body) async {
    final data = await _api.post<dynamic>(
      '/campaigns/$campaignId/rewards',
      data: body,
    );
    return Reward.fromJson(asMap(data));
  }

  Future<List<CampaignUpdate>> updates(String campaignId) async {
    final data = await _api.get<dynamic>('/campaigns/$campaignId/updates');
    return extractMaps(data).map(CampaignUpdate.fromJson).toList();
  }

  Future<CampaignUpdate> createUpdate(
    String campaignId, {
    required String title,
    required String content,
  }) async {
    final data = await _api.post<dynamic>(
      '/campaigns/$campaignId/updates',
      data: {'title': title, 'content': content},
    );
    return CampaignUpdate.fromJson(asMap(data));
  }

  Future<String> uploadImage(String filePath) async {
    final data = await _api.uploadImage(filePath);
    return parseString(data['url'] ?? data['imageUrl']) ?? '';
  }
}
