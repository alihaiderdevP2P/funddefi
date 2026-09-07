import '../core/network/api_client.dart';
import '../core/utils/json_utils.dart';
import '../models/job.dart';

class CareersService {
  CareersService(this._api);

  final ApiClient _api;

  Future<List<JobPosting>> list({String? department, String? search}) async {
    final data = await _api.get<dynamic>('/careers', query: {
      if (department != null && department.isNotEmpty) 'department': department,
      if (search != null && search.isNotEmpty) 'search': search,
    });
    return extractMaps(data, ['jobs']).map(JobPosting.fromJson).toList();
  }

  Future<JobPosting> bySlug(String slug) async {
    final data = await _api.get<dynamic>('/careers/$slug');
    return JobPosting.fromJson(asMap(data));
  }

  Future<void> apply(String jobId, Map<String, dynamic> body) {
    return _api.post<dynamic>('/careers/$jobId/apply', data: body);
  }

  Future<void> inquiry(Map<String, dynamic> body) {
    return _api.post<dynamic>('/careers/inquiries', data: body);
  }
}
