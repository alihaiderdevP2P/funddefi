import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../models/campaign.dart';
import '../../models/funding.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../providers/copilot_controller.dart';
import '../../widgets/app_image.dart';
import '../../widgets/campaign_card.dart';
import '../../widgets/ui_kit.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  bool _loading = true;
  String? _error;
  DashboardData _data = const DashboardData();
  List<Campaign> _created = const [];
  List<Funding> _backed = const [];
  int _range = 6;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    _tabs.addListener(() => setState(() {}));
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
      final scope = context.read<AppScope>();
      final results = await Future.wait([
        scope.funding.dashboard(),
        scope.campaigns.myCampaigns(),
        scope.funding.myFundings(),
      ]);
      if (!mounted) return;
      setState(() {
        _data = results[0] as DashboardData;
        _created = results[1] as List<Campaign>;
        _backed = results[2] as List<Funding>;
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

  Future<void> _changeStatus(Campaign campaign, String status) async {
    try {
      await context.read<AppScope>().campaigns.update(campaign.id, {
        'status': status,
      });
      await _load();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  Future<void> _delete(Campaign campaign) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete campaign?'),
        content: Text('This will remove "${campaign.title}".'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    try {
      await context.read<AppScope>().campaigns.delete(campaign.id);
      await _load();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  Campaign? get _activeCampaign {
    final active = _created.where((c) => c.isActive).toList();
    if (active.isNotEmpty) return active.first;
    return _created.isEmpty ? null : _created.first;
  }

  List<(String, double)> get _monthly {
    final now = DateTime.now();
    return List.generate(_range, (i) {
      final month = DateTime(now.year, now.month - (_range - 1 - i));
      final label = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ][month.month - 1];
      final total = _backed
          .where((f) =>
              f.createdAt != null &&
              f.createdAt!.year == month.year &&
              f.createdAt!.month == month.month)
          .fold<double>(0, (sum, f) => sum + f.amount);
      return (label, total);
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final summary = _data.summary;
    final scheme = Theme.of(context).colorScheme;

    return Column(
      children: [
        Expanded(
          child: AsyncBody(
            loading: _loading,
            error: _error,
            onRetry: _load,
            child: RefreshIndicator(
              color: AppColors.emerald,
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                children: [
                  if (user != null) _UserStrip(userName: user.name, wallet: user.walletAddress),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Text(
                        'Dashboard',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.4,
                            ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: scheme.surfaceContainer,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          DateTime.now().year.toString(),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _MetricCard(
                          label: 'Total Backed',
                          value: Formatters.eth(summary.totalBacked),
                          hint: '${summary.backedCampaignCount} campaigns',
                          icon: Icons.payments_outlined,
                          positive: true,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _MetricCard(
                          label: 'Campaigns',
                          value: '${summary.campaignsCreated}',
                          hint: '${summary.activeCampaigns} active now',
                          icon: Icons.campaign_outlined,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _MetricCard(
                          label: 'Active Backers',
                          value: '${summary.totalBackersOnCreated}',
                          hint: 'On your campaigns',
                          icon: Icons.people_outline,
                          positive: summary.totalBackersOnCreated > 0,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _MetricCard(
                          label: 'Success Rate',
                          value: Formatters.successRate(summary.backedSuccessRate),
                          hint: 'Backed campaigns',
                          icon: Icons.verified_outlined,
                          positive: true,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _DashTabs(
                    index: _tabs.index,
                    backed: _backed.length,
                    created: _created.length,
                    onSelect: (i) => _tabs.animateTo(i),
                  ),
                  const SizedBox(height: 14),
                  if (_tabs.index == 0) ..._overview(context),
                  if (_tabs.index == 1) ..._backedList(context),
                  if (_tabs.index == 2) ..._createdList(context),
                  if (_tabs.index == 3) ..._analytics(context),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  List<Widget> _overview(BuildContext context) {
    final months = _monthly;
    final total = months.fold<double>(0, (s, e) => s + e.$2);
    final active = _activeCampaign;
    final latest = _backed.isEmpty
        ? null
        : (_backed.toList()..sort((a, b) {
            final at = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
            final bt = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
            return bt.compareTo(at);
          })).first;

    return [
      _ChartCard(
        months: months,
        total: total,
        range: _range,
        onRange: (v) => setState(() => _range = v),
      ),
      const SizedBox(height: 12),
      _CopilotCard(campaign: active, backers: _data.summary.totalBackersOnCreated),
      const SizedBox(height: 16),
      Row(
        children: [
          Text(
            'Active Campaign',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const Spacer(),
          TextButton(
            onPressed: () => _tabs.animateTo(2),
            child: const Text('All projects >'),
          ),
        ],
      ),
      if (active == null)
        const FfCard(child: Text('You have not created a campaign yet.'))
      else
        _ActiveCampaignCard(
          campaign: active,
          onManage: () => context.push('/campaigns/${active.id}'),
          onAnalytics: () => _tabs.animateTo(3),
        ),
      const SizedBox(height: 16),
      Row(
        children: [
          Text(
            'Recent Backing',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const Spacer(),
          TextButton(
            onPressed: () => _tabs.animateTo(1),
            child: const Text('Live feed'),
          ),
        ],
      ),
      if (latest == null)
        const FfCard(child: Text('No pledges yet.'))
      else
        FfCard(
          onTap: latest.campaign?.id == null
              ? null
              : () => context.push('/campaigns/${latest.campaign!.id}'),
          child: Row(
            children: [
              const FfIconBox(icon: Icons.eco_outlined),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      latest.campaign?.title ?? 'Campaign',
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    Text(
                      'Pledged ${Formatters.eth(latest.amount)} · ${Formatters.relative(latest.createdAt)}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.emerald.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle, size: 14, color: AppColors.emerald),
                    SizedBox(width: 4),
                    Text(
                      'Verified',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.emerald,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
    ];
  }

  List<Widget> _backedList(BuildContext context) {
    if (_backed.isEmpty) {
      return const [
        FfCard(
          padding: EdgeInsets.fromLTRB(22, 28, 22, 22),
          child: Column(
            children: [
              FfIconBox(icon: Icons.favorite_outline, size: 52, iconSize: 26),
              SizedBox(height: 12),
              Text(
                'You have not backed a campaign yet.',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ];
    }
    return [
      for (final f in _backed)
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: FfCard(
            onTap: f.campaign?.id == null
                ? null
                : () => context.push('/campaigns/${f.campaign!.id}'),
            child: Row(
              children: [
                const FfIconBox(icon: Icons.favorite_outline),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        f.campaign?.title ?? 'Campaign',
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                      Text(
                        '${Formatters.eth(f.amount)} · ${f.status}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                Text(
                  Formatters.relative(f.createdAt),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ),
    ];
  }

  List<Widget> _createdList(BuildContext context) {
    if (_created.isEmpty) {
      return const [
        FfCard(
          padding: EdgeInsets.fromLTRB(22, 28, 22, 22),
          child: Column(
            children: [
              FfIconBox(icon: Icons.rocket_launch_outlined, size: 52, iconSize: 26),
              SizedBox(height: 12),
              Text(
                'You have not created a campaign yet.',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ];
    }
    return [
      for (final c in _created)
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(
            children: [
              CampaignCard(campaign: c),
              Align(
                alignment: Alignment.centerRight,
                child: PopupMenuButton<String>(
                  onSelected: (v) {
                    if (v == 'delete') {
                      _delete(c);
                    } else {
                      _changeStatus(c, v);
                    }
                  },
                  itemBuilder: (_) => const [
                    PopupMenuItem(value: 'active', child: Text('Set active')),
                    PopupMenuItem(value: 'cancelled', child: Text('Cancel')),
                    PopupMenuItem(value: 'delete', child: Text('Delete')),
                  ],
                ),
              ),
            ],
          ),
        ),
    ];
  }

  List<Widget> _analytics(BuildContext context) {
    final months = _monthly;
    final total = months.fold<double>(0, (s, e) => s + e.$2);
    return [
      _ChartCard(
        months: months,
        total: total,
        range: _range,
        onRange: (v) => setState(() => _range = v),
      ),
      const SizedBox(height: 12),
      const SectionHeader(title: 'Recent activity'),
      if (_data.recentActivity.isEmpty)
        const FfCard(child: Text('No recent activity yet.'))
      else
        FfCard(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            children: _data.recentActivity
                .map(
                  (a) => ListTile(
                    title: Text(
                      a.campaign,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      '${a.type}${a.amount != null ? ' · ${Formatters.eth(a.amount!)}' : ''}',
                    ),
                    trailing: Text(
                      Formatters.date(a.timestamp),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    onTap: a.campaignId == null
                        ? null
                        : () => context.push('/campaigns/${a.campaignId}'),
                  ),
                )
                .toList(),
          ),
        ),
    ];
  }
}

class _UserStrip extends StatelessWidget {
  const _UserStrip({required this.userName, required this.wallet});

  final String userName;
  final String? wallet;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return FfCard(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  userName,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        Formatters.shortAddress(wallet),
                        style: AppFonts.mono(size: 11),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        Formatters.networkLabel(wallet),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          OutlinedButton.icon(
            onPressed: () => context.push('/settings'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(0, 36),
              visualDensity: VisualDensity.compact,
            ),
            icon: const Icon(Icons.sync, size: 16),
            label: const Text('Synced'),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.hint,
    required this.icon,
    this.positive = false,
  });

  final String label;
  final String value;
  final String hint;
  final IconData icon;
  final bool positive;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return FfCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
              Icon(icon, size: 18, color: AppColors.emerald),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppFonts.mono(size: 18, weight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(
            hint,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: positive ? AppColors.emerald : scheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

class _DashTabs extends StatelessWidget {
  const _DashTabs({
    required this.index,
    required this.backed,
    required this.created,
    required this.onSelect,
  });

  final int index;
  final int backed;
  final int created;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    final labels = [
      'Overview',
      'Backed ($backed)',
      'Created ($created)',
      'Analytics',
    ];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var i = 0; i < labels.length; i++)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Material(
                color: index == i
                    ? Theme.of(context).colorScheme.surfaceContainer
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(22),
                child: InkWell(
                  onTap: () => onSelect(i),
                  borderRadius: BorderRadius.circular(22),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                    child: Text(
                      labels[i],
                      style: TextStyle(
                        fontWeight: index == i ? FontWeight.w800 : FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ChartCard extends StatelessWidget {
  const _ChartCard({
    required this.months,
    required this.total,
    required this.range,
    required this.onRange,
  });

  final List<(String, double)> months;
  final double total;
  final int range;
  final ValueChanged<int> onRange;

  @override
  Widget build(BuildContext context) {
    return FfCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Funding Activity',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                    ),
                    Text(
                      'Last $range Months · ${Formatters.eth(total)} Total',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              PopupMenuButton<int>(
                onSelected: onRange,
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 3, child: Text('3 Mo')),
                  PopupMenuItem(value: 6, child: Text('6 Mo')),
                  PopupMenuItem(value: 12, child: Text('12 Mo')),
                ],
                child: Padding(
                  padding: const EdgeInsets.all(6),
                  child: Row(
                    children: [
                      Text('$range Mo', style: const TextStyle(fontWeight: FontWeight.w700)),
                      const Icon(Icons.expand_more, size: 18),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 140,
            child: _BarChart(months: months),
          ),
        ],
      ),
    );
  }
}

class _BarChart extends StatelessWidget {
  const _BarChart({required this.months});

  final List<(String, double)> months;

  @override
  Widget build(BuildContext context) {
    final max = months.fold<double>(0, (s, e) => e.$2 > s ? e.$2 : s);
    final scale = max <= 0 ? 1.0 : max;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        for (var i = 0; i < months.length; i++)
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (months[i].$2 > 0)
                    Text(
                      months[i].$2.toStringAsFixed(months[i].$2 >= 1 ? 1 : 2),
                      style: AppFonts.mono(size: 9, weight: FontWeight.w700),
                    ),
                  const SizedBox(height: 4),
                  Align(
                    alignment: Alignment.bottomCenter,
                    child: Container(
                      height: 18 + (78 * (months[i].$2 / scale).clamp(0, 1)),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: i == months.length - 1
                            ? AppColors.emerald
                            : i == months.length - 2
                                ? AppColors.ink
                                : Theme.of(context).colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    months[i].$1,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _CopilotCard extends StatelessWidget {
  const _CopilotCard({required this.campaign, required this.backers});

  final Campaign? campaign;
  final int backers;

  @override
  Widget build(BuildContext context) {
    final title = campaign?.title ?? 'your next campaign';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome, size: 18, color: AppColors.emerald),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'FundFlow Copilot',
                  style: TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'INSIGHTS',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            campaign == null
                ? 'Launch a campaign to unlock live backer-velocity insights and AI milestone drafts.'
                : 'Backer velocity on $title is tracking with $backers on-chain supporters. Schedule a campaign milestone dispatch for optimal reach.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () {
              final copilot = context.read<CopilotController>();
              final scope = context.read<AppScope>();
              final auth = context.read<AuthProvider>();
              if (campaign == null) {
                copilot.ask(scope, auth, 'How do I create a campaign?');
                return;
              }
              copilot.ask(
                scope,
                auth,
                'Draft a campaign update for ${campaign!.title}',
              );
            },
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Draft Update with AI'),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward_rounded, size: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActiveCampaignCard extends StatelessWidget {
  const _ActiveCampaignCard({
    required this.campaign,
    required this.onManage,
    required this.onAnalytics,
  });

  final Campaign campaign;
  final VoidCallback onManage;
  final VoidCallback onAnalytics;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final percent = Formatters.percent(campaign.raisedAmount, campaign.goalAmount);
    return FfCard(
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: AppImage(
                  url: campaign.imageUrl,
                  width: 64,
                  height: 64,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        FfBadge(label: Formatters.categoryLabel(campaign.category).toUpperCase()),
                        FfBadge(
                          label: Formatters.daysLeftShort(campaign.endDate),
                          icon: Icons.schedule,
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      campaign.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    Text(
                      'by ${campaign.creator?.name ?? 'You'} (Creator)',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  '${Formatters.eth(campaign.raisedAmount)} of ${Formatters.eth(campaign.goalAmount)}',
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              Text(percent, style: const TextStyle(fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 8),
          FfProgressBar(value: campaign.progress),
          const SizedBox(height: 8),
          Row(
            children: [
              Text('${Formatters.compact(campaign.backersCount)} Backers'),
              const Spacer(),
              Text(
                'Target: ${Formatters.eth(campaign.goalAmount)}',
                style: TextStyle(color: scheme.onSurfaceVariant),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onAnalytics,
                  icon: const Icon(Icons.query_stats, size: 16),
                  label: const Text('Analytics'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton(
                  onPressed: onManage,
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Manage'),
                      SizedBox(width: 4),
                      Icon(Icons.arrow_forward_rounded, size: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
