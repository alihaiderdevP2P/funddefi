import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/copilot_controller.dart';
import '../../providers/theme_controller.dart';
import '../../widgets/copilot_panel.dart';
import '../../widgets/ui_kit.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  void _go(BuildContext context, int index) {
    final auth = context.read<AuthProvider>();
    if ((index == 2 || index == 3) && !auth.isAuthenticated) {
      context.push('/login');
      return;
    }
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final index = navigationShell.currentIndex;
    final copilotOpen = context.watch<CopilotController>().open;
    return Scaffold(
      body: DotGridBackground(
        child: SafeArea(
          bottom: false,
          child: Stack(
            children: [
              Column(
                children: [
                  const _ShellHeader(),
                  Expanded(child: navigationShell),
                ],
              ),
              const CopilotOverlay(),
            ],
          ),
        ),
      ),
      floatingActionButton: !copilotOpen && (index == 0 || index == 1)
          ? const _SupportFab()
          : null,
      bottomNavigationBar: _FfBottomBar(
        index: index,
        onSelect: (i) => _go(context, i),
      ),
    );
  }
}

class _ShellHeader extends StatelessWidget {
  const _ShellHeader();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final dark = Theme.of(context).brightness == Brightness.dark;
    final user = auth.user;
    final connected = auth.isAuthenticated &&
        (user?.walletAddress != null && user!.walletAddress!.isNotEmpty);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 6, 12, 8),
      child: Row(
        children: [
          const Expanded(
            child: Align(
              alignment: Alignment.centerLeft,
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: FundFlowLogo(compact: true),
              ),
            ),
          ),
          _RoundIcon(
            tooltip: dark ? 'Light mode' : 'Dark mode',
            icon: dark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
            onTap: () => context.read<ThemeController>().toggleLightDark(
                  MediaQuery.platformBrightnessOf(context),
                ),
          ),
          const SizedBox(width: 8),
          FilledButton.icon(
            onPressed: () {
              if (!auth.isAuthenticated) {
                context.push('/login');
                return;
              }
              context.push('/settings');
            },
            style: FilledButton.styleFrom(
              minimumSize: const Size(0, 36),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              visualDensity: VisualDensity.compact,
              backgroundColor: dark ? Colors.white : AppColors.ink,
              foregroundColor: dark ? AppColors.ink : Colors.white,
            ),
            icon: Icon(
              connected
                  ? Icons.account_balance_wallet
                  : Icons.account_balance_wallet_outlined,
              size: 16,
            ),
            label: Text(
              !auth.isAuthenticated
                  ? 'Connect'
                  : connected
                      ? Formatters.shortAddress(user.walletAddress)
                      : 'Connected',
            ),
          ),
          const SizedBox(width: 8),
          _RoundIcon(
            tooltip: auth.isAuthenticated ? 'Profile' : 'Sign in',
            icon: Icons.person_outline,
            onTap: () {
              if (!auth.isAuthenticated) {
                context.push('/login');
                return;
              }
              context.push('/profile');
            },
          ),
          if (auth.isAuthenticated) ...[
            const SizedBox(width: 4),
            _RoundIcon(
              tooltip: 'Notifications',
              icon: Icons.notifications_outlined,
              onTap: () => context.push('/notifications'),
            ),
          ],
        ],
      ),
    );
  }
}

class _RoundIcon extends StatelessWidget {
  const _RoundIcon({
    required this.icon,
    required this.onTap,
    required this.tooltip,
  });

  final IconData icon;
  final VoidCallback onTap;
  final String tooltip;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Theme.of(context).colorScheme.surface,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: SizedBox(
            width: 38,
            height: 38,
            child: DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.8),
                ),
              ),
              child: Icon(icon, size: 20),
            ),
          ),
        ),
      ),
    );
  }
}

class _SupportFab extends StatelessWidget {
  const _SupportFab();

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        FloatingActionButton(
          onPressed: () {
            final auth = context.read<AuthProvider>();
            context.read<CopilotController>().openPanel(name: auth.user?.name);
          },
          tooltip: 'FundFlow Copilot',
          child: const Icon(Icons.auto_awesome),
        ),
        Positioned(
          top: 6,
          right: 6,
          child: Container(
            width: 11,
            height: 11,
            decoration: BoxDecoration(
              color: AppColors.emerald,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.ink, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}

class _FfBottomBar extends StatelessWidget {
  const _FfBottomBar({required this.index, required this.onSelect});

  final int index;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: scheme.surface,
      elevation: 16,
      shadowColor: Colors.black.withValues(alpha: 0.18),
      child: SafeArea(
        top: false,
        child: Container(
          height: 72,
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: scheme.outline.withValues(alpha: 0.7)),
            ),
          ),
          child: Row(
            children: [
              _NavItem(
                icon: Icons.home_outlined,
                selectedIcon: Icons.home_rounded,
                label: 'Home',
                selected: index == 0,
                onTap: () => onSelect(0),
              ),
              _NavItem(
                icon: Icons.explore_outlined,
                selectedIcon: Icons.explore,
                label: 'Campaigns',
                selected: index == 1,
                onTap: () => onSelect(1),
              ),
              Expanded(
                child: Center(
                  child: GestureDetector(
                    onTap: () => onSelect(2),
                    child: Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.white
                            : AppColors.ink,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.18),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.add,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? AppColors.ink
                            : Colors.white,
                        size: 28,
                      ),
                    ),
                  ),
                ),
              ),
              _NavItem(
                icon: Icons.query_stats_outlined,
                selectedIcon: Icons.query_stats,
                label: 'Dashboard',
                selected: index == 3,
                onTap: () => onSelect(3),
              ),
              _NavItem(
                icon: Icons.person_outline,
                selectedIcon: Icons.person,
                label: 'Profile',
                selected: index == 4,
                onTap: () => onSelect(4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final color = selected ? scheme.onSurface : scheme.onSurfaceVariant;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(selected ? selectedIcon : icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
