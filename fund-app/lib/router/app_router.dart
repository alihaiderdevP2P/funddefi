import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../screens/about/about_screen.dart';
import '../screens/admin/admin_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/blog/blog_detail_screen.dart';
import '../screens/blog/blog_screen.dart';
import '../screens/campaigns/back_campaign_screen.dart';
import '../screens/campaigns/campaign_detail_screen.dart';
import '../screens/campaigns/campaigns_screen.dart';
import '../screens/campaigns/saved_campaigns_screen.dart';
import '../screens/careers/careers_screen.dart';
import '../screens/careers/job_detail_screen.dart';
import '../screens/contact/contact_screen.dart';
import '../screens/create/create_campaign_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/docs/docs_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/how_it_works/how_it_works_screen.dart';
import '../screens/more/more_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/public_profile_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/shell/main_shell.dart';
import '../screens/splash_screen.dart';
import '../screens/support/article_screen.dart';
import '../screens/support/support_screen.dart';

GoRouter createRouter(AuthProvider auth) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: auth,
    redirect: (context, state) {
      final loc = state.matchedLocation;
      if (!auth.ready) {
        return loc == '/splash' ? null : '/splash';
      }
      if (loc == '/splash') return '/';

      final public = {
        '/',
        '/campaigns',
        '/login',
        '/register',
        '/about',
        '/contact',
        '/support',
        '/how-it-works',
        '/docs',
        '/blog',
        '/careers',
        '/more',
      };

      final isPublic = public.contains(loc) ||
          loc.startsWith('/campaigns/') ||
          loc.startsWith('/blog/') ||
          loc.startsWith('/careers/') ||
          loc.startsWith('/support/articles/') ||
          loc.startsWith('/users/');

      final needsAuth = loc.startsWith('/dashboard') ||
          loc.startsWith('/create') ||
          loc.startsWith('/profile') ||
          loc.startsWith('/settings') ||
          loc.startsWith('/admin') ||
          loc.startsWith('/notifications') ||
          loc.startsWith('/saved') ||
          loc.contains('/back');

      if (needsAuth && !auth.isAuthenticated) {
        return '/login';
      }
      if ((loc == '/login' || loc == '/register') && auth.isAuthenticated) {
        return '/';
      }
      if (loc.startsWith('/admin') && !auth.isAdmin) {
        return '/';
      }
      if (!isPublic && needsAuth && !auth.isAuthenticated) {
        return '/login';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/campaigns',
              builder: (_, __) => const CampaignsScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/create',
              builder: (_, __) => const CreateCampaignScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/dashboard',
              builder: (_, __) => const DashboardScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/more', builder: (_, __) => const MoreScreen()),
          ]),
        ],
      ),
      GoRoute(
        path: '/campaigns/:id',
        builder: (_, state) =>
            CampaignDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/campaigns/:id/back',
        builder: (_, state) =>
            BackCampaignScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
      GoRoute(path: '/admin', builder: (_, __) => const AdminScreen()),
      GoRoute(path: '/support', builder: (_, __) => const SupportScreen()),
      GoRoute(
        path: '/support/articles/:slug',
        builder: (_, state) =>
            ArticleScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(path: '/contact', builder: (_, __) => const ContactScreen()),
      GoRoute(path: '/about', builder: (_, __) => const AboutScreen()),
      GoRoute(
        path: '/how-it-works',
        builder: (_, __) => const HowItWorksScreen(),
      ),
      GoRoute(path: '/docs', builder: (_, __) => const DocsScreen()),
      GoRoute(path: '/blog', builder: (_, __) => const BlogScreen()),
      GoRoute(
        path: '/blog/:slug',
        builder: (_, state) =>
            BlogDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(path: '/careers', builder: (_, __) => const CareersScreen()),
      GoRoute(
        path: '/careers/:slug',
        builder: (_, state) =>
            JobDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/saved',
        builder: (_, __) => const SavedCampaignsScreen(),
      ),
      GoRoute(
        path: '/users/:id',
        builder: (_, state) =>
            PublicProfileScreen(id: state.pathParameters['id']!),
      ),
    ],
  );
}
