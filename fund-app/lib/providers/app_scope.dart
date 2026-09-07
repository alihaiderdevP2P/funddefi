import 'package:flutter/material.dart';

import '../core/config/app_config.dart';
import '../core/network/api_client.dart';
import '../core/storage/token_storage.dart';
import '../services/admin_service.dart';
import '../services/auth_service.dart';
import '../services/blog_service.dart';
import '../services/campaign_service.dart';
import '../services/careers_service.dart';
import '../services/contact_service.dart';
import '../services/funding_service.dart';
import '../services/notification_service.dart';
import '../services/support_service.dart';
import '../services/user_service.dart';

class AppScope {
  AppScope._({
    required this.storage,
    required this.api,
    required this.auth,
    required this.campaigns,
    required this.funding,
    required this.users,
    required this.admin,
    required this.blog,
    required this.support,
    required this.contact,
    required this.notifications,
    required this.careers,
  });

  final TokenStorage storage;
  final ApiClient api;
  final AuthService auth;
  final CampaignService campaigns;
  final FundingService funding;
  final UserService users;
  final AdminService admin;
  final BlogService blog;
  final SupportService support;
  final ContactService contact;
  final NotificationService notifications;
  final CareersService careers;

  static Future<AppScope> create() async {
    final storage = TokenStorage();
    final saved = await storage.readApiBaseUrl();
    final api = ApiClient(
      storage: storage,
      baseUrl: (saved != null && saved.isNotEmpty)
          ? AppConfig.normalize(saved)
          : AppConfig.defaultBaseUrl,
    );
    return AppScope._(
      storage: storage,
      api: api,
      auth: AuthService(api),
      campaigns: CampaignService(api),
      funding: FundingService(api),
      users: UserService(api),
      admin: AdminService(api),
      blog: BlogService(api),
      support: SupportService(api),
      contact: ContactService(api),
      notifications: NotificationService(api),
      careers: CareersService(api),
    );
  }
}
