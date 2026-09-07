import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../models/funding.dart';
import '../../models/notification.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_controller.dart';
import '../../widgets/ui_kit.dart';

class MoreScreen extends StatefulWidget {
  const MoreScreen({super.key});

  @override
  State<MoreScreen> createState() => _MoreScreenState();
}

class _MoreScreenState extends State<MoreScreen> {
  DashboardSummary _summary = const DashboardSummary();
  int _unread = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) return;
    try {
      final scope = context.read<AppScope>();
      final results = await Future.wait([
        scope.funding.dashboard(),
        scope.notifications.list(),
      ]);
      if (!mounted) return;
      setState(() {
        _summary = (results[0] as DashboardData).summary;
        _unread = (results[1] as NotificationInbox).unreadCount;
      });
    } catch (_) {}
  }

  Future<void> _copyWallet(String? address) async {
    if (address == null || address.isEmpty) {
      showSnack(context, 'No wallet connected', error: true);
      return;
    }
    await Clipboard.setData(ClipboardData(text: address));
    if (!mounted) return;
    showSnack(context, 'Wallet address copied');
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = context.watch<ThemeController>();
    final user = auth.user;
    final scheme = Theme.of(context).colorScheme;
    final vault = _summary.totalRaised > 0 ? _summary.totalRaised : _summary.totalBacked;
    final fundedRate = Formatters.successRate(_summary.backedSuccessRate);

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        if (auth.isAuthenticated && user != null) ...[
          FfCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: scheme.surfaceContainerHighest,
                      backgroundImage:
                          user.avatar != null && user.avatar!.isNotEmpty
                              ? NetworkImage(user.avatar!)
                              : null,
                      child: user.avatar == null || user.avatar!.isEmpty
                          ? Text(
                              user.initials,
                              style: const TextStyle(fontWeight: FontWeight.w800),
                            )
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  user.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 18,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFE4E6),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  user.role.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFFBE123C),
                                  ),
                                ),
                              ),
                              if (user.isVerified) ...[
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.verified,
                                  size: 16,
                                  color: AppColors.emerald,
                                ),
                              ],
                            ],
                          ),
                          Text(
                            user.email,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => context.push('/settings'),
                      icon: const Icon(Icons.edit_outlined),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: scheme.surfaceContainer,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const LivePulse(),
                          const SizedBox(width: 8),
                          Text(
                            Formatters.networkLabel(user.walletAddress),
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                          const Spacer(),
                          Text(
                            Formatters.shortAddress(user.walletAddress),
                            style: AppFonts.mono(size: 12),
                          ),
                          IconButton(
                            onPressed: () => _copyWallet(user.walletAddress),
                            icon: const Icon(Icons.copy_rounded, size: 16),
                            visualDensity: VisualDensity.compact,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'VAULT LIQUIDITY',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.6,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        Formatters.eth(vault),
                        style: AppFonts.mono(size: 26, weight: FontWeight.w800),
                      ),
                      Text(
                        '≈ ${Formatters.usdApprox(vault)} USD',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => showSnack(
                                context,
                                'Sepolia is the active FundFlow test network',
                              ),
                              child: const Text('Switch Net'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => auth.logout(),
                              child: const Text('Disconnect'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: FfCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      const FfIconBox(icon: Icons.person_add_alt_1_outlined),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Backers',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          Text(
                            '${_summary.totalBackersOnCreated}',
                            style: AppFonts.mono(size: 20, weight: FontWeight.w800),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FfCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      const FfIconBox(icon: Icons.timelapse_outlined),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Funded',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          Text(
                            fundedRate,
                            style: AppFonts.mono(size: 20, weight: FontWeight.w800),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SectionLabel('Account & Security'),
          FfCard(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Column(
              children: [
                _SettingsTile(
                  icon: Icons.person_outline,
                  title: 'Edit Profile',
                  subtitle: 'Manage avatar, socials & public bio.',
                  onTap: () => context.push('/settings'),
                ),
                _SettingsTile(
                  icon: Icons.lock_outline,
                  title: 'Wallet & Security',
                  subtitle: 'Signatures, permissions & cold keys.',
                  onTap: () => context.push('/settings'),
                ),
                _SettingsTile(
                  icon: Icons.notifications_outlined,
                  title: 'Notifications',
                  subtitle: 'Receipts, milestone alerts & pings.',
                  badge: _unread,
                  onTap: () => context.push('/notifications'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _SectionLabel('Preferences'),
          FfCard(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SettingsTile(
                  icon: Icons.language,
                  title: 'Language & Region',
                  trailingText: 'English (US)',
                  onTap: () => showSnack(context, 'English (US) is the current locale'),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Appearance',
                  style: TextStyle(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _Seg(
                      label: 'Light',
                      selected: theme.mode == ThemeMode.light,
                      onTap: () => theme.setMode(ThemeMode.light),
                    ),
                    const SizedBox(width: 8),
                    _Seg(
                      label: 'Dark',
                      selected: theme.mode == ThemeMode.dark,
                      onTap: () => theme.setMode(ThemeMode.dark),
                    ),
                    const SizedBox(width: 8),
                    _Seg(
                      label: 'Auto',
                      selected: theme.mode == ThemeMode.system,
                      onTap: () => theme.setMode(ThemeMode.system),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                _SettingsTile(
                  icon: Icons.attach_money,
                  title: 'Currency Display',
                  trailingText: 'ETH / USD',
                  onTap: () => showSnack(context, 'Amounts are shown in ETH'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          _SectionLabel('Creator Tools'),
          FfCard(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Column(
              children: [
                _SettingsTile(
                  icon: Icons.verified_outlined,
                  title: 'Creator Verification',
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.emerald.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      user.isVerified ? '✓ Verified Creator' : 'Unverified',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.emerald,
                      ),
                    ),
                  ),
                  onTap: () => context.push('/profile'),
                ),
                _SettingsTile(
                  icon: Icons.receipt_long_outlined,
                  title: 'Tax & Compliance',
                  subtitle: 'IPFS proofs & ledger export.',
                  onTap: () => context.push('/docs'),
                ),
                _SettingsTile(
                  icon: Icons.bookmark_outline,
                  title: 'Saved campaigns',
                  subtitle: 'Projects you bookmarked.',
                  onTap: () => context.push('/saved'),
                ),
              ],
            ),
          ),
        ] else
          FfCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const FundFlowLogo(),
                const SizedBox(height: 8),
                Text(
                  AppConfig.appTagline,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () => context.push('/login'),
                  child: const Text('Connect / Sign in'),
                ),
                const SizedBox(height: 8),
                OutlinedButton(
                  onPressed: () => context.push('/register'),
                  child: const Text('Create an account'),
                ),
              ],
            ),
          ),
        const SizedBox(height: 14),
        _SectionLabel('Support & Community'),
        FfCard(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            children: [
              _SettingsTile(
                icon: Icons.help_outline,
                title: 'How it works',
                onTap: () => context.push('/how-it-works'),
              ),
              _SettingsTile(
                icon: Icons.menu_book_outlined,
                title: 'Documentation & Escrow Spec',
                external: true,
                onTap: () => context.push('/docs'),
              ),
              _SettingsTile(
                icon: Icons.forum_outlined,
                title: 'Community Discord & Telegram',
                external: true,
                onTap: () => showSnack(
                  context,
                  'Community links will open when published',
                ),
              ),
              _SettingsTile(
                icon: Icons.support_agent_outlined,
                title: 'Support',
                onTap: () => context.push('/support'),
              ),
              _SettingsTile(
                icon: Icons.mail_outline,
                title: 'Contact',
                onTap: () => context.push('/contact'),
              ),
              _SettingsTile(
                icon: Icons.article_outlined,
                title: 'Blog',
                onTap: () => context.push('/blog'),
              ),
              _SettingsTile(
                icon: Icons.work_outline,
                title: 'Careers',
                onTap: () => context.push('/careers'),
              ),
              _SettingsTile(
                icon: Icons.info_outline,
                title: 'About',
                onTap: () => context.push('/about'),
              ),
            ],
          ),
        ),
        if (auth.isAdmin) ...[
          const SizedBox(height: 14),
          _SectionLabel('Admin'),
          FfCard(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: _SettingsTile(
              icon: Icons.admin_panel_settings_outlined,
              title: 'Admin console',
              onTap: () => context.push('/admin'),
            ),
          ),
        ],
        if (auth.isAuthenticated) ...[
          const SizedBox(height: 14),
          FfCard(
            onTap: () => auth.logout(),
            child: const Row(
              children: [
                Icon(Icons.logout, color: AppColors.rose),
                SizedBox(width: 12),
                Text(
                  'Log Out',
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.rose,
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 18),
        Text(
          'FundFlow Protocol ${AppConfig.appName} · v1.0.0',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        Text(
          'Smart contracts tracked via fund-server escrow records.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 0, 4, 8),
      child: Text(
        text.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.subtitle,
    this.trailingText,
    this.trailing,
    this.badge = 0,
    this.external = false,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final String? trailingText;
  final Widget? trailing;
  final int badge;
  final bool external;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 8),
      leading: FfIconBox(icon: icon),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: subtitle == null ? null : Text(subtitle!),
      trailing: trailing ??
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (trailingText != null)
                Text(
                  trailingText!,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              if (badge > 0) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.ink,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '$badge',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
              Icon(
                external ? Icons.open_in_new_rounded : Icons.chevron_right_rounded,
                size: 18,
              ),
            ],
          ),
      onTap: onTap,
    );
  }
}

class _Seg extends StatelessWidget {
  const _Seg({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: selected ? AppColors.ink : Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: selected ? Colors.white : Theme.of(context).colorScheme.onSurface,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
