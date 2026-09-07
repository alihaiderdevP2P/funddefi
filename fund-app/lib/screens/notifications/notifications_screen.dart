import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/utils/formatters.dart';
import '../../models/notification.dart';
import '../../providers/app_scope.dart';
import '../../widgets/ui_kit.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _loading = true;
  String? _error;
  NotificationInbox _inbox = const NotificationInbox();

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
      final inbox = await context.read<AppScope>().notifications.list();
      if (!mounted) return;
      setState(() {
        _inbox = inbox;
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

  Future<void> _markAll() async {
    try {
      await context.read<AppScope>().notifications.markAllRead();
      await _load();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: 'Notifications',
      actions: [
        TextButton(onPressed: _markAll, child: const Text('Mark all read')),
      ],
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        empty: _inbox.notifications.isEmpty,
        emptyMessage: 'No notifications yet.',
        child: ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          itemCount: _inbox.notifications.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (_, i) {
            final n = _inbox.notifications[i];
            return FfCard(
              onTap: () async {
                if (!n.isRead) {
                  await context.read<AppScope>().notifications.markRead(n.id);
                  await _load();
                }
              },
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FfIconBox(
                    icon: n.isRead
                        ? Icons.notifications_none
                        : Icons.notifications_active_outlined,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          n.title,
                          style: TextStyle(
                            fontWeight:
                                n.isRead ? FontWeight.w600 : FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(n.message),
                        const SizedBox(height: 6),
                        Text(
                          Formatters.dateTime(n.createdAt),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
