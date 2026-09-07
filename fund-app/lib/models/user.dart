import 'dart:convert';

import '../core/utils/json_utils.dart';

class User {
  const User({
    required this.id,
    required this.email,
    required this.name,
    this.walletAddress,
    this.avatar,
    this.bio,
    this.isVerified = false,
    this.isSuspended = false,
    this.role = 'user',
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String email;
  final String name;
  final String? walletAddress;
  final String? avatar;
  final String? bio;
  final bool isVerified;
  final bool isSuspended;
  final String role;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  bool get isAdmin => role == 'admin' || role == 'superadmin';
  bool get isSuperadmin => role == 'superadmin';
  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: parseString(json['id']) ?? '',
      email: parseString(json['email']) ?? '',
      name: parseString(json['name']) ?? 'User',
      walletAddress: parseString(json['walletAddress']),
      avatar: parseString(json['avatar']),
      bio: parseString(json['bio']),
      isVerified: parseBool(json['isVerified']),
      isSuspended: parseBool(json['isSuspended']),
      role: parseString(json['role']) ?? 'user',
      createdAt: parseDate(json['createdAt']),
      updatedAt: parseDate(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'walletAddress': walletAddress,
        'avatar': avatar,
        'bio': bio,
        'isVerified': isVerified,
        'isSuspended': isSuspended,
        'role': role,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  String toStorage() => jsonEncode(toJson());

  static User? fromStorage(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    try {
      return User.fromJson(asMap(jsonDecode(raw)));
    } catch (_) {
      return null;
    }
  }

  User copyWith({
    String? name,
    String? walletAddress,
    String? avatar,
    String? bio,
    bool? isVerified,
    String? role,
  }) {
    return User(
      id: id,
      email: email,
      name: name ?? this.name,
      walletAddress: walletAddress ?? this.walletAddress,
      avatar: avatar ?? this.avatar,
      bio: bio ?? this.bio,
      isVerified: isVerified ?? this.isVerified,
      isSuspended: isSuspended,
      role: role ?? this.role,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

class AuthResult {
  const AuthResult({required this.accessToken, required this.user});

  final String accessToken;
  final User user;

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      accessToken: parseString(json['access_token'] ?? json['accessToken']) ?? '',
      user: User.fromJson(asMap(json['user'])),
    );
  }
}

class RoleAvailability {
  const RoleAvailability({
    required this.max,
    required this.adminAvailable,
    required this.superadminAvailable,
  });

  final int max;
  final bool adminAvailable;
  final bool superadminAvailable;

  factory RoleAvailability.fromJson(Map<String, dynamic> json) {
    return RoleAvailability(
      max: parseInt(json['max']),
      adminAvailable: parseBool(asMap(json['admin'])['available'], fallback: true),
      superadminAvailable:
          parseBool(asMap(json['superadmin'])['available'], fallback: true),
    );
  }
}
