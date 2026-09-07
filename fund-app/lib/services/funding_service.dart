import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/funding.dart';

class FundingService {
  FundingService(this._api);

  final ApiClient _api;

  Future<PlatformStats> stats() async {
    final data = await _api.get<dynamic>('/funding/stats');
    return PlatformStats.fromJson(asMap(data));
  }

  Future<List<Funding>> myFundings() async {
    final data = await _api.get<dynamic>('/funding/my-fundings');
    return extractMaps(data, ['fundings']).map(Funding.fromJson).toList();
  }

  Future<DashboardData> dashboard() async {
    final data = await _api.get<dynamic>('/funding/my-dashboard');
    return DashboardData.fromJson(asMap(data));
  }

  Future<List<Funding>> byCampaign(String campaignId) async {
    final data = await _api.get<dynamic>('/funding/campaign/$campaignId');
    return extractMaps(data, ['fundings']).map(Funding.fromJson).toList();
  }

  Future<Funding> create({
    required String campaignId,
    required double amount,
    required String transactionHash,
    String? rewardId,
    String? message,
    String? status,
  }) async {
    final data = await _api.post<dynamic>('/funding', data: {
      'campaignId': campaignId,
      'amount': amount,
      'transactionHash': transactionHash,
      if (rewardId != null) 'rewardId': rewardId,
      if (message != null && message.isNotEmpty) 'message': message,
      'status': status ?? 'confirmed',
    });
    return Funding.fromJson(asMap(data));
  }
}
