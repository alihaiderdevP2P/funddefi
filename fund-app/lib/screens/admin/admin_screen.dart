import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/utils/formatters.dart';
import '../../models/admin.dart';
import '../../models/campaign.dart';
import '../../models/user.dart';
import '../../providers/app_scope.dart';
import '../../widgets/ui_kit.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  bool _loading = true;
  String? _error;
  AdminStats _stats = const AdminStats();
  List<ActivityItem> _activity = const [];
  List<Campaign> _campaigns = const [];
  List<User> _users = const [];
  List<ModerationReport> _reports = const [];

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final admin = context.read<AppScope>().admin;
      final results = await Future.wait([
        admin.stats(),
        admin.activity(),
        admin.campaigns(),
        admin.users(),
        admin.moderation(),
      ]);
      if (!mounted) return;
      setState(() {
        _stats = results[0] as AdminStats;
        _activity = results[1] as List<ActivityItem>;
        _campaigns = (results[2] as CampaignListResult).campaigns;
        _users = results[3] as List<User>;
        _reports = results[4] as List<ModerationReport>;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _setCampaignStatus(Campaign c, String status) async {
    try {
      await context.read<AppScope>().admin.updateCampaignStatus(c.id, status);
      await _load();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  Future<void> _toggleUser(User user, {bool? verified, bool? suspended}) async {
    try {
      await context.read<AppScope>().admin.updateUser(
            user.id,
            isVerified: verified,
            isSuspended: suspended,
          );
      await _load();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin'),
        bottom: TabBar(
          controller: _tabs,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Campaigns'),
            Tab(text: 'Users'),
            Tab(text: 'Moderation'),
          ],
        ),
      ),
      body: DotGridBackground(
        child: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: TabBarView(
          controller: _tabs,
          children: [
            ListView(
              padding: const EdgeInsets.all(12),
              children: [
                Row(
                  children: [
                    Expanded(
                      child: StatTile(
                        label: 'Users',
                        value: '${_stats.totalUsers}',
                      ),
                    ),
                    Expanded(
                      child: StatTile(
                        label: 'Active campaigns',
                        value: '${_stats.activeCampaigns}',
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Expanded(
                      child: StatTile(
                        label: 'Funding',
                        value: Formatters.eth(_stats.totalFunding),
                      ),
                    ),
                    Expanded(
                      child: StatTile(
                        label: 'Pending',
                        value: '${_stats.pendingApprovals}',
                      ),
                    ),
                  ],
                ),
                const SectionHeader(title: 'Recent activity'),
                ..._activity.map(
                  (a) => ListTile(
                    title: Text(a.action),
                    subtitle: Text(a.details ?? ''),
                    trailing: Text(Formatters.date(a.timestamp)),
                  ),
                ),
              ],
            ),
            ListView.builder(
              itemCount: _campaigns.length,
              itemBuilder: (_, i) {
                final c = _campaigns[i];
                return ListTile(
                  title: Text(c.title),
                  subtitle: Text('${c.status} · ${Formatters.eth(c.raisedAmount)}'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (v) => _setCampaignStatus(c, v),
                    itemBuilder: (_) => [
                      for (final s in CampaignConstants.statuses)
                        PopupMenuItem(value: s, child: Text('Set $s')),
                    ],
                  ),
                );
              },
            ),
            ListView.builder(
              itemCount: _users.length,
              itemBuilder: (_, i) {
                final u = _users[i];
                return ListTile(
                  title: Text(u.name),
                  subtitle: Text('${u.email} · ${u.role}'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (v) {
                      if (v == 'verify') {
                        _toggleUser(u, verified: true);
                      } else if (v == 'suspend') {
                        _toggleUser(u, suspended: true);
                      } else if (v == 'unsuspend') {
                        _toggleUser(u, suspended: false);
                      }
                    },
                    itemBuilder: (_) => const [
                      PopupMenuItem(value: 'verify', child: Text('Verify')),
                      PopupMenuItem(value: 'suspend', child: Text('Suspend')),
                      PopupMenuItem(
                        value: 'unsuspend',
                        child: Text('Unsuspend'),
                      ),
                    ],
                  ),
                );
              },
            ),
            ListView.builder(
              itemCount: _reports.length,
              itemBuilder: (_, i) {
                final r = _reports[i];
                return ListTile(
                  title: Text(r.campaignTitle),
                  subtitle: Text('${r.reason} · ${r.status}'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (v) async {
                      try {
                        await context
                            .read<AppScope>()
                            .admin
                            .moderationAction(r.id, v);
                        await _load();
                      } catch (e) {
                        if (!mounted) return;
                        showSnack(context, e.toString(), error: true);
                      }
                    },
                    itemBuilder: (_) => const [
                      PopupMenuItem(
                        value: 'investigate',
                        child: Text('Investigate'),
                      ),
                      PopupMenuItem(
                        value: 'cancel_campaign',
                        child: Text('Cancel campaign'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
        ),
      ),
    );
  }
}
