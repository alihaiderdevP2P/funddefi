import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../models/campaign.dart';
import '../../models/funding.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/campaign_card.dart';
import '../../widgets/ui_kit.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _loading = true;
  String? _error;
  List<Campaign> _featured = const [];
  PlatformStats _stats = const PlatformStats();
  final _hero = PageController();
  int _heroPage = 0;

  static const _slides = [
    (
      'Crowdfunding without the middleman',
      'Launch your project on the blockchain with AI-powered insights. Transparent funding, instant payouts, and complete control over your campaign with smart contracts.',
    ),
    (
      'AI-powered campaign insight',
      'Autonomous optimization and deterministic risk auditing help backers fund with confidence — and help creators hit every milestone.',
    ),
    (
      'Global reach. Instant payouts.',
      'Accept pledges worldwide without intermediary conversion drag. Milestone releases go straight to your connected wallet.',
    ),
  ];

  static const _heroPhoto =
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=70';

  Timer? _autoplay;

  @override
  void initState() {
    super.initState();
    _load();
    _autoplay = Timer.periodic(const Duration(seconds: 6), (_) {
      if (!mounted || !_hero.hasClients) return;
      final next = (_heroPage + 1) % _slides.length;
      _hero.animateToPage(
        next,
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  void dispose() {
    _autoplay?.cancel();
    _hero.dispose();
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
        scope.campaigns.featured(),
        scope.funding.stats(),
      ]);
      if (!mounted) return;
      setState(() {
        _featured = results[0] as List<Campaign>;
        _stats = results[1] as PlatformStats;
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

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return RefreshIndicator(
      color: AppColors.emerald,
      onRefresh: _load,
      child: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 28),
          children: [
            _HeroCarousel(
              controller: _hero,
              page: _heroPage,
              slides: _slides,
              photoUrl: _heroPhoto,
              stats: _stats,
              authenticated: auth.isAuthenticated,
              onPage: (i) => setState(() => _heroPage = i),
            ),
            const SizedBox(height: 18),
            const _WhyChoose(),
            const SizedBox(height: 22),
            SectionHeader(
              title: 'Featured Campaigns',
              subtitle: 'Vetted high-impact initiatives',
              action: 'View All',
              onAction: () => context.go('/campaigns'),
            ),
            if (_featured.isEmpty)
              FfCard(
                child: Text(
                  'No featured campaigns yet. Browse all campaigns to find a project to back.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              )
            else
              ..._featured.asMap().entries.map(
                    (e) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: CampaignCard(
                        campaign: e.value,
                        featured: e.key == 0,
                      ),
                    ),
                  ),
            const SizedBox(height: 8),
            _LaunchCta(authenticated: auth.isAuthenticated),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _HeroCarousel extends StatelessWidget {
  const _HeroCarousel({
    required this.controller,
    required this.page,
    required this.slides,
    required this.photoUrl,
    required this.stats,
    required this.authenticated,
    required this.onPage,
  });

  final PageController controller;
  final int page;
  final List<(String, String)> slides;
  final String photoUrl;
  final PlatformStats stats;
  final bool authenticated;
  final ValueChanged<int> onPage;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: (MediaQuery.sizeOf(context).height * 0.58).clamp(460.0, 540.0),
      decoration: BoxDecoration(
        color: AppColors.ink,
        borderRadius: BorderRadius.circular(26),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.22),
            blurRadius: 28,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CachedNetworkImage(
            imageUrl: photoUrl,
            fit: BoxFit.cover,
            errorWidget: (_, __, ___) => const ColoredBox(color: AppColors.ink),
          ),
          DecoratedBox(
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.42),
            ),
          ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0x990A0A0A),
                  Color(0xCC0A0A0A),
                  Color(0xF20A0A0A),
                ],
              ),
            ),
          ),
          PageView.builder(
            controller: controller,
            onPageChanged: onPage,
            itemCount: slides.length,
            itemBuilder: (context, i) {
              final slide = slides[i];
              return Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 16),
                child: Column(
                  children: [
                    const PowerBadge(),
                    const SizedBox(height: 18),
                    Text(
                      slide.$1,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 28,
                        height: 1.12,
                        letterSpacing: -0.7,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      slide.$2,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Color(0xFFA7F3D0),
                        fontSize: 13.5,
                        height: 1.45,
                      ),
                    ),
                    const Spacer(),
                    FilledButton(
                      onPressed: () => context.go('/campaigns'),
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF111111),
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFF2A2A2A)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Explore Campaigns'),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward_rounded, size: 18),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    FilledButton(
                      onPressed: () => context.go(
                        authenticated ? '/create' : '/register',
                      ),
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF2A2A2A),
                        foregroundColor: Colors.white,
                      ),
                      child: Text(
                        authenticated
                            ? 'Start Your Campaign'
                            : 'Join FundFlow',
                      ),
                    ),
                    const SizedBox(height: 16),
                    _HeroStats(stats: stats),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const LivePulse(),
                        const SizedBox(width: 8),
                        Text(
                          'Live updates enabled',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.78),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(slides.length, (dot) {
                        final active = page == dot;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: active ? 16 : 7,
                          height: 7,
                          decoration: BoxDecoration(
                            color: active
                                ? Colors.white
                                : Colors.white.withValues(alpha: 0.35),
                            borderRadius: BorderRadius.circular(8),
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _HeroStats extends StatelessWidget {
  const _HeroStats({required this.stats});

  final PlatformStats stats;

  @override
  Widget build(BuildContext context) {
    final projects = stats.totalCampaigns == 0
        ? stats.activeCampaigns
        : stats.totalCampaigns;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          _stat(Formatters.compact(stats.totalAmount), 'Total Raised'),
          _divider(),
          _stat('$projects', 'Projects'),
          _divider(),
          _stat(Formatters.compact(stats.totalBackers), 'Backers'),
        ],
      ),
    );
  }

  Widget _stat(String value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: AppFonts.mono(
              size: 16,
              weight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.62),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() {
    return Container(
      width: 1,
      height: 28,
      color: Colors.white.withValues(alpha: 0.18),
    );
  }
}

class _WhyChoose extends StatelessWidget {
  const _WhyChoose();

  static const _items = [
    (
      Icons.shield_outlined,
      'Blockchain Security',
      'Funds locked in smart contracts with multisig verification.',
    ),
    (
      Icons.psychology_outlined,
      'AI Assistance',
      'Autonomous campaign optimization and deterministic risk auditing.',
    ),
    (
      Icons.public,
      'Global Reach',
      'Accept pledges worldwide without intermediary conversion drag.',
    ),
    (
      Icons.bolt_outlined,
      'Instant Payouts',
      'Milestone automated fund releases directly to your connected wallet.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        Text(
          'Why choose decentralized crowdfunding?',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
                letterSpacing: -0.35,
              ),
        ),
        const SizedBox(height: 6),
        Text(
          'Direct peer-to-peer funding powered by smart contract transparency.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: scheme.onSurfaceVariant,
              ),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _items.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            mainAxisExtent: 168,
          ),
          itemBuilder: (context, i) {
            final item = _items[i];
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: scheme.surfaceContainer,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FfIconBox(icon: item.$1),
                  const SizedBox(height: 12),
                  Text(
                    item.$2,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.$3,
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          height: 1.3,
                          fontSize: 11,
                          color: scheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class _LaunchCta extends StatelessWidget {
  const _LaunchCta({required this.authenticated});

  final bool authenticated;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(22, 28, 22, 22),
      decoration: BoxDecoration(
        color: scheme.surfaceContainer,
        borderRadius: BorderRadius.circular(26),
      ),
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: scheme.surface,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.rocket_launch_outlined, size: 26),
          ),
          const SizedBox(height: 14),
          Text(
            'Ready to launch?',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Turn your breakthrough idea into reality with zero platform middleman fees.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: scheme.onSurfaceVariant,
                  height: 1.4,
                ),
          ),
          const SizedBox(height: 18),
          FilledButton(
            onPressed: () =>
                context.go(authenticated ? '/create' : '/register'),
            child: Text(
              authenticated ? 'Start Your Campaign' : 'Create an account',
            ),
          ),
        ],
      ),
    );
  }
}
