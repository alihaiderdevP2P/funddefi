import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/support.dart';

class SupportService {
  SupportService(this._api);

  final ApiClient _api;

  Future<List<HelpArticle>> articles({
    String? category,
    String? search,
  }) async {
    final data = await _api.get<dynamic>('/support/articles', query: {
      if (category != null && category.isNotEmpty) 'category': category,
      if (search != null && search.isNotEmpty) 'search': search,
    });
    return extractMaps(data, ['articles']).map(HelpArticle.fromJson).toList();
  }

  Future<HelpArticle> articleBySlug(String slug) async {
    final data = await _api.get<dynamic>('/support/articles/$slug');
    return HelpArticle.fromJson(asMap(data));
  }

  Future<List<Map<String, dynamic>>> categories() async {
    final data = await _api.get<dynamic>('/support/categories');
    if (data is List) return data.whereType<Map>().map(asMap).toList();
    return extractMaps(data, ['categories']);
  }

  Future<SupportTicket> submitTicket(Map<String, dynamic> body) async {
    final data = await _api.post<dynamic>('/support/tickets', data: body);
    return SupportTicket.fromJson(asMap(asMap(data)['ticket'] ?? data));
  }

  Future<SupportTicket> ticketByNumber(String number) async {
    final data = await _api.get<dynamic>('/support/tickets/$number');
    return SupportTicket.fromJson(asMap(data));
  }
}
