import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../widgets/ui_kit.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: 'About FundFlow',
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          const Center(child: FundFlowLogo()),
          const SizedBox(height: 16),
          FfCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Crowdfunding without the middleman',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'FundFlow is a blockchain crowdfunding platform. Creators launch campaigns, backers pledge funds, and the NestJS API records pledges, rewards, and campaign updates in PostgreSQL.',
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const FfCard(
            child: ListTile(
              leading: Icon(Icons.people_outline, color: AppColors.emerald),
              title: Text('Backers'),
              subtitle: Text(
                'Browse campaigns, pledge, and track backed projects.',
              ),
            ),
          ),
          const SizedBox(height: 10),
          const FfCard(
            child: ListTile(
              leading: Icon(Icons.rocket_launch_outlined, color: AppColors.emerald),
              title: Text('Creators'),
              subtitle: Text(
                'Create campaigns, add reward tiers, and post updates.',
              ),
            ),
          ),
          const SizedBox(height: 10),
          const FfCard(
            child: ListTile(
              leading: Icon(
                Icons.admin_panel_settings_outlined,
                color: AppColors.emerald,
              ),
              title: Text('Admins'),
              subtitle: Text(
                'Moderate campaigns, users, and platform reports.',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
