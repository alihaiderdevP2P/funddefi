import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// FundFlow API configuration.
///
/// Load order (first non-empty wins):
/// 1. `--dart-define=API_BASE_URL=...` or `--dart-define-from-file=.env`
/// 2. `.env` (debug) or `.env.production` (release / APP_ENV=production)
/// 3. Platform fallback (Android emulator → 10.0.2.2, else localhost)
///
/// Settings screen can still override at runtime (saved in SharedPreferences).
class AppConfig {
  AppConfig._();

  static const String appName = 'FundFlow';
  static const String appTagline = 'Crowdfunding without the middleman';

  static const String _defineBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );
  static const String _defineAppEnv = String.fromEnvironment(
    'APP_ENV',
    defaultValue: '',
  );

  static String _fileBaseUrl = '';
  static String _fileAndroidUrl = '';
  static String _wsUrl = '';
  static String _localeHeader = 'en-US,en;q=0.9';
  static String _appEnv = 'development';
  static bool _loaded = false;

  static bool get isProduction => _appEnv == 'production';
  static String get appEnv => _appEnv;
  static String get wsUrl => _wsUrl.isNotEmpty
      ? _stripSlash(_wsUrl)
      : defaultBaseUrl.replaceFirst(RegExp(r'/api/v1/?$'), '');
  static String get localeHeader => _localeHeader;

  static Future<void> load() async {
    if (_loaded) return;

    final preferProduction = _defineAppEnv == 'production' ||
        (_defineAppEnv.isEmpty && kReleaseMode);
    final file = preferProduction ? '.env.production' : '.env';

    await dotenv.load(fileName: file, isOptional: true);
    if (dotenv.env.isEmpty) {
      await dotenv.load(fileName: '.env.example', isOptional: true);
    }

    _appEnv = _firstNonEmpty([
          _defineAppEnv,
          _env('APP_ENV'),
        ]) ??
        (kReleaseMode ? 'production' : 'development');
    _fileBaseUrl = _env('API_BASE_URL') ?? '';
    _fileAndroidUrl = _env('API_BASE_URL_ANDROID') ?? '';
    _wsUrl = _env('WS_URL') ?? '';
    _localeHeader = _env('ACCEPT_LANGUAGE') ?? _localeHeader;
    _loaded = true;
  }

  static String get defaultBaseUrl {
    if (_defineBaseUrl.isNotEmpty) return normalize(_defineBaseUrl);

    final androidUrl =
        _fileAndroidUrl.isNotEmpty ? _fileAndroidUrl : _fileBaseUrl;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      if (androidUrl.isNotEmpty) return normalize(androidUrl);
      return 'http://10.0.2.2:3001/api/v1';
    }

    if (_fileBaseUrl.isNotEmpty) return normalize(_fileBaseUrl);
    return 'http://localhost:3001/api/v1';
  }

  static String normalize(String url) {
    var trimmed = url.trim();
    if (trimmed.endsWith('/')) {
      trimmed = trimmed.substring(0, trimmed.length - 1);
    }
    if (trimmed.endsWith('/api')) {
      return '$trimmed/v1';
    }
    return trimmed;
  }

  static String _stripSlash(String url) {
    final trimmed = url.trim();
    return trimmed.endsWith('/')
        ? trimmed.substring(0, trimmed.length - 1)
        : trimmed;
  }

  static String? _env(String key) {
    try {
      return dotenv.maybeGet(key);
    } catch (_) {
      return null;
    }
  }

  static String? _firstNonEmpty(List<String?> values) {
    for (final value in values) {
      if (value != null && value.trim().isNotEmpty) return value.trim();
    }
    return null;
  }
}
