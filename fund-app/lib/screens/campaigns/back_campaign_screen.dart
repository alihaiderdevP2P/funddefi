import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/utils/formatters.dart';
import '../../core/utils/validators.dart';
import '../../models/campaign.dart';
import '../../models/reward.dart';
import '../../providers/app_scope.dart';
import '../../widgets/ui_kit.dart';

class BackCampaignScreen extends StatefulWidget {
  const BackCampaignScreen({super.key, required this.id});

  final String id;

  @override
  State<BackCampaignScreen> createState() => _BackCampaignScreenState();
}

class _BackCampaignScreenState extends State<BackCampaignScreen> {
  Campaign? _campaign;
  Reward? _reward;
  final _amount = TextEditingController();
  final _message = TextEditingController();
  bool _loading = true;
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _amount.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final campaign =
          await context.read<AppScope>().campaigns.getById(widget.id);
      if (!mounted) return;
      setState(() {
        _campaign = campaign;
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

  void _selectReward(Reward? reward) {
    setState(() {
      _reward = reward;
      if (reward != null) {
        _amount.text = reward.minAmount.toString();
      }
    });
  }

  Future<void> _submit() async {
    final amountError = Validators.amount(_amount.text);
    if (amountError != null) {
      showSnack(context, amountError, error: true);
      return;
    }
    final amount = double.parse(_amount.text.trim());
    if (_reward != null && amount < _reward!.minAmount) {
      showSnack(
        context,
        'Amount must be at least ${Formatters.eth(_reward!.minAmount)}',
        error: true,
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      final hash =
          'mobile-${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}';
      await context.read<AppScope>().funding.create(
            campaignId: widget.id,
            amount: amount,
            transactionHash: hash,
            rewardId: _reward?.id,
            message: _message.text.trim(),
            status: 'confirmed',
          );
      if (!mounted) return;
      showSnack(context, 'Pledge recorded. Thank you for backing this project.');
      context.go('/campaigns/${widget.id}');
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: 'Back this project',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            FfCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _campaign?.title ?? '',
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  const Text('Choose a reward or enter a custom amount'),
                ],
              ),
            ),
            const SizedBox(height: 12),
            FfCard(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 12),
              child: Column(
                children: [
                  RadioListTile<Reward?>(
                    value: null,
                    groupValue: _reward,
                    onChanged: _selectReward,
                    title: const Text('Custom pledge (no reward)'),
                  ),
                  ...?_campaign?.rewards.map(
                    (r) => RadioListTile<Reward?>(
                      value: r,
                      groupValue: _reward,
                      onChanged: r.isSoldOut ? null : _selectReward,
                      title: Text('${r.title} · ${Formatters.eth(r.minAmount)}'),
                      subtitle: Text(r.description),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            FfCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: _amount,
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: 'Amount (ETH)'),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    children: [
                      for (final add in [0.05, 0.10, 0.50])
                        OutlinedButton(
                          onPressed: () {
                            final current =
                                double.tryParse(_amount.text.trim()) ?? 0;
                            _amount.text = (current + add)
                                .toStringAsFixed(2)
                                .replaceFirst(RegExp(r'\.00$'), '');
                          },
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 36),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            visualDensity: VisualDensity.compact,
                          ),
                          child: Text('+${add.toStringAsFixed(2)}'),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _message,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Message (optional)',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Row(
              children: [
                Icon(Icons.lock_outline, size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Funds held in audited multisig escrow. Automatic milestone release.',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _submitting ? null : _submit,
              child: _submitting
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Confirm pledge'),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_rounded, size: 18),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
