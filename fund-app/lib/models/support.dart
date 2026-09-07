import '../core/utils/json_utils.dart';

class HelpArticle {
  const HelpArticle({
    required this.id,
    required this.title,
    this.slug,
    this.summary,
    this.content,
    this.category,
  });

  final String id;
  final String title;
  final String? slug;
  final String? summary;
  final String? content;
  final String? category;

  factory HelpArticle.fromJson(Map<String, dynamic> json) {
    return HelpArticle(
      id: parseString(json['id']) ?? '',
      title: parseString(json['title']) ?? '',
      slug: parseString(json['slug']),
      summary: parseString(json['summary'] ?? json['excerpt']),
      content: parseString(json['content'] ?? json['body']),
      category: parseString(json['category']),
    );
  }
}

class SupportTicket {
  const SupportTicket({
    required this.id,
    this.ticketNumber,
    this.fullName,
    this.email,
    this.subject,
    this.description,
    this.category,
    this.priority,
    this.status,
    this.createdAt,
  });

  final String id;
  final String? ticketNumber;
  final String? fullName;
  final String? email;
  final String? subject;
  final String? description;
  final String? category;
  final String? priority;
  final String? status;
  final DateTime? createdAt;

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: parseString(json['id']) ?? '',
      ticketNumber: parseString(json['ticketNumber']),
      fullName: parseString(json['fullName']),
      email: parseString(json['email']),
      subject: parseString(json['subject']),
      description: parseString(json['description']),
      category: parseString(json['category']),
      priority: parseString(json['priority']),
      status: parseString(json['status']),
      createdAt: parseDate(json['createdAt']),
    );
  }
}

class SupportConstants {
  SupportConstants._();

  static const categories = [
    'general',
    'technical',
    'campaign',
    'payment',
    'bug',
    'feature',
  ];

  static const priorities = ['low', 'medium', 'high', 'urgent'];
}
