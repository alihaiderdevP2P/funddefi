import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/support.dart';
import '../../providers/app_scope.dart';
import '../../widgets/ui_kit.dart';

class ArticleScreen extends StatefulWidget {
  const ArticleScreen({super.key, required this.slug});

  final String slug;

  @override
  State<ArticleScreen> createState() => _ArticleScreenState();
}

class _ArticleScreenState extends State<ArticleScreen> {
  HelpArticle? _article;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final article =
          await context.read<AppScope>().support.articleBySlug(widget.slug);
      if (!mounted) return;
      setState(() {
        _article = article;
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
      title: _article?.title ?? 'Article',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              _article?.title ?? '',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Text(_article?.content ?? _article?.summary ?? ''),
          ],
        ),
      ),
    );
  }
}
