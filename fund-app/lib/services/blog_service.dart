import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/blog.dart';

class BlogService {
  BlogService(this._api);

  final ApiClient _api;

  Future<List<BlogPost>> list({
    String? category,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    final data = await _api.get<dynamic>('/blog', query: {
      if (category != null && category.isNotEmpty) 'category': category,
      if (search != null && search.isNotEmpty) 'search': search,
      'page': page,
      'limit': limit,
    });
    return extractMaps(data, ['posts']).map(BlogPost.fromJson).toList();
  }

  Future<List<BlogPost>> featured() async {
    final data = await _api.get<dynamic>('/blog/featured');
    return extractMaps(data, ['posts']).map(BlogPost.fromJson).toList();
  }

  Future<BlogPost> bySlug(String slug) async {
    final data = await _api.get<dynamic>('/blog/$slug');
    return BlogPost.fromJson(asMap(data));
  }

  Future<void> like(String slug) => _api.post<dynamic>('/blog/$slug/like');

  Future<void> subscribe(String email) {
    return _api.post<dynamic>('/blog/newsletter/subscribe', data: {
      'email': email,
    });
  }
}
