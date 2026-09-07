import '../core/utils/json_utils.dart';

class BlogPost {
  const BlogPost({
    required this.id,
    required this.title,
    this.slug,
    this.excerpt,
    this.content,
    this.coverImage,
    this.category,
    this.tags = const [],
    this.likes = 0,
    this.views = 0,
    this.readTimeMinutes = 5,
    this.featured = false,
    this.publishedAt,
  });

  final String id;
  final String title;
  final String? slug;
  final String? excerpt;
  final String? content;
  final String? coverImage;
  final String? category;
  final List<String> tags;
  final int likes;
  final int views;
  final int readTimeMinutes;
  final bool featured;
  final DateTime? publishedAt;

  String get routeKey => slug ?? id;

  factory BlogPost.fromJson(Map<String, dynamic> json) {
    return BlogPost(
      id: parseString(json['id']) ?? '',
      title: parseString(json['title']) ?? '',
      slug: parseString(json['slug']),
      excerpt: parseString(json['excerpt'] ?? json['summary']),
      content: parseString(json['content'] ?? json['body']),
      coverImage: parseString(
        json['coverImage'] ?? json['imageUrl'] ?? json['coverImageUrl'],
      ),
      category: parseString(json['category']),
      tags: asList(json['tags']).map((e) => e.toString()).toList(),
      likes: parseInt(json['likes']),
      views: parseInt(json['views']),
      readTimeMinutes: parseInt(json['readTimeMinutes'] ?? 5),
      featured: parseBool(json['featured']),
      publishedAt: parseDate(json['publishedAt'] ?? json['createdAt']),
    );
  }
}
