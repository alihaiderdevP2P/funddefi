import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/user.dart';

class AuthService {
  AuthService(this._api);

  final ApiClient _api;

  Future<AuthResult> login(String email, String password) async {
    final data = await _api.post<dynamic>('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return AuthResult.fromJson(asMap(data));
  }

  Future<AuthResult> register({
    required String email,
    required String name,
    required String password,
    String? walletAddress,
  }) async {
    final data = await _api.post<dynamic>('/auth/register', data: {
      'email': email,
      'name': name,
      'password': password,
      if (walletAddress != null && walletAddress.isNotEmpty)
        'walletAddress': walletAddress,
    });
    return AuthResult.fromJson(asMap(data));
  }

  Future<User> getProfile() async {
    final data = await _api.get<dynamic>('/auth/profile');
    return User.fromJson(asMap(data));
  }

  Future<void> logout() async {
    try {
      await _api.post<dynamic>('/auth/logout');
    } catch (_) {
      // Token is cleared locally regardless of server response.
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) {
    return _api.post<dynamic>('/auth/change-password', data: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }

  Future<RoleAvailability> roleAvailability() async {
    final data = await _api.get<dynamic>('/auth/role-availability');
    return RoleAvailability.fromJson(asMap(data));
  }
}
