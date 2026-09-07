import '../core/utils/json_utils.dart';

class ContactMessage {
  const ContactMessage({
    this.referenceNumber,
    this.message,
  });

  final String? referenceNumber;
  final String? message;

  factory ContactMessage.fromJson(Map<String, dynamic> json) {
    return ContactMessage(
      referenceNumber: parseString(
        json['referenceNumber'] ?? asMap(json['data'])['referenceNumber'],
      ),
      message: parseString(json['message']),
    );
  }
}

class ContactConstants {
  ContactConstants._();

  static const subjects = [
    'general_inquiry',
    'campaign_support',
    'billing_payments',
    'technical_issue',
    'partnership',
    'feedback',
    'other',
  ];

  static const categories = [
    'general',
    'support',
    'bug',
    'feature',
    'partnership',
  ];

  static String label(String value) {
    return value
        .split('_')
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }
}
