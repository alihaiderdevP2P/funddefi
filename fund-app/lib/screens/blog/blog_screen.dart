import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/utils/formatters.dart';
import '../../core/utils/validators.dart';
import '../../models/blog.dart';
import '../../providers/app_scope.dart';
import '../../widgets/app_image.dart';
import '../../widgets/ui_kit.dart';

class BlogScreen extends StatefulWidget {
  const BlogScreen({super.key});

  @override
  State<BlogScreen> createState() => _BlogScreenState();
}

class _BlogScreenState extends State<BlogScreen> {
  bool _loading = true;
  String? _error;
  List<BlogPost> _posts = const [];
  final _email = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final posts = await context.read<AppScope>().blog.list();
      if (!mounted) return;
      setState(() {
        _posts = posts;
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

  Future<void> _subscribe() async {
    if (Validators.email(_email.text) != null) {
      showSnack(context, 'Enter a valid email', error: true);
      return;
    }
    try {
      await context.read<AppScope>().blog.subscribe(_email.text.trim());
      if (!mounted) return;
      showSnack(context, 'Subscribed to the newsletter');
      _email.clear();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: 'Blog',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        empty: _posts.isEmpty,
        emptyMessage: 'No posts published yet.',
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: _email,
              decoration: InputDecoration(
                labelText: 'Newsletter email',
                suffixIcon: IconButton(
                  onPressed: _subscribe,
                  icon: const Icon(Icons.send),
                ),
              ),
            ),
            const SizedBox(height: 16),
            ..._posts.map(
              (p) => Card(
                child: ListTile(
                  contentPadding: const EdgeInsets.all(8),
                  leading: SizedBox(
                    width: 72,
                    child: AppImage(url: p.coverImage, height: 72, width: 72),
                  ),
                  title: Text(p.title),
                  subtitle: Text(
                    '${p.category ?? 'Blog'} · ${Formatters.date(p.publishedAt)}',
                  ),
                  onTap: () => context.push('/blog/${p.routeKey}'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BlogDetailScreen extends StatefulWidget {
  const BlogDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  State<BlogDetailScreen> createState() => _BlogDetailScreenState();
}

class _BlogDetailScreenState extends State<BlogDetailScreen> {
  BlogPost? _post;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final post = await context.read<AppScope>().blog.bySlug(widget.slug);
      if (!mounted) return;
      setState(() {
        _post = post;
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
      title: _post?.title ?? 'Post',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_post?.coverImage != null)
              AppImage(url: _post!.coverImage, height: 200, width: double.infinity),
            const SizedBox(height: 16),
            Text(
              _post?.title ?? '',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Text(_post?.excerpt ?? ''),
            const SizedBox(height: 12),
            Text(_post?.content ?? ''),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () async {
                try {
                  await context.read<AppScope>().blog.like(widget.slug);
                  if (!mounted) return;
                  showSnack(context, 'Thanks for the like');
                } catch (e) {
                  if (!mounted) return;
                  showSnack(context, e.toString(), error: true);
                }
              },
              icon: const Icon(Icons.favorite_outline),
              label: Text('${_post?.likes ?? 0} likes'),
            ),
          ],
        ),
      ),
    );
  }
}
