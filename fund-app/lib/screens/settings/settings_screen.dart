import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/validators.dart';
import '../../models/notification.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_controller.dart';
import '../../widgets/ui_kit.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final TextEditingController _name;
  late final TextEditingController _bio;
  late final TextEditingController _wallet;
  late final TextEditingController _apiUrl;
  late final TextEditingController _currentPassword;
  late final TextEditingController _newPassword;
  NotificationPreferences _prefs = const NotificationPreferences();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    final scope = context.read<AppScope>();
    _name = TextEditingController(text: user?.name ?? '');
    _bio = TextEditingController(text: user?.bio ?? '');
    _wallet = TextEditingController(text: user?.walletAddress ?? '');
    _apiUrl = TextEditingController(text: scope.api.raw.options.baseUrl);
    _currentPassword = TextEditingController();
    _newPassword = TextEditingController();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    try {
      final prefs = await context.read<AppScope>().notifications.preferences();
      if (!mounted) return;
      setState(() => _prefs = prefs);
    } catch (_) {}
  }

  @override
  void dispose() {
    _name.dispose();
    _bio.dispose();
    _wallet.dispose();
    _apiUrl.dispose();
    _currentPassword.dispose();
    _newPassword.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    final auth = context.read<AuthProvider>();
    final user = auth.user;
    if (user == null) return;
    setState(() => _saving = true);
    try {
      final updated = await context.read<AppScope>().users.update(user.id, {
        'name': _name.text.trim(),
        'bio': _bio.text.trim(),
        'walletAddress': _wallet.text.trim(),
      });
      await auth.setUser(updated);
      if (!mounted) return;
      showSnack(context, 'Profile updated');
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _changePassword() async {
    if (Validators.password(_currentPassword.text) != null ||
        Validators.password(_newPassword.text, min: 8) != null) {
      showSnack(
        context,
        'Enter current password and a new password (8+ chars)',
        error: true,
      );
      return;
    }
    try {
      await context.read<AppScope>().auth.changePassword(
            currentPassword: _currentPassword.text,
            newPassword: _newPassword.text,
          );
      _currentPassword.clear();
      _newPassword.clear();
      if (!mounted) return;
      showSnack(context, 'Password changed');
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  Future<void> _pickAvatar() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (picked == null || !mounted) return;
    final auth = context.read<AuthProvider>();
    final user = auth.user;
    if (user == null) return;
    try {
      final url =
          await context.read<AppScope>().campaigns.uploadImage(picked.path);
      if (url.isEmpty) return;
      final updated = await context.read<AppScope>().users.update(user.id, {
        'avatar': url,
      });
      await auth.setUser(updated);
      if (!mounted) return;
      showSnack(context, 'Avatar updated');
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  Future<void> _saveApiUrl() async {
    final url = AppConfig.normalize(_apiUrl.text);
    if (url.isEmpty) return;
    context.read<AppScope>().api.updateBaseUrl(url);
    await context.read<AppScope>().storage.saveApiBaseUrl(url);
    if (!mounted) return;
    showSnack(context, 'API URL saved. Restart the app if requests still fail.');
  }

  Future<void> _savePrefs(NotificationPreferences prefs) async {
    setState(() => _prefs = prefs);
    try {
      final saved =
          await context.read<AppScope>().notifications.updatePreferences(prefs);
      if (!mounted) return;
      setState(() => _prefs = saved);
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeController>();
    final user = context.watch<AuthProvider>().user;
    final scheme = Theme.of(context).colorScheme;

    return FfScaffold(
      title: 'Settings',
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          SettingsGroup(
            title: 'Account',
            subtitle: 'Public profile and wallet',
            icon: Icons.person_outline,
            children: [
              Center(
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 44,
                      backgroundColor: scheme.surfaceContainerHighest,
                      backgroundImage: user?.avatar != null &&
                              user!.avatar!.isNotEmpty
                          ? NetworkImage(user.avatar!)
                          : null,
                      child: user?.avatar == null || user!.avatar!.isEmpty
                          ? Text(
                              user?.initials ?? '?',
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 22,
                              ),
                            )
                          : null,
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Material(
                        color: AppColors.ink,
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          onTap: _pickAvatar,
                          child: const Padding(
                            padding: EdgeInsets.all(8),
                            child: Icon(
                              Icons.photo_camera_outlined,
                              size: 16,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _bio,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Bio'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _wallet,
                decoration: const InputDecoration(
                  labelText: 'Wallet address',
                  hintText: '0x…',
                  prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                ),
              ),
              const SizedBox(height: 14),
              FilledButton(
                onPressed: _saving ? null : _saveProfile,
                child: Text(_saving ? 'Saving…' : 'Save profile'),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SettingsGroup(
            title: 'Password',
            subtitle: 'Keep your account secure',
            icon: Icons.lock_outline,
            children: [
              TextField(
                controller: _currentPassword,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Current password'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _newPassword,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'New password'),
              ),
              const SizedBox(height: 14),
              OutlinedButton(
                onPressed: _changePassword,
                child: const Text('Change password'),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SettingsGroup(
            title: 'Notifications',
            subtitle: 'Choose what we send you',
            icon: Icons.notifications_outlined,
            children: [
              FfToggleTile(
                title: 'Email notifications',
                subtitle: 'Account activity and receipts',
                value: _prefs.emailNotifications,
                onChanged: (v) =>
                    _savePrefs(_prefs.copyWith(emailNotifications: v)),
              ),
              FfToggleTile(
                title: 'Campaign updates',
                subtitle: 'Creator posts and milestones',
                value: _prefs.campaignUpdates,
                onChanged: (v) =>
                    _savePrefs(_prefs.copyWith(campaignUpdates: v)),
              ),
              FfToggleTile(
                title: 'Funding alerts',
                subtitle: 'Pledges, refunds, and payouts',
                value: _prefs.fundingAlerts,
                onChanged: (v) =>
                    _savePrefs(_prefs.copyWith(fundingAlerts: v)),
              ),
              FfToggleTile(
                title: 'Marketing emails',
                subtitle: 'Product news and featured campaigns',
                value: _prefs.marketingEmails,
                onChanged: (v) =>
                    _savePrefs(_prefs.copyWith(marketingEmails: v)),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SettingsGroup(
            title: 'Appearance',
            subtitle: 'Light, dark, or match the system',
            icon: Icons.brightness_6_outlined,
            children: [
              Row(
                children: [
                  _ThemeChoice(
                    label: 'System',
                    icon: Icons.brightness_auto_outlined,
                    selected: theme.mode == ThemeMode.system,
                    onTap: () => theme.setMode(ThemeMode.system),
                  ),
                  const SizedBox(width: 8),
                  _ThemeChoice(
                    label: 'Light',
                    icon: Icons.light_mode_outlined,
                    selected: theme.mode == ThemeMode.light,
                    onTap: () => theme.setMode(ThemeMode.light),
                  ),
                  const SizedBox(width: 8),
                  _ThemeChoice(
                    label: 'Dark',
                    icon: Icons.dark_mode_outlined,
                    selected: theme.mode == ThemeMode.dark,
                    onTap: () => theme.setMode(ThemeMode.dark),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          SettingsGroup(
            title: 'API',
            subtitle: 'fund-server base URL',
            icon: Icons.cloud_outlined,
            children: [
              Text(
                'Default: ${AppConfig.defaultBaseUrl}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _apiUrl,
                decoration: const InputDecoration(
                  labelText: 'fund-server base URL',
                  hintText: 'http://192.168.1.10:3001/api/v1',
                ),
              ),
              const SizedBox(height: 14),
              OutlinedButton(
                onPressed: _saveApiUrl,
                child: const Text('Save API URL'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ThemeChoice extends StatelessWidget {
  const _ThemeChoice({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Expanded(
      child: Material(
        color: selected ? AppColors.ink : scheme.surfaceContainer,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Column(
              children: [
                Icon(
                  icon,
                  color: selected ? Colors.white : scheme.onSurface,
                ),
                const SizedBox(height: 6),
                Text(
                  label,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                    color: selected ? Colors.white : scheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
