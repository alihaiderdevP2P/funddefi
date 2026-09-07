import 'package:flutter/foundation.dart';

import '../providers/app_scope.dart';
import '../providers/auth_provider.dart';
import '../services/copilot_advisor.dart';

class CopilotMessage {
  CopilotMessage({
    required this.id,
    required this.fromUser,
    required this.text,
    DateTime? time,
    this.campaignId,
    this.campaignTitle,
    this.route,
  }) : time = time ?? DateTime.now();

  final String id;
  final bool fromUser;
  final String text;
  final DateTime time;
  final String? campaignId;
  final String? campaignTitle;
  final String? route;
}

class CopilotController extends ChangeNotifier {
  CopilotController();

  final CopilotAdvisor _advisor = const CopilotAdvisor();

  bool open = false;
  bool minimized = false;
  bool busy = false;
  final List<CopilotMessage> messages = [];

  void openPanel({String? name}) {
    open = true;
    minimized = false;
    if (messages.isEmpty) {
      messages.add(
        CopilotMessage(
          id: 'greet',
          fromUser: false,
          text: _greeting(name),
        ),
      );
    } else {
      personalizeGreeting(name);
    }
    notifyListeners();
  }

  String _greeting(String? name) {
    final first = (name ?? '').trim().split(RegExp(r'\s+')).first;
    final hello = first.isEmpty ? 'Hello!' : 'Hello $first!';
    return "$hello I'm your FundFlow Copilot. I can inspect campaign milestone escrows, explain how pledges are recorded on Sepolia, or draft a project update. What would you like to review?";
  }

  void close() {
    open = false;
    minimized = false;
    notifyListeners();
  }

  void toggleMinimized() {
    minimized = !minimized;
    if (!minimized) open = true;
    notifyListeners();
  }

  void personalizeGreeting(String? name) {
    if (messages.isEmpty) return;
    if (messages.first.id != 'greet' || messages.first.fromUser) return;
    messages[0] = CopilotMessage(
      id: 'greet',
      fromUser: false,
      text: _greeting(name),
      time: messages[0].time,
    );
  }

  Future<void> ask(
    AppScope scope,
    AuthProvider auth,
    String text, {
    bool ensureOpen = true,
  }) async {
    if (ensureOpen) {
      openPanel(name: auth.user?.name);
    }
    await send(scope, auth, text);
  }

  Future<void> send(AppScope scope, AuthProvider auth, String raw) async {
    final text = raw.trim();
    if (text.isEmpty || busy) return;

    personalizeGreeting(auth.user?.name);
    messages.add(
      CopilotMessage(
        id: 'u-${DateTime.now().microsecondsSinceEpoch}',
        fromUser: true,
        text: text,
      ),
    );
    busy = true;
    notifyListeners();

    try {
      final reply = await _advisor.reply(
        scope: scope,
        message: text,
        user: auth.user,
      );
      messages.add(
        CopilotMessage(
          id: 'a-${DateTime.now().microsecondsSinceEpoch}',
          fromUser: false,
          text: reply.text,
          campaignId: reply.campaignId,
          campaignTitle: reply.campaignTitle,
          route: reply.route,
        ),
      );
    } catch (_) {
      messages.add(
        CopilotMessage(
          id: 'e-${DateTime.now().microsecondsSinceEpoch}',
          fromUser: false,
          text:
              'I hit a snag talking to fund-server. Check the API URL in Settings and try again. Help center tickets still work if you need a human.',
          route: '/support',
        ),
      );
    } finally {
      busy = false;
      notifyListeners();
    }
  }
}
