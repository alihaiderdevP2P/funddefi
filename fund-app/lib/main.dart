import 'package:flutter/material.dart';

import 'app.dart';
import 'core/config/app_config.dart';
import 'providers/app_scope.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppConfig.load();
  final scope = await AppScope.create();
  runApp(FundApp(scope: scope));
}
