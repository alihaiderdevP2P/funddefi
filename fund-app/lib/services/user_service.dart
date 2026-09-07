import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/user.dart';

class UserService {
  UserService(this._api);

  final ApiClient _api;

  Future<User> getById(String id) async {
    final data = await _api.get<dynamic>('/users/$id');
    return User.fromJson(asMap(data));
  }

  Future<User> update(String id, Map<String, dynamic> body) async {
    final data = await _api.patch<dynamic>('/users/$id', data: body);
    return User.fromJson(asMap(data));
  }

  Future<List<User>> list() async {
    final data = await _api.get<dynamic>('/users');
    return extractMaps(data, ['users']).map(User.fromJson).toList();
  }
}
