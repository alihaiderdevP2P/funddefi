import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/support.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/ui_kit.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  bool _loading = true;
  String? _error;
  List<HelpArticle> _articles = const [];
  String _category = SupportConstants.categories.first;
  String _priority = SupportConstants.priorities[1];
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _subject = TextEditingController();
  final _description = TextEditingController();
  final _lookup = TextEditingController();

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
    _subject.dispose();
    _description.dispose();
    _lookup.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final articles = await context.read<AppScope>().support.articles();
      if (!mounted) return;
      setState(() {
        _articles = articles;
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

  Future<void> _submit() async {
    final auth = context.read<AuthProvider>().user;
    if (_name.text.trim().isEmpty ||
        _email.text.trim().isEmpty ||
        _subject.text.trim().length < 3 ||
        _description.text.trim().length < 10) {
      showSnack(
        context,
        'Name, email, subject, and a detailed description are required',
        error: true,
      );
      return;
    }
    try {
      final ticket = await context.read<AppScope>().support.submitTicket({
        'fullName': _name.text.trim(),
        'email': _email.text.trim(),
        'category': _category,
        'priority': _priority,
        'subject': _subject.text.trim(),
        'description': _description.text.trim(),
        if (auth != null) 'userId': auth.id,
      });
      if (!mounted) return;
      showSnack(
        context,
        'Ticket submitted: ${ticket.ticketNumber ?? ticket.id}',
      );
      _subject.clear();
      _description.clear();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  Future<void> _lookupTicket() async {
    if (_lookup.text.trim().isEmpty) return;
    try {
      final ticket = await context
          .read<AppScope>()
          .support
          .ticketByNumber(_lookup.text.trim());
      if (!mounted) return;
      showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          title: Text(ticket.ticketNumber ?? ticket.id),
          content: Text(
            '${ticket.subject}\nStatus: ${ticket.status}\n${ticket.description ?? ''}',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: 'Support',
      body: AsyncBody(
        loading: _loading,
        error: _error,
        onRetry: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              'Help articles',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 8),
            if (_articles.isEmpty)
              const FfCard(child: Text('No help articles published yet.'))
            else
              ..._articles.map(
                (a) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: FfCard(
                    onTap: () => context.push(
                      '/support/articles/${a.slug ?? a.id}',
                    ),
                    child: Row(
                      children: [
                        const FfIconBox(icon: Icons.menu_book_outlined),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                a.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              Text(a.summary ?? a.category ?? ''),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded),
                      ],
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 18),
            FfCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Look up a ticket',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _lookup,
                    decoration: InputDecoration(
                      labelText: 'Ticket number',
                      suffixIcon: IconButton(
                        onPressed: _lookupTicket,
                        icon: const Icon(Icons.search),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            FfCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Submit a ticket',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _name,
                    decoration: const InputDecoration(labelText: 'Full name'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Email'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _category,
                    decoration: const InputDecoration(labelText: 'Category'),
                    items: [
                      for (final c in SupportConstants.categories)
                        DropdownMenuItem(value: c, child: Text(c)),
                    ],
                    onChanged: (v) => setState(() => _category = v ?? _category),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _priority,
                    decoration: const InputDecoration(labelText: 'Priority'),
                    items: [
                      for (final p in SupportConstants.priorities)
                        DropdownMenuItem(value: p, child: Text(p)),
                    ],
                    onChanged: (v) => setState(() => _priority = v ?? _priority),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _subject,
                    decoration: const InputDecoration(labelText: 'Subject'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _description,
                    maxLines: 5,
                    decoration: const InputDecoration(labelText: 'Description'),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: _submit,
                    child: const Text('Submit ticket'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
