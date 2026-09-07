import 'package:flutter/foundation.dart';

import '../core/network/api_exception.dart';
import '../models/user.dart';
import 'app_scope.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._scope) {
    _scope.api.onUnauthorized = () {
      if (isAuthenticated) {
        logout(remote: false);
      }
    };
  }

  final AppScope _scope;

  User? _user;
  bool _ready = false;
  bool _busy = false;
  String? _error;

  User? get user => _user;
  bool get ready => _ready;
  bool get busy => _busy;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get isAdmin => _user?.isAdmin ?? false;

  Future<void> bootstrap() async {
    try {
      final token = await _scope.storage.readToken();
      final cached = User.fromStorage(await _scope.storage.readUserJson());
      if (token != null && token.isNotEmpty) {
        _user = cached;
        notifyListeners();
        try {
          _user = await _scope.auth.getProfile();
          await _scope.storage.saveUserJson(_user!.toStorage());
        } on ApiException catch (e) {
          if (e.isUnauthorized) {
            await _scope.storage.clearAll();
            _user = null;
          }
        }
      }
    } finally {
      _ready = true;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    return _run(() async {
      final result = await _scope.auth.login(email, password);
      await _persist(result);
    });
  }

  Future<bool> register({
    required String email,
    required String name,
    required String password,
    String? walletAddress,
  }) async {
    return _run(() async {
      final result = await _scope.auth.register(
        email: email,
        name: name,
        password: password,
        walletAddress: walletAddress,
      );
      await _persist(result);
    });
  }

  Future<void> refresh() async {
    if (!isAuthenticated) return;
    try {
      _user = await _scope.auth.getProfile();
      await _scope.storage.saveUserJson(_user!.toStorage());
      notifyListeners();
    } catch (_) {}
  }

  Future<void> setUser(User user) async {
    _user = user;
    await _scope.storage.saveUserJson(user.toStorage());
    notifyListeners();
  }

  Future<void> logout({bool remote = true}) async {
    if (remote) {
      try {
        await _scope.auth.logout();
      } catch (_) {}
    }
    await _scope.storage.clearAll();
    _user = null;
    notifyListeners();
  }

  Future<void> _persist(AuthResult result) async {
    await _scope.storage.saveToken(result.accessToken);
    await _scope.storage.saveUserJson(result.user.toStorage());
    _user = result.user;
  }

  Future<bool> _run(Future<void> Function() action) async {
    _busy = true;
    _error = null;
    notifyListeners();
    try {
      await action();
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _busy = false;
      notifyListeners();
    }
  }
}
