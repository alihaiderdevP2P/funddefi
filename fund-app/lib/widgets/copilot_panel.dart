import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_theme.dart';
import '../providers/app_scope.dart';
import '../providers/auth_provider.dart';
import '../providers/copilot_controller.dart';
import 'ui_kit.dart';

class CopilotOverlay extends StatelessWidget {
  const CopilotOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    final copilot = context.watch<CopilotController>();
    if (!copilot.open) return const SizedBox.shrink();
    return const Positioned(
      left: 12,
      right: 12,
      bottom: 10,
      top: 8,
      child: Align(
        alignment: Alignment.bottomCenter,
        child: CopilotPanel(),
      ),
    );
  }
}

class CopilotPanel extends StatefulWidget {
  const CopilotPanel({super.key});

  @override
  State<CopilotPanel> createState() => _CopilotPanelState();
}

class _CopilotPanelState extends State<CopilotPanel> {
  final _input = TextEditingController();
  final _scroll = ScrollController();

  static const _chips = [
    (Icons.auto_awesome, 'How do I create a campaign?'),
    (Icons.search, 'Find green campaigns'),
  ];

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _jumpToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scroll.hasClients) return;
      _scroll.animateTo(
        _scroll.position.maxScrollExtent,
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _send([String? preset]) async {
    final text = (preset ?? _input.text).trim();
    if (text.isEmpty) return;
    if (preset == null) _input.clear();
    final copilot = context.read<CopilotController>();
    await copilot.send(
      context.read<AppScope>(),
      context.read<AuthProvider>(),
      text,
    );
    _jumpToEnd();
  }

  @override
  Widget build(BuildContext context) {
    final copilot = context.watch<CopilotController>();
    final scheme = Theme.of(context).colorScheme;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final maxH = (MediaQuery.sizeOf(context).height * 0.58).clamp(340.0, 520.0);

    if (copilot.open) _jumpToEnd();

    final card = ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: DecoratedBox(
          decoration: BoxDecoration(
            color: scheme.surface,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: scheme.outline.withValues(alpha: 0.85)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: dark ? 0.4 : 0.14),
                blurRadius: 28,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: copilot.minimized ? MainAxisSize.min : MainAxisSize.max,
            children: [
              _Header(copilot: copilot),
              if (!copilot.minimized) ...[
                const Divider(height: 1),
                Expanded(child: _Transcript(scroll: _scroll, copilot: copilot)),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final chip in _chips)
                        ActionChip(
                          avatar: Icon(chip.$1, size: 16, color: AppColors.emerald),
                          label: Text(chip.$2),
                          onPressed: copilot.busy ? null : () => _send(chip.$2),
                        ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _input,
                          enabled: !copilot.busy,
                          textInputAction: TextInputAction.send,
                          onSubmitted: (_) => _send(),
                          decoration: InputDecoration(
                            hintText: 'Ask me anything about FundFlow…',
                            prefixIcon: const Icon(
                              Icons.auto_awesome,
                              color: AppColors.emerald,
                            ),
                            suffixIcon: IconButton(
                              tooltip: 'Voice',
                              onPressed: () => showSnack(
                                context,
                                'Voice input is not available in this build',
                              ),
                              icon: const Icon(Icons.mic_none_rounded),
                            ),
                            filled: true,
                            fillColor: scheme.surfaceContainer,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(28),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(28),
                              borderSide: BorderSide.none,
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 12,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Material(
                        color: dark ? Colors.white : AppColors.ink,
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          onTap: copilot.busy ? null : () => _send(),
                          child: SizedBox(
                            width: 44,
                            height: 44,
                            child: Icon(
                              Icons.arrow_upward_rounded,
                              color: dark ? AppColors.ink : Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
    );

    return Material(
      color: Colors.transparent,
      child: copilot.minimized ? card : SizedBox(height: maxH, child: card),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.copilot});

  final CopilotController copilot;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 4, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.emerald.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  size: 18,
                  color: AppColors.emerald,
                ),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'FundFlow Copilot v1.0',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                ),
              ),
              IconButton(
                tooltip: copilot.minimized ? 'Expand' : 'Collapse',
                onPressed: copilot.toggleMinimized,
                icon: Icon(
                  copilot.minimized
                      ? Icons.keyboard_arrow_up_rounded
                      : Icons.keyboard_arrow_down_rounded,
                ),
              ),
              IconButton(
                tooltip: 'Close',
                onPressed: copilot.close,
                icon: const Icon(Icons.close_rounded),
              ),
            ],
          ),
          const SizedBox(height: 2),
          const Row(
            children: [
              LivePulse(),
              SizedBox(width: 8),
              Text(
                'Sepolia • Live Advisory',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: scheme.surfaceContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.verified_user_outlined, size: 16, color: scheme.onSurfaceVariant),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Escrow records on fund-server • Milestone releases tracked',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: scheme.onSurfaceVariant,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    copilot.close();
                    context.push('/support');
                  },
                  child: Text(
                    'Help',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: scheme.onSurface,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Transcript extends StatelessWidget {
  const _Transcript({required this.scroll, required this.copilot});

  final ScrollController scroll;
  final CopilotController copilot;

  @override
  Widget build(BuildContext context) {
    final items = copilot.messages;
    return ListView.builder(
      controller: scroll,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
      itemCount: items.length + (copilot.busy ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= items.length) {
          return const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Align(
              alignment: Alignment.centerLeft,
              child: _TypingDots(),
            ),
          );
        }
        return _Bubble(message: items[index]);
      },
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.message});

  final CopilotMessage message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final user = message.fromUser;
    final time = DateFormat.jm().format(message.time.toLocal());
    final bg = user
        ? (dark ? Colors.white : AppColors.ink)
        : scheme.surfaceContainer;
    final fg = user
        ? (dark ? AppColors.ink : Colors.white)
        : scheme.onSurface;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment:
            user ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.78,
            ),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: bg,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(user ? 16 : 4),
                  bottomRight: Radius.circular(user ? 4 : 16),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                child: Text(
                  message.text,
                  style: TextStyle(color: fg, height: 1.4, fontSize: 13.5),
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            time,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 10),
          ),
          if (!user && (message.campaignId != null || message.route != null))
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Wrap(
                spacing: 6,
                children: [
                  if (message.campaignId != null)
                    TextButton(
                      onPressed: () {
                        context.read<CopilotController>().close();
                        context.push('/campaigns/${message.campaignId}');
                      },
                      style: TextButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                      ),
                      child: Text('View ${message.campaignTitle ?? 'campaign'}'),
                    ),
                  if (message.route != null &&
                      message.route != '/campaigns/${message.campaignId}')
                    TextButton(
                      onPressed: () {
                        context.read<CopilotController>().close();
                        context.push(message.route!);
                      },
                      style: TextButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                      ),
                      child: const Text('Open'),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _TypingDots extends StatefulWidget {
  const _TypingDots();

  @override
  State<_TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<_TypingDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AnimatedBuilder(
      animation: _c,
      builder: (_, __) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: scheme.surfaceContainer,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(3, (i) {
              final t = (_c.value + i * 0.2) % 1;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2),
                child: Opacity(
                  opacity: 0.35 + (0.65 * (1 - (t - 0.5).abs() * 2).clamp(0, 1)),
                  child: Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: scheme.onSurface,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              );
            }),
          ),
        );
      },
    );
  }
}
