import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/utils/validators.dart';
import '../../models/campaign.dart';
import '../../models/funding.dart';
import '../../models/reward.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_image.dart';
import '../../widgets/ui_kit.dart';

class CampaignDetailScreen extends StatefulWidget {
  const CampaignDetailScreen({super.key, required this.id});

  final String id;

  @override
  State<CampaignDetailScreen> createState() => _CampaignDetailScreenState();
}

class _CampaignDetailScreenState extends State<CampaignDetailScreen>
    with SingleTickerProviderStateMixin {
  bool _loading = true;
  String? _error;
  Campaign? _campaign;
  List<CampaignUpdate> _updates = const [];
  List<Funding> _backers = const [];
  bool _saved = false;
  late final TabController _tabs;

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
      final scope = context.read<AppScope>();
      final auth = context.read<AuthProvider>();
      final campaign = await scope.campaigns.getById(widget.id);
      final updates = await scope.campaigns.updates(widget.id);
      final backers = await scope.funding.byCampaign(widget.id);
      var saved = false;
      if (auth.isAuthenticated) {
        try {
          saved = await scope.campaigns.saveStatus(widget.id);
        } catch (_) {}
      }
      if (!mounted) return;
      setState(() {
        _campaign = campaign;
        _updates = updates;
        _backers = backers;
        _saved = saved;
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

  Future<void> _toggleSave() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      context.push('/login');
      return;
    }
    try {
      final campaigns = context.read<AppScope>().campaigns;
      if (_saved) {
        await campaigns.unsave(widget.id);
      } else {
        await campaigns.save(widget.id);
      }
      if (!mounted) return;
      setState(() => _saved = !_saved);
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  Future<void> _share() async {
    await Clipboard.setData(ClipboardData(text: 'FundFlow campaign: ${widget.id}'));
    if (!mounted) return;
    showSnack(context, 'Campaign link copied');
  }

  Future<void> _postUpdate() async {
    final title = TextEditingController();
    final content = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Post update'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: title,
              decoration: const InputDecoration(labelText: 'Title'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: content,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Content'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Publish'),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    if (Validators.required(title.text) != null || content.text.trim().length < 10) {
      showSnack(context, 'Title and a longer update are required', error: true);
      return;
    }
    try {
      await context.read<AppScope>().campaigns.createUpdate(
            widget.id,
            title: title.text.trim(),
            content: content.text.trim(),
          );
      await _load();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  void _back() {
    final campaign = _campaign;
    if (campaign == null || campaign.isEnded) return;
    if (!context.read<AuthProvider>().isAuthenticated) {
      context.push('/login');
      return;
    }
    context.push('/campaigns/${campaign.id}/back');
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final campaign = _campaign;
    final isCreator = user != null &&
        campaign != null &&
        (campaign.creatorId == user.id || campaign.creator?.id == user.id);
    final funded = campaign != null &&
        (campaign.status == 'funded' ||
            campaign.raisedAmount >= campaign.goalAmount);

    return FfScaffold(
      title: 'Campaigns',
      actions: [
        IconButton(
          onPressed: _toggleSave,
          icon: Icon(_saved ? Icons.favorite : Icons.favorite_border),
        ),
        IconButton(
          onPressed: _share,
          icon: const Icon(Icons.ios_share_rounded),
        ),
      ],
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: campaign == null
            ? const SizedBox.shrink()
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: Stack(
                      children: [
                        AppImage(
                          url: campaign.imageUrl,
                          height: 230,
                          width: double.infinity,
                          borderRadius: BorderRadius.zero,
                        ),
                        const Positioned.fill(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Color(0x33000000),
                                  Color(0x00000000),
                                  Color(0x66000000),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 14,
                          left: 14,
                          child: Wrap(
                            spacing: 6,
                            children: [
                              FfBadge(
                                label: Formatters.categoryLabel(campaign.category),
                              ),
                              const FfBadge(
                                label: 'Global',
                                icon: Icons.public,
                              ),
                            ],
                          ),
                        ),
                        Positioned(
                          top: 14,
                          right: 14,
                          child: funded
                              ? const FfBadge(
                                  label: 'Funded',
                                  icon: Icons.check_circle,
                                  filled: true,
                                  color: AppColors.emerald,
                                  foreground: Colors.white,
                                )
                              : FfBadge(
                                  label: Formatters.daysLeftShort(campaign.endDate),
                                  icon: Icons.schedule,
                                  filled: true,
                                ),
                        ),
                        Positioned(
                          right: 14,
                          bottom: 14,
                          child: FfBadge(
                            label: Formatters.networkLabel(campaign.contractAddress),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    campaign.title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.4,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    campaign.summary.isNotEmpty
                        ? campaign.summary
                        : campaign.description,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          height: 1.45,
                        ),
                  ),
                  const SizedBox(height: 14),
                  if (campaign.creator != null)
                    FfCard(
                      padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                      onTap: () =>
                          context.push('/users/${campaign.creator!.id}'),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundImage: campaign.creator!.avatar != null &&
                                    campaign.creator!.avatar!.isNotEmpty
                                ? NetworkImage(campaign.creator!.avatar!)
                                : null,
                            child: campaign.creator!.avatar == null ||
                                    campaign.creator!.avatar!.isEmpty
                                ? Text(campaign.creator!.initials)
                                : null,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        campaign.creator!.name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                    if (campaign.creator!.isVerified) ...[
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
                                  campaign.creator!.bio?.isNotEmpty == true
                                      ? campaign.creator!.bio!
                                      : 'Creator on FundFlow',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                          OutlinedButton(
                            onPressed: () =>
                                context.push('/users/${campaign.creator!.id}'),
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(0, 36),
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              visualDensity: VisualDensity.compact,
                            ),
                            child: const Text('Follow'),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 16),
                  _PillTabs(
                    controller: _tabs,
                    labels: [
                      'Story',
                      'Updates (${_updates.length})',
                      'Rewards (${campaign.rewards.length})',
                      'Backers (${_backers.length})',
                    ],
                  ),
                  const SizedBox(height: 14),
                  AnimatedBuilder(
                    animation: _tabs,
                    builder: (context, _) {
                      return switch (_tabs.index) {
                        1 => _UpdatesTab(
                            updates: _updates,
                            isCreator: isCreator,
                            onPost: _postUpdate,
                          ),
                        2 => _RewardsTab(rewards: campaign.rewards),
                        3 => _BackersTab(backers: _backers),
                        _ => _StoryTab(campaign: campaign),
                      };
                    },
                  ),
                  const SizedBox(height: 18),
                  _FundingFooter(
                    campaign: campaign,
                    funded: funded,
                    onBack: campaign.isEnded ? null : _back,
                  ),
                ],
              ),
      ),
    );
  }
}

class _PillTabs extends StatelessWidget {
  const _PillTabs({required this.controller, required this.labels});

  final TabController controller;
  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (var i = 0; i < labels.length; i++)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: Material(
                    color: controller.index == i
                        ? AppColors.ink
                        : Theme.of(context).colorScheme.surfaceContainer,
                    borderRadius: BorderRadius.circular(22),
                    child: InkWell(
                      onTap: () => controller.animateTo(i),
                      borderRadius: BorderRadius.circular(22),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 9,
                        ),
                        child: Text(
                          labels[i],
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: controller.index == i
                                ? Colors.white
                                : Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _StoryTab extends StatelessWidget {
  const _StoryTab({required this.campaign});

  final Campaign campaign;

  @override
  Widget build(BuildContext context) {
    final published = campaign.status != 'draft';
    final funding = campaign.isActive;
    final goalHit =
        campaign.status == 'funded' || campaign.raisedAmount >= campaign.goalAmount;
    final payout = campaign.status == 'funded';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'About the Project',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          campaign.description.isNotEmpty
              ? campaign.description
              : campaign.summary,
          style: const TextStyle(height: 1.5),
        ),
        if (campaign.imageUrl != null && campaign.imageUrl!.isNotEmpty) ...[
          const SizedBox(height: 14),
          AppImage(
            url: campaign.imageUrl,
            height: 180,
            width: double.infinity,
            borderRadius: BorderRadius.circular(18),
          ),
          const SizedBox(height: 6),
          Text(
            'Campaign cover · ${Formatters.networkLabel(campaign.contractAddress)} escrow',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
        if (campaign.contractAddress != null &&
            campaign.contractAddress!.isNotEmpty)
          TextButton.icon(
            onPressed: () {
              final url = Uri.parse(
                'https://sepolia.etherscan.io/address/${campaign.contractAddress}',
              );
              launchUrl(url, mode: LaunchMode.externalApplication);
            },
            icon: const Icon(Icons.open_in_new),
            label: Text(
              'Contract ${Formatters.shortAddress(campaign.contractAddress)}',
            ),
          ),
        const SizedBox(height: 18),
        FfCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'Milestone Roadmap',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceContainer,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      Formatters.statusLabel(campaign.status),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _Milestone(
                title: 'Campaign published',
                detail: 'Story, cover, and reward tiers live on FundFlow.',
                done: published,
                current: !published,
              ),
              _Milestone(
                title: 'Funding in progress',
                detail: 'Pledges collected into campaign escrow.',
                done: goalHit,
                current: funding && !goalHit,
              ),
              _Milestone(
                title: 'Goal reached',
                detail: 'Smart-contract threshold met for milestone release.',
                done: goalHit,
                current: false,
              ),
              _Milestone(
                title: 'Payout / escrow release',
                detail: 'Funds move to the creator wallet after approval.',
                done: payout,
                current: false,
                last: true,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Milestone extends StatelessWidget {
  const _Milestone({
    required this.title,
    required this.detail,
    required this.done,
    required this.current,
    this.last = false,
  });

  final String title;
  final String detail;
  final bool done;
  final bool current;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: EdgeInsets.only(bottom: last ? 0 : 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: done
                  ? AppColors.emerald
                  : current
                      ? AppColors.ink
                      : scheme.surfaceContainerHighest,
              shape: BoxShape.circle,
            ),
            child: Icon(
              done ? Icons.check : Icons.circle,
              size: done ? 14 : 8,
              color: done || current ? Colors.white : scheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                    ),
                    if (current) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: scheme.surfaceContainer,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'In Progress',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  detail,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _UpdatesTab extends StatelessWidget {
  const _UpdatesTab({
    required this.updates,
    required this.isCreator,
    required this.onPost,
  });

  final List<CampaignUpdate> updates;
  final bool isCreator;
  final VoidCallback onPost;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Updates',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const Spacer(),
            if (isCreator)
              TextButton(onPressed: onPost, child: const Text('Post update')),
          ],
        ),
        if (updates.isEmpty)
          const FfCard(child: Text('No updates yet.'))
        else
          ...updates.map(
            (u) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: FfCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      u.title,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 6),
                    Text(u.content),
                    const SizedBox(height: 8),
                    Text(
                      Formatters.dateTime(u.createdAt),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _RewardsTab extends StatelessWidget {
  const _RewardsTab({required this.rewards});

  final List<Reward> rewards;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Available Rewards',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const Spacer(),
            Text(
              '${rewards.length} tier${rewards.length == 1 ? '' : 's'} available',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (rewards.isEmpty)
          const FfCard(child: Text('No reward tiers yet.'))
        else
          ...rewards.asMap().entries.map((e) {
            final r = e.value;
            final popular = e.key == 0 && rewards.length > 1;
            final left = r.maxBackers == null
                ? null
                : '${(r.maxBackers! - r.currentBackers).clamp(0, r.maxBackers!)} / ${r.maxBackers} left';
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.8),
                  ),
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  r.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                              if (popular)
                                Container(
                                  margin: const EdgeInsets.only(right: 6),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFEDD5),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text(
                                    'POPULAR',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFFC2410C),
                                    ),
                                  ),
                                ),
                              if (left != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Theme.of(context)
                                        .colorScheme
                                        .surfaceContainer,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    r.isSoldOut ? 'Sold out' : left,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            Formatters.eth(r.minAmount),
                            style: AppFonts.mono(size: 22, weight: FontWeight.w800),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            r.description,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: double.infinity,
                      color: Theme.of(context).colorScheme.surfaceContainer,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      child: Row(
                        children: [
                          const Text('Estimated delivery'),
                          const Spacer(),
                          Text(
                            Formatters.monthYear(r.deliveryDate),
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }
}

class _BackersTab extends StatelessWidget {
  const _BackersTab({required this.backers});

  final List<Funding> backers;

  @override
  Widget build(BuildContext context) {
    if (backers.isEmpty) {
      return const FfCard(child: Text('Be the first to back this project.'));
    }
    return Column(
      children: backers.take(20).map((f) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: FfCard(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(child: Text(f.user?.initials ?? '?')),
              title: Text(f.user?.name ?? 'Backer'),
              subtitle: Text(Formatters.eth(f.amount)),
              trailing: StatusChip(label: f.status),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _FundingFooter extends StatelessWidget {
  const _FundingFooter({
    required this.campaign,
    required this.funded,
    required this.onBack,
  });

  final Campaign campaign;
  final bool funded;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final percent = Formatters.percent(campaign.raisedAmount, campaign.goalAmount);
    return FfCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FfProgressBar(
            value: campaign.goalAmount <= 0
                ? 0
                : (campaign.raisedAmount / campaign.goalAmount).clamp(0, 1),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Text(
                  '${Formatters.eth(campaign.raisedAmount)} pledged of ${Formatters.eth(campaign.goalAmount)}',
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              Text(
                funded ? '$percent (Funded)' : percent,
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: funded ? AppColors.emerald : scheme.onSurface,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Text('${Formatters.compact(campaign.backersCount)} backers'),
              const Spacer(),
              Text(Formatters.daysLeft(campaign.endDate)),
            ],
          ),
          const SizedBox(height: 14),
          FilledButton(
            onPressed: onBack,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(onBack == null ? 'Campaign ended' : 'Back this project'),
                if (onBack != null) ...[
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_rounded, size: 18),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(Icons.lock_outline, size: 14, color: scheme.onSurfaceVariant),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Funds held in audited multisig escrow. Automatic milestone release.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
