import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/utils/formatters.dart';
import '../../models/user.dart';
import '../../providers/app_scope.dart';
import '../../widgets/app_image.dart';
import '../../widgets/ui_kit.dart';

class PublicProfileScreen extends StatefulWidget {
  const PublicProfileScreen({super.key, required this.id});

  final String id;

  @override
  State<PublicProfileScreen> createState() => _PublicProfileScreenState();
}

class _PublicProfileScreenState extends State<PublicProfileScreen> {
  User? _user;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final user = await context.read<AppScope>().users.getById(widget.id);
      if (!mounted) return;
      setState(() {
        _user = user;
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
      title: _user?.name ?? 'Profile',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: _user == null
            ? const SizedBox.shrink()
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  if (_user!.avatar != null)
                    AppImage(
                      url: _user!.avatar,
                      height: 160,
                      width: double.infinity,
                    ),
                  const SizedBox(height: 16),
                  Text(
                    _user!.name,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  Text(_user!.bio ?? 'No bio yet.'),
                  const SizedBox(height: 8),
                  Text(
                    'Wallet: ${Formatters.shortAddress(_user!.walletAddress)}',
                  ),
                ],
              ),
      ),
    );
  }
}
