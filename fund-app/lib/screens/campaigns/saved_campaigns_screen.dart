import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/campaign.dart';
import '../../providers/app_scope.dart';
import '../../widgets/campaign_card.dart';
import '../../widgets/ui_kit.dart';

class SavedCampaignsScreen extends StatefulWidget {
  const SavedCampaignsScreen({super.key});

  @override
  State<SavedCampaignsScreen> createState() => _SavedCampaignsScreenState();
}

class _SavedCampaignsScreenState extends State<SavedCampaignsScreen> {
  bool _loading = true;
  String? _error;
  List<Campaign> _items = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await context.read<AppScope>().campaigns.saved();
      if (!mounted) return;
      setState(() {
        _items = items;
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
    return FfScaffold(
      title: 'Saved campaigns',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        empty: _items.isEmpty,
        emptyMessage: 'You have not saved any campaigns.',
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _items.length,
          itemBuilder: (_, i) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: CampaignCard(campaign: _items[i]),
          ),
        ),
      ),
    );
  }
}
