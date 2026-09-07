import 'package:flutter/material.dart';

import '../core/storage/token_storage.dart';

class ThemeController extends ChangeNotifier {
  ThemeController(this._storage);

  final TokenStorage _storage;
  ThemeMode mode = ThemeMode.system;

  Future<void> load() async {
    final saved = await _storage.readThemeMode();
    mode = switch (saved) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
    notifyListeners();
  }

  Future<void> setMode(ThemeMode value) async {
    mode = value;
    await _storage.saveThemeMode(switch (value) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    });
    notifyListeners();
  }

  Future<void> cycle() async {
    final next = switch (mode) {
      ThemeMode.system => ThemeMode.light,
      ThemeMode.light => ThemeMode.dark,
      ThemeMode.dark => ThemeMode.system,
    };
    await setMode(next);
  }

  Future<void> toggleLightDark([Brightness? platform]) async {
    final current = switch (mode) {
      ThemeMode.light => Brightness.light,
      ThemeMode.dark => Brightness.dark,
      ThemeMode.system =>
        platform ?? WidgetsBinding.instance.platformDispatcher.platformBrightness,
    };
    await setMode(
      current == Brightness.dark ? ThemeMode.light : ThemeMode.dark,
    );
  }
}
