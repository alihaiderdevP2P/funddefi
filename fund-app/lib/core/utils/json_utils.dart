double parseNum(dynamic value) {
  if (value == null) return 0;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString()) ?? 0;
}

int parseInt(dynamic value) {
  if (value == null) return 0;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString()) ?? 0;
}

bool parseBool(dynamic value, {bool fallback = false}) {
  if (value is bool) return value;
  if (value == null) return fallback;
  final text = value.toString().toLowerCase();
  if (text == 'true' || text == '1') return true;
  if (text == 'false' || text == '0') return false;
  return fallback;
}

String? parseString(dynamic value) {
  if (value == null) return null;
  final text = value.toString();
  return text.isEmpty ? null : text;
}

DateTime? parseDate(dynamic value) {
  if (value == null) return null;
  return DateTime.tryParse(value.toString());
}

Map<String, dynamic> asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return <String, dynamic>{};
}

List<dynamic> asList(dynamic value) {
  if (value is List) return value;
  return const [];
}

List<Map<String, dynamic>> extractMaps(dynamic data, [List<String> keys = const []]) {
  if (data is List) {
    return data.whereType<Map>().map(asMap).toList();
  }
  final map = asMap(data);
  for (final key in [
    ...keys,
    'campaigns',
    'posts',
    'articles',
    'jobs',
    'notifications',
    'fundings',
    'users',
    'data',
    'items',
    'results',
  ]) {
    if (map[key] is List) {
      return asList(map[key]).whereType<Map>().map(asMap).toList();
    }
  }
  return const [];
}
