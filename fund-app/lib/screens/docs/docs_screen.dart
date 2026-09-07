import 'package:flutter/material.dart';

import '../../widgets/ui_kit.dart';

class DocsScreen extends StatelessWidget {
  const DocsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: 'Docs',
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          FfCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: FfIconBox(icon: Icons.api_outlined),
              title: Text('API'),
              subtitle: Text(
                'The app talks to fund-server at /api/v1. Auth uses Bearer JWT from POST /auth/login.',
              ),
            ),
          ),
          SizedBox(height: 10),
          FfCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: FfIconBox(icon: Icons.campaign_outlined),
              title: Text('Campaigns'),
              subtitle: Text(
                'GET /campaigns, GET /campaigns/:id, POST /campaigns, PATCH /campaigns/:id.',
              ),
            ),
          ),
          SizedBox(height: 10),
          FfCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: FfIconBox(icon: Icons.payments_outlined),
              title: Text('Funding'),
              subtitle: Text(
                'POST /funding records a pledge. GET /funding/stats returns platform totals.',
              ),
            ),
          ),
          SizedBox(height: 10),
          FfCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: FfIconBox(icon: Icons.cloud_upload_outlined),
              title: Text('Uploads'),
              subtitle: Text(
                'POST /upload/image sends multipart file and returns a public URL.',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
