import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/contact.dart';
import '../../providers/app_scope.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/ui_kit.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _message = TextEditingController();
  String _subject = ContactConstants.subjects.first;
  String _category = ContactConstants.categories.first;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _name.text = user?.name ?? '';
    _email.text = user?.email ?? '';
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty ||
        _email.text.trim().isEmpty ||
        _message.text.trim().length < 10) {
      showSnack(context, 'Name, email, and a message are required', error: true);
      return;
    }
    setState(() => _sending = true);
    try {
      final result = await context.read<AppScope>().contact.submit({
        'fullName': _name.text.trim(),
        'email': _email.text.trim(),
        'subject': _subject,
        'category': _category,
        'message': _message.text.trim(),
        'userId': context.read<AuthProvider>().user?.id,
      });
      if (!mounted) return;
      showSnack(
        context,
        result.referenceNumber == null
            ? (result.message ?? 'Message sent')
            : 'Sent. Reference ${result.referenceNumber}',
      );
      _message.clear();
    } catch (e) {
      if (!mounted) return;
      showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FfScaffold(
      title: 'Contact',
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          FfCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Talk to the FundFlow team',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Questions about campaigns, billing, or partnerships? Send a message and we will reply.',
                ),
                const SizedBox(height: 16),
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
                  value: _subject,
                  decoration: const InputDecoration(labelText: 'Subject'),
                  items: [
                    for (final s in ContactConstants.subjects)
                      DropdownMenuItem(
                        value: s,
                        child: Text(ContactConstants.label(s)),
                      ),
                  ],
                  onChanged: (v) => setState(() => _subject = v ?? _subject),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _category,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: [
                    for (final c in ContactConstants.categories)
                      DropdownMenuItem(
                        value: c,
                        child: Text(ContactConstants.label(c)),
                      ),
                  ],
                  onChanged: (v) => setState(() => _category = v ?? _category),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _message,
                  maxLines: 6,
                  decoration: const InputDecoration(labelText: 'Message'),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _sending ? null : _submit,
                  child: Text(_sending ? 'Sending…' : 'Send message'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
