import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../models/campaign.dart';
import '../../providers/app_scope.dart';
import '../../widgets/campaign_card.dart';
import '../../widgets/ui_kit.dart';

class CampaignsScreen extends StatefulWidget {
  const CampaignsScreen({super.key});

  @override
  State<CampaignsScreen> createState() => _CampaignsScreenState();
}

class _CampaignsScreenState extends State<CampaignsScreen> {
  final _search = TextEditingController();
  String? _category;
  String? _status = 'active';
  String _sort = 'recent';
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;
  List<Campaign> _items = const [];
  int _total = 0;
  int _page = 1;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load({bool more = false}) async {
    if (more) {
      if (_loadingMore || _items.length >= _total) return;
      setState(() => _loadingMore = true);
    } else {
      setState(() {
        _loading = true;
        _error = null;
        _page = 1;
      });
    }
    try {
      final page = more ? _page + 1 : 1;
      final result = await context.read<AppScope>().campaigns.list(
            status: _status,
            category: _category,
            search: _search.text.trim(),
            page: page,
            limit: 12,
          );
      if (!mounted) return;
      setState(() {
        _page = page;
        _total = result.total;
        _items = more ? [..._items, ...result.campaigns] : result.campaigns;
        _loading = false;
        _loadingMore = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
        _loadingMore = false;
      });
    }
  }

  List<Campaign> get _sorted {
    final copy = [..._items];
    switch (_sort) {
      case 'funded':
        copy.sort((a, b) => b.raisedAmount.compareTo(a.raisedAmount));
      case 'ending':
        copy.sort((a, b) {
          final ae = a.endDate ?? DateTime.now().add(const Duration(days: 999));
          final be = b.endDate ?? DateTime.now().add(const Duration(days: 999));
          return ae.compareTo(be);
        });
      default:
        copy.sort((a, b) {
          final ac = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
          final bc = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
          return bc.compareTo(ac);
        });
    }
    return copy;
  }

  Future<void> _openFilters() async {
    final scheme = Theme.of(context).colorScheme;
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Status',
                style: Theme.of(ctx).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final s in [null, ...CampaignConstants.statuses])
                    ChoiceChip(
                      label: Text(s == null ? 'Any status' : s),
                      selected: _status == s,
                      onSelected: (_) {
                        setState(() => _status = s);
                        Navigator.pop(ctx);
                        _load();
                      },
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Filters apply to the live campaign list.',
                style: TextStyle(color: scheme.onSurfaceVariant, fontSize: 12),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final sorted = _sorted;
    final liveCount = _status == 'active' ? _total : sorted.where((c) => c.isActive).length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 16, 12, 16),
            decoration: BoxDecoration(
              color: scheme.surfaceContainer,
              borderRadius: BorderRadius.circular(22),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 8,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(
                            'Discover Campaigns',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.4,
                                ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: scheme.surface,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'Web3',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Explore innovative projects from creators around the world.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: scheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => context.push('/notifications'),
                  icon: const Icon(Icons.notifications_outlined),
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: TextField(
            controller: _search,
            decoration: InputDecoration(
              hintText: 'Search campaigns, tags, creators...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(
                onPressed: _openFilters,
                icon: const Icon(Icons.tune_rounded),
              ),
            ),
            onSubmitted: (_) => _load(),
          ),
        ),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              _CategoryPill(
                label: _total > 0 ? 'All ($_total)' : 'All',
                selected: _category == null,
                onTap: () {
                  setState(() => _category = null);
                  _load();
                },
              ),
              ...CampaignConstants.categories.map(
                (c) => _CategoryPill(
                  label: c[0].toUpperCase() + c.substring(1),
                  selected: _category == c,
                  onTap: () {
                    setState(() => _category = c);
                    _load();
                  },
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 8, 4),
          child: Row(
            children: [
              const LivePulse(),
              const SizedBox(width: 8),
              Text(
                '$liveCount live campaigns',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                  color: scheme.onSurface,
                ),
              ),
              const Spacer(),
              PopupMenuButton<String>(
                initialValue: _sort,
                onSelected: (v) => setState(() => _sort = v),
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'recent', child: Text('Most Recent')),
                  PopupMenuItem(value: 'funded', child: Text('Most Funded')),
                  PopupMenuItem(value: 'ending', child: Text('Ending Soon')),
                ],
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  child: Row(
                    children: [
                      const Icon(Icons.swap_vert_rounded, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        switch (_sort) {
                          'funded' => 'Most Funded',
                          'ending' => 'Ending Soon',
                          _ => 'Most Recent',
                        },
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      const Icon(Icons.expand_more_rounded, size: 18),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            color: AppColors.emerald,
            onRefresh: _load,
            child: AsyncBody(
              loading: _loading,
              error: _error,
              onRetry: _load,
              empty: sorted.isEmpty,
              emptyMessage: 'No campaigns match your filters.',
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                itemCount: sorted.length + 1,
                itemBuilder: (_, i) {
                  if (i == sorted.length) {
                    return Padding(
                      padding: const EdgeInsets.only(top: 4, bottom: 12),
                      child: Column(
                        children: [
                          if (_items.length < _total)
                            OutlinedButton.icon(
                              onPressed: _loadingMore
                                  ? null
                                  : () => _load(more: true),
                              icon: _loadingMore
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.sync_rounded),
                              label: Text(
                                _loadingMore ? 'Loading…' : 'Load More Campaigns',
                              ),
                            )
                          else
                            const SizedBox.shrink(),
                          const SizedBox(height: 8),
                          Text(
                            'Showing ${sorted.length} of $_total verified decentralized projects',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    );
                  }
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: CampaignCard(
                      campaign: sorted[i],
                      featured: i == 0,
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _CategoryPill extends StatelessWidget {
  const _CategoryPill({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Material(
        color: selected ? AppColors.ink : Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(22),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(22),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(22),
              border: selected
                  ? null
                  : Border.all(
                      color: Theme.of(context).colorScheme.outline,
                    ),
            ),
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: selected
                    ? Colors.white
                    : Theme.of(context).colorScheme.onSurface,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
