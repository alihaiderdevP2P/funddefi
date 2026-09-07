import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/job.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/ui_kit.dart';

class CareersScreen extends StatefulWidget {
  const CareersScreen({super.key});

  @override
  State<CareersScreen> createState() => _CareersScreenState();
}

class _CareersScreenState extends State<CareersScreen> {
  bool _loading = true;
  String? _error;
  List<JobPosting> _jobs = const [];
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _role = TextEditingController();
  final _message = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _role.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final jobs = await context.read<AppScope>().careers.list();
      if (!mounted) return;
      setState(() {
        _jobs = jobs;
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

  Future<void> _inquiry() async {
    if (_name.text.trim().isEmpty ||
        _email.text.trim().isEmpty ||
        _message.text.trim().isEmpty) {
      showSnack(context, 'Name, email, and message are required', error: true);
      return;
    }
    try {
      await context.read<AppScope>().careers.inquiry({
        'fullName': _name.text.trim(),
        'email': _email.text.trim(),
        'interestedRole': _role.text.trim().isEmpty
            ? 'General'
            : _role.text.trim(),
        'message': _message.text.trim(),
      });
      if (!mounted) return;
      showSnack(context, 'Inquiry sent');
      _message.clear();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: 'Careers',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              'Open roles',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (_jobs.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('No openings right now.'),
              )
            else
              ..._jobs.map(
                (j) => Card(
                  child: ListTile(
                    title: Text(j.title),
                    subtitle: Text(
                      '${j.department ?? ''} · ${j.location ?? ''} · ${j.jobType ?? ''}',
                    ),
                    onTap: () => context.push('/careers/${j.routeKey}'),
                  ),
                ),
              ),
            const SizedBox(height: 24),
            Text(
              'General inquiry',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Full name'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _email,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _role,
              decoration: const InputDecoration(labelText: 'Role of interest'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _message,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Message'),
            ),
            const SizedBox(height: 12),
            FilledButton(onPressed: _inquiry, child: const Text('Send inquiry')),
          ],
        ),
      ),
    );
  }
}

class JobDetailScreen extends StatefulWidget {
  const JobDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  JobPosting? _job;
  bool _loading = true;
  String? _error;
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _resume = TextEditingController();
  final _cover = TextEditingController();

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _name.text = user?.name ?? '';
    _email.text = user?.email ?? '';
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _resume.dispose();
    _cover.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final job = await context.read<AppScope>().careers.bySlug(widget.slug);
      if (!mounted) return;
      setState(() {
        _job = job;
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

  Future<void> _apply() async {
    if (_job == null) return;
    if (_name.text.trim().isEmpty ||
        _email.text.trim().isEmpty ||
        _resume.text.trim().isEmpty ||
        _cover.text.trim().isEmpty) {
      showSnack(
        context,
        'Name, email, resume URL, and cover letter are required',
        error: true,
      );
      return;
    }
    try {
      await context.read<AppScope>().careers.apply(_job!.id, {
        'fullName': _name.text.trim(),
        'email': _email.text.trim(),
        'resumeUrl': _resume.text.trim(),
        'coverLetter': _cover.text.trim(),
      });
      if (!mounted) return;
      showSnack(context, 'Application submitted');
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: _job?.title ?? 'Role',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              _job?.title ?? '',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Text(
              '${_job?.department ?? ''} · ${_job?.location ?? ''} · ${_job?.jobType ?? ''}',
            ),
            const SizedBox(height: 12),
            Text(_job?.description ?? ''),
            if (_job?.requirements.isNotEmpty == true) ...[
              const SizedBox(height: 16),
              const Text(
                'Requirements',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              ..._job!.requirements.map((r) => Text('• $r')),
            ],
            const SizedBox(height: 24),
            Text('Apply', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            TextField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Full name'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _email,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _resume,
              decoration: const InputDecoration(
                labelText: 'Resume URL',
                hintText: 'https://...',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _cover,
              maxLines: 5,
              decoration: const InputDecoration(labelText: 'Cover letter'),
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: _apply, child: const Text('Submit application')),
          ],
        ),
      ),
    );
  }
}
