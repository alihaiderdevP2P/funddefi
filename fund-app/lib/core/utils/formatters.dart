import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final NumberFormat _eth = NumberFormat('#,##0.##');
  static final NumberFormat _compact = NumberFormat.compact();

  static String eth(num value, {bool symbol = true}) {
    final formatted = _eth.format(value);
    return symbol ? '$formatted ETH' : formatted;
  }

  static String compact(num value) => _compact.format(value);

  static String percent(num raised, num goal) {
    if (goal <= 0) return '0%';
    return '${((raised / goal) * 100).clamp(0, 999).toStringAsFixed(0)}%';
  }

  static double progress(num raised, num goal) {
    if (goal <= 0) return 0;
    return (raised / goal).clamp(0, 1).toDouble();
  }

  static String daysLeft(DateTime? end) {
    if (end == null) return '—';
    final remaining = end.toLocal().difference(DateTime.now());
    if (remaining.isNegative) return 'Ended';
    if (remaining.inDays > 0) return '${remaining.inDays} days left';
    if (remaining.inHours > 0) return '${remaining.inHours}h left';
    return 'Ending soon';
  }

  static String daysLeftShort(DateTime? end) {
    if (end == null) return 'Open';
    final remaining = end.toLocal().difference(DateTime.now());
    if (remaining.isNegative) return 'Ended';
    if (remaining.inDays > 0) return '${remaining.inDays}d left';
    if (remaining.inHours > 0) return '${remaining.inHours}h left';
    return 'Soon';
  }

  static String date(DateTime? value) {
    if (value == null) return '—';
    return DateFormat.yMMMd().format(value.toLocal());
  }

  static String dateTime(DateTime? value) {
    if (value == null) return '—';
    return DateFormat.yMMMd().add_jm().format(value.toLocal());
  }

  static String shortAddress(String? address) {
    if (address == null || address.isEmpty) return 'No wallet';
    if (address.length < 12) return address;
    return '${address.substring(0, 6)}…${address.substring(address.length - 4)}';
  }

  static String categoryLabel(String category) {
    if (category.isEmpty) return 'General';
    return category[0].toUpperCase() + category.substring(1);
  }

  static String statusLabel(String status) {
    if (status.isEmpty) return 'Unknown';
    return status[0].toUpperCase() + status.substring(1);
  }

  static String campaignCode(String id) {
    final compact = id.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '');
    if (compact.isEmpty) return '#0000';
    final tail = compact.length <= 4
        ? compact
        : compact.substring(compact.length - 4);
    return '#${tail.toUpperCase()}';
  }

  static String networkLabel(String? contractAddress) {
    if (contractAddress != null && contractAddress.isNotEmpty) return 'Sepolia';
    return 'Ethereum';
  }

  static String monthYear(DateTime? value) {
    if (value == null) return 'TBD';
    return DateFormat.yMMM().format(value.toLocal());
  }

  static String relative(DateTime? value) {
    if (value == null) return '—';
    final d = DateTime.now().difference(value.toLocal());
    if (d.inMinutes < 1) return 'just now';
    if (d.inMinutes < 60) return '${d.inMinutes}m ago';
    if (d.inHours < 24) return '${d.inHours}h ago';
    if (d.inDays < 7) return '${d.inDays}d ago';
    return date(value);
  }

  static String usdApprox(num eth, {double rate = 3570}) {
    return NumberFormat.simpleCurrency().format(eth * rate);
  }

  static String successRate(num value) {
    final pct = value <= 1 ? value * 100 : value;
    return '${pct.clamp(0, 100).toStringAsFixed(0)}%';
  }
}
