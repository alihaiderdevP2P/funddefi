import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/validators.dart';
import '../../models/campaign.dart';
import '../../models/reward.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../providers/copilot_controller.dart';
import '../../widgets/app_image.dart';
import '../../widgets/ui_kit.dart';

class CreateCampaignScreen extends StatefulWidget {
  const CreateCampaignScreen({super.key});

  @override
  State<CreateCampaignScreen> createState() => _CreateCampaignScreenState();
}

class _CreateCampaignScreenState extends State<CreateCampaignScreen> {
  final _page = PageController();
  int _step = 0;
  final _title = TextEditingController();
  final _summary = TextEditingController();
  final _description = TextEditingController();
  final _location = TextEditingController();
  final _goal = TextEditingController(text: '1');
  String _category = CampaignConstants.categories.first;
  DateTime _endDate = DateTime.now().add(const Duration(days: 30));
  String? _imageUrl;
  bool _uploading = false;
  bool _submitting = false;
  final List<RewardDraft> _rewards = [];

  static const _steps = ['Basics', 'Funding', 'Story', 'Rewards', 'Review'];

  @override
  void initState() {
    super.initState();
    _title.addListener(() => setState(() {}));
    _summary.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _page.dispose();
    _title.dispose();
    _summary.dispose();
    _description.dispose();
    _location.dispose();
    _goal.dispose();
    super.dispose();
  }

  void _go(int step) {
    setState(() => _step = step);
    _page.animateToPage(
      step,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  void _autoSuggest() {
    setState(() {
      if (_title.text.trim().isEmpty) {
        _title.text = 'AeroGrid: Community Solar Mesh';
      }
      if (_summary.text.trim().isEmpty) {
        _summary.text =
            'A clear, compelling 1-2 sentence pitch for a transparent on-chain campaign.';
      }
      if (_location.text.trim().isEmpty) {
        _location.text = 'Austin, TX, USA';
      }
    });
    showSnack(context, 'Auto-suggest filled empty fields');
  }

  Future<void> _pickImage() async {
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (picked == null || !mounted) return;
    setState(() => _uploading = true);
    try {
      final url = await context.read<AppScope>().campaigns.uploadImage(picked.path);
      if (!mounted) return;
      setState(() => _imageUrl = url.isEmpty ? null : url);
      if (url.isEmpty) {
        showSnack(context, 'Upload returned no URL', error: true);
      }
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _addReward() async {
    final draft = RewardDraft();
    final title = TextEditingController();
    final desc = TextEditingController();
    final amount = TextEditingController(text: '0.05');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reward tier'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: title,
                decoration: const InputDecoration(labelText: 'Title'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: desc,
                decoration: const InputDecoration(labelText: 'Description'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: amount,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Min amount (ETH)'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Add'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    draft.title = title.text.trim();
    draft.description = desc.text.trim();
    draft.minAmount = double.tryParse(amount.text.trim()) ?? 0.01;
    if (draft.title.isEmpty) return;
    setState(() => _rewards.add(draft));
  }

  Future<void> _submit() async {
    if (Validators.required(_title.text, field: 'Title') != null ||
        Validators.required(_description.text, field: 'Description') != null ||
        Validators.required(_summary.text, field: 'Summary') != null ||
        Validators.amount(_goal.text) != null) {
      showSnack(context, 'Fill in title, summary, description, and goal', error: true);
      _go(0);
      return;
    }
    setState(() => _submitting = true);
    try {
      final locationNote = _location.text.trim();
      final description = locationNote.isEmpty
          ? _description.text.trim()
          : '${_description.text.trim()}\n\nLocation: $locationNote';
      final campaign = await context.read<AppScope>().campaigns.create({
        'title': _title.text.trim(),
        'description': description,
        'summary': _summary.text.trim(),
        'goalAmount': double.parse(_goal.text.trim()),
        'endDate': _endDate.toUtc().toIso8601String(),
        'category': _category,
        'imageUrl': _imageUrl ??
            'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200',
        if (_rewards.isNotEmpty)
          'rewards': _rewards.map((r) => r.toJson()).toList(),
      });
      if (!mounted) return;
      showSnack(context, 'Campaign created');
      context.go('/campaigns/${campaign.id}');
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  String get _continueLabel {
    return switch (_step) {
      0 => 'Continue to Funding',
      1 => 'Continue to Story',
      2 => 'Continue to Rewards',
      3 => 'Continue to Review',
      _ => 'Launch',
    };
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  GestureDetector(
                    onTap: () {
                      context.read<CopilotController>().ask(
                            context.read<AppScope>(),
                            context.read<AuthProvider>(),
                            'Help me draft a strong campaign on FundFlow',
                          );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.emerald.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.auto_awesome, size: 14, color: AppColors.emerald),
                          SizedBox(width: 4),
                          Text(
                            'AI Copilot',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: scheme.surfaceContainer,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.cloud_done_outlined, size: 14),
                        SizedBox(width: 4),
                        Text(
                          'Draft ready',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                'Create Campaign',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                'Launch your project with smart contract governance and automated escrow.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 14),
              _Stepper(current: _step, labels: _steps),
            ],
          ),
        ),
        Expanded(
          child: PageView(
            controller: _page,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _stepBasics(),
              _stepFunding(),
              _stepStory(),
              _stepRewards(),
              _stepReview(),
            ],
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _step == 0 ? null : () => _go(_step - 1),
                        child: const Text('Back'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: FilledButton(
                        onPressed: _submitting
                            ? null
                            : () {
                                if (_step < 4) {
                                  _go(_step + 1);
                                } else {
                                  _submit();
                                }
                              },
                        child: _submitting
                            ? const SizedBox(
                                height: 22,
                                width: 22,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Flexible(child: Text(_continueLabel)),
                                  if (_step < 4) ...[
                                    const SizedBox(width: 6),
                                    const Icon(Icons.arrow_forward_rounded, size: 18),
                                  ],
                                ],
                              ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.lock_outline, size: 13, color: scheme.onSurfaceVariant),
                    const SizedBox(width: 6),
                    Text(
                      'Draft stays on this device until you launch',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _stepBasics() {
    final scheme = Theme.of(context).colorScheme;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        FfCard(
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
                          'Step 1: Basic Information',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                        ),
                        Text(
                          'Set the identity and core ledger deployment location.',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: _autoSuggest,
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 36),
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      visualDensity: VisualDensity.compact,
                    ),
                    icon: const Icon(Icons.auto_awesome, size: 16),
                    label: const Text('Auto-suggest'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _title,
                maxLength: 80,
                decoration: const InputDecoration(
                  labelText: 'Campaign Title *',
                  hintText: 'e.g. AeroGrid: Community Solar Mesh',
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _summary,
                maxLength: 160,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Short Subtitle / Tagline *',
                  hintText: 'A clear, compelling 1-2 sentence description...',
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(labelText: 'Category'),
                items: [
                  for (final c in CampaignConstants.categories)
                    DropdownMenuItem(
                      value: c,
                      child: Text(c[0].toUpperCase() + c.substring(1)),
                    ),
                ],
                onChanged: (v) => setState(() => _category = v ?? _category),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _location,
                decoration: const InputDecoration(
                  labelText: 'Project Location',
                  hintText: 'e.g. Austin, TX, USA',
                  prefixIcon: Icon(Icons.location_on_outlined),
                ),
              ),
              const SizedBox(height: 12),
              InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Deployment Network',
                  border: OutlineInputBorder(),
                ),
                child: Row(
                  children: [
                    const LivePulse(),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Sepolia (test escrow)',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainer,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'Low gas',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Text(
                    'Campaign Cover Image',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                  const Spacer(),
                  Text(
                    'Recommended 16:9',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: _uploading ? null : _pickImage,
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 16),
                  decoration: BoxDecoration(
                    color: scheme.surfaceContainer,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: scheme.outline,
                      style: BorderStyle.solid,
                    ),
                  ),
                  child: _imageUrl != null
                      ? Column(
                          children: [
                            AppImage(
                              url: _imageUrl,
                              height: 140,
                              width: double.infinity,
                            ),
                            const SizedBox(height: 8),
                            const Text('Tap to replace cover photo'),
                          ],
                        )
                      : Column(
                          children: [
                            Icon(
                              _uploading
                                  ? Icons.hourglass_top_rounded
                                  : Icons.cloud_upload_outlined,
                              size: 32,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _uploading
                                  ? 'Uploading…'
                                  : 'Drag & drop or tap to browse',
                              style: const TextStyle(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'PNG, JPG or WebP up to 10MB',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            const SizedBox(height: 10),
                            OutlinedButton(
                              onPressed: _uploading ? null : _pickImage,
                              style: OutlinedButton.styleFrom(
                                minimumSize: const Size(0, 40),
                              ),
                              child: const Text('Select Photo'),
                            ),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: scheme.surfaceContainer,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.shield_outlined, size: 18),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Escrow Automation Ready: Basic details will anchor on-chain with milestone release terms once approved during Review.',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stepFunding() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        FfCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Step 2: Funding',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text(
                'Set the ETH goal and campaign deadline.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _goal,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Goal (ETH) *'),
              ),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('End date'),
                subtitle: Text(_endDate.toLocal().toString().split(' ').first),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _endDate,
                    firstDate: DateTime.now().add(const Duration(days: 1)),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) setState(() => _endDate = picked);
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stepStory() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        FfCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Step 3: Story',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _description,
                maxLines: 10,
                decoration: const InputDecoration(
                  labelText: 'Full description *',
                  hintText: 'Tell backers what you are building and why it matters.',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stepRewards() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        FfCard(
          child: Column(
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Step 4: Rewards',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                    ),
                  ),
                  TextButton(onPressed: _addReward, child: const Text('Add')),
                ],
              ),
              if (_rewards.isEmpty)
                const Text('Optional. Add tiers backers can unlock.')
              else
                ..._rewards.map(
                  (r) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(r.title),
                    subtitle: Text('${r.minAmount} ETH'),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () => setState(() => _rewards.remove(r)),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stepReview() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        FfCard(
          child: Column(
            children: [
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Title'),
                subtitle: Text(_title.text),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Category'),
                subtitle: Text(_category),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Location'),
                subtitle: Text(_location.text.isEmpty ? '—' : _location.text),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Goal'),
                subtitle: Text('${_goal.text} ETH'),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('End date'),
                subtitle: Text(_endDate.toLocal().toString().split(' ').first),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Rewards'),
                subtitle: Text('${_rewards.length} tier(s)'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'After launch you can still add more rewards and post updates from the campaign page.',
        ),
      ],
    );
  }
}

class _Stepper extends StatelessWidget {
  const _Stepper({required this.current, required this.labels});

  final int current;
  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var i = 0; i < labels.length; i++) ...[
            Column(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: i <= current ? AppColors.ink : Theme.of(context).colorScheme.surfaceContainerHighest,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${i + 1}',
                    style: TextStyle(
                      color: i <= current ? Colors.white : Theme.of(context).colorScheme.onSurfaceVariant,
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  labels[i],
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: i == current ? FontWeight.w800 : FontWeight.w500,
                    color: i == current
                        ? Theme.of(context).colorScheme.onSurface
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            if (i != labels.length - 1)
              Container(
                width: 22,
                height: 2,
                margin: const EdgeInsets.only(left: 6, right: 6, bottom: 16),
                color: i < current
                    ? AppColors.ink
                    : Theme.of(context).colorScheme.outline,
              ),
          ],
        ],
      ),
    );
  }
}
