import '../core/utils/json_utils.dart';

class JobPosting {
  const JobPosting({
    required this.id,
    required this.title,
    this.slug,
    this.department,
    this.location,
    this.jobType,
    this.description,
    this.requirements = const [],
    this.status = 'published',
    this.publishedAt,
    this.closesAt,
  });

  final String id;
  final String title;
  final String? slug;
  final String? department;
  final String? location;
  final String? jobType;
  final String? description;
  final List<String> requirements;
  final String status;
  final DateTime? publishedAt;
  final DateTime? closesAt;

  String get routeKey => slug ?? id;

  factory JobPosting.fromJson(Map<String, dynamic> json) {
    return JobPosting(
      id: parseString(json['id']) ?? '',
      title: parseString(json['title']) ?? '',
      slug: parseString(json['slug']),
      department: parseString(json['department']),
      location: parseString(json['location']),
      jobType: parseString(json['jobType']),
      description: parseString(json['description']),
      requirements: asList(json['requirements']).map((e) => e.toString()).toList(),
      status: parseString(json['status']) ?? 'published',
      publishedAt: parseDate(json['publishedAt']),
      closesAt: parseDate(json['closesAt']),
    );
  }
}
