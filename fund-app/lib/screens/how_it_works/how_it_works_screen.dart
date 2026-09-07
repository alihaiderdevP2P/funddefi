import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../widgets/ui_kit.dart';

class HowItWorksScreen extends StatelessWidget {
  const HowItWorksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const steps = [
      (
        Icons.search_outlined,
        'Discover',
        'Browse featured and filtered campaigns from the FundFlow API.',
      ),
      (
        Icons.person_add_outlined,
        'Create an account',
        'Register with email and password. JWT auth is issued by fund-server.',
      ),
      (
        Icons.favorite_outline,
        'Back a project',
        'Choose a reward tier and record a pledge. The funding is stored with a transaction reference.',
      ),
      (
        Icons.rocket_launch_outlined,
        'Launch a campaign',
        'Set a goal, story, image, and rewards. Images upload through /upload/image.',
      ),
      (
        Icons.account_balance_wallet_outlined,
        'Refunds & withdrawals',
        'On-chain campaigns can refund if the goal is missed. The API tracks status: pending, confirmed, refunded.',
      ),
    ];
    return FfScaffold(
      title: 'How it works',
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        itemCount: steps.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) => FfCard(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                backgroundColor: AppColors.ink,
                foregroundColor: Colors.white,
                child: Text(
                  '${i + 1}',
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(steps[i].$1, size: 18),
                        const SizedBox(width: 6),
                        Text(
                          steps[i].$2,
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(steps[i].$3),
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
