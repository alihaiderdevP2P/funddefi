import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/contact.dart';

class ContactService {
  ContactService(this._api);

  final ApiClient _api;

  Future<Map<String, dynamic>> config() async {
    final data = await _api.get<dynamic>('/contact/config');
    return asMap(data);
  }

  Future<ContactMessage> submit(Map<String, dynamic> body) async {
    final data = await _api.post<dynamic>('/contact/messages', data: body);
    return ContactMessage.fromJson(asMap(data));
  }
}
