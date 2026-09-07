import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_theme.dart';
import '../core/utils/formatters.dart';
import '../models/campaign.dart';
import 'app_image.dart';
import 'ui_kit.dart';

class CampaignCard extends StatelessWidget {
  const CampaignCard({
    super.key,
    required this.campaign,
    this.featured = false,
  });

  final Campaign campaign;
  final bool featured;

  bool get _funded =>
      campaign.status == 'funded' || campaign.raisedAmount >= campaign.goalAmount;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final percent = Formatters.percent(campaign.raisedAmount, campaign.goalAmount);
    final ratio = campaign.goalAmount <= 0
        ? 0.0
        : campaign.raisedAmount / campaign.goalAmount;
    final creator = campaign.creator;

    return Container(
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(AppRadii.card),
        border: Border.all(color: scheme.outline.withValues(alpha: 0.8)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: Theme.of(context).brightness == Brightness.dark ? 0.28 : 0.06,
            ),
            blurRadius: 22,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.push('/campaigns/${campaign.id}'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Stack(
                    children: [
                      AppImage(
                        url: campaign.imageUrl,
                        height: 188,
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
                                Color(0x99000000),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Wrap(
                          spacing: 6,
                          children: [
                            if (featured)
                              const FfBadge(
                                label: 'Featured',
                                icon: Icons.star_rounded,
                                filled: true,
                              ),
                            FfBadge(
                              label: Formatters.categoryLabel(campaign.category),
                            ),
                          ],
                        ),
                      ),
                      Positioned(
                        top: 10,
                        right: 10,
                        child: _funded
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
                              ),
                      ),
                      Positioned(
                        left: 12,
                        right: 12,
                        bottom: 10,
                        child: Row(
                          children: [
                            Icon(
                              _funded ? Icons.bolt_rounded : Icons.hub_outlined,
                              size: 14,
                              color: AppColors.emerald,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                campaign.isActive
                                    ? 'Live on-chain'
                                    : Formatters.statusLabel(campaign.status),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppFonts.mono(
                                  size: 11,
                                  color: Colors.white,
                                  weight: FontWeight.w600,
                                ),
                              ),
                            ),
                            Text(
                              'ID: ${Formatters.campaignCode(campaign.id)}',
                              style: AppFonts.mono(
                                size: 11,
                                color: Colors.white.withValues(alpha: 0.9),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      campaign.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.2,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      campaign.summary.isNotEmpty
                          ? campaign.summary
                          : campaign.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: scheme.onSurfaceVariant,
                            height: 1.4,
                          ),
                    ),
                    const SizedBox(height: 12),
                    CreatorRow(
                      name: creator?.name ?? 'Creator',
                      initials: creator?.initials ?? '?',
                      avatarUrl: creator?.avatar,
                      verified: creator?.isVerified ?? false,
                      onTap: creator == null
                          ? null
                          : () => context.push('/users/${creator.id}'),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: scheme.surfaceContainer,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          Formatters.networkLabel(campaign.contractAddress),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: Text.rich(
                            TextSpan(
                              children: [
                                TextSpan(
                                  text: Formatters.eth(campaign.raisedAmount),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 16,
                                  ),
                                ),
                                TextSpan(
                                  text: ' / ${Formatters.eth(campaign.goalAmount)}',
                                  style: TextStyle(
                                    color: scheme.onSurfaceVariant,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Text(
                          '${Formatters.compact(campaign.backersCount)} backers',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _funded ? '$percent (Funded)' : percent,
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 12,
                            color: _funded ? AppColors.emerald : scheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    FfProgressBar(value: ratio > 1 ? 1 : campaign.progress),
                    const SizedBox(height: 14),
                    FilledButton(
                      onPressed: () =>
                          context.push('/campaigns/${campaign.id}'),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('View Campaign'),
                          SizedBox(width: 6),
                          Icon(Icons.arrow_forward_rounded, size: 18),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
