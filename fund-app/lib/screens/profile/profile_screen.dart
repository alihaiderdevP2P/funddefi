import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/ui_kit.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    if (user == null) {
      return const Scaffold(body: Center(child: Text('Not signed in')));
    }
    final scheme = Theme.of(context).colorScheme;
    final hasAvatar = user.avatar != null && user.avatar!.isNotEmpty;

    return FfScaffold(
      title: 'Profile',
      actions: [
        IconButton(
          onPressed: () => context.push('/settings'),
          icon: const Icon(Icons.settings_outlined),
        ),
      ],
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          FfCard(
            padding: const EdgeInsets.all(22),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.emerald, width: 2),
                  ),
                  child: CircleAvatar(
                    radius: 42,
                    backgroundColor: scheme.surfaceContainerHighest,
                    backgroundImage: hasAvatar ? NetworkImage(user.avatar!) : null,
                    child: hasAvatar
                        ? null
                        : Text(
                            user.initials,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 22,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(
                      child: Text(
                        user.name,
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    if (user.isVerified) ...[
                      const SizedBox(width: 6),
                      const Icon(
                        Icons.verified,
                        size: 20,
                        color: AppColors.emerald,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: TextStyle(color: scheme.onSurfaceVariant),
                ),
                const SizedBox(height: 10),
                StatusChip(label: user.role),
                if (user.bio != null && user.bio!.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Text(user.bio!, textAlign: TextAlign.center),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
          FfCard(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Column(
              children: [
                ListTile(
                  leading: const FfIconBox(
                    icon: Icons.account_balance_wallet_outlined,
                  ),
                  title: const Text('Wallet'),
                  subtitle: Text(Formatters.shortAddress(user.walletAddress)),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push('/settings'),
                ),
                ListTile(
                  leading: const FfIconBox(icon: Icons.verified_outlined),
                  title: const Text('Verified'),
                  subtitle: Text(user.isVerified ? 'Yes' : 'Not verified'),
                ),
                ListTile(
                  leading: const FfIconBox(icon: Icons.bookmark_outline),
                  title: const Text('Saved campaigns'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push('/saved'),
                ),
                ListTile(
                  leading: const FfIconBox(icon: Icons.settings_outlined),
                  title: const Text('Settings'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push('/settings'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
