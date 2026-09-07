import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/config/app_config.dart';
import '../core/theme/app_theme.dart';
import '../providers/app_scope.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_controller.dart';
import '../providers/copilot_controller.dart';
import '../router/app_router.dart';
import '../widgets/ui_kit.dart';

class FundApp extends StatefulWidget {
  const FundApp({super.key, required this.scope});

  final AppScope scope;

  @override
  State<FundApp> createState() => _FundAppState();
}

class _FundAppState extends State<FundApp> {
  late final AuthProvider _auth;
  late final ThemeController _theme;
  late final CopilotController _copilot;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _auth = AuthProvider(widget.scope);
    _theme = ThemeController(widget.scope.storage);
    _copilot = CopilotController();
    _router = createRouter(_auth);
    _auth.bootstrap();
    _theme.load();
  }

  @override
  void dispose() {
    _auth.dispose();
    _theme.dispose();
    _copilot.dispose();
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AppScope>.value(value: widget.scope),
        ChangeNotifierProvider<AuthProvider>.value(value: _auth),
        ChangeNotifierProvider<ThemeController>.value(value: _theme),
        ChangeNotifierProvider<CopilotController>.value(value: _copilot),
      ],
      child: Consumer<ThemeController>(
        builder: (context, theme, _) {
          return MaterialApp.router(
            title: AppConfig.appName,
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            themeMode: theme.mode,
            builder: (context, child) => AppCanvas(child: child ?? const SizedBox.shrink()),
            routerConfig: _router,
          );
        },
      ),
    );
  }
}
