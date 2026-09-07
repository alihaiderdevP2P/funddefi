import 'package:flutter_test/flutter_test.dart';

import 'package:fund_app/core/utils/formatters.dart';
import 'package:fund_app/core/utils/json_utils.dart';
import 'package:fund_app/models/campaign.dart';
import 'package:fund_app/services/copilot_advisor.dart';

void main() {
  test('parses campaign json from fund-server', () {
    final campaign = Campaign.fromJson({
      'id': 'abc',
      'title': 'Solar Grid',
      'description': 'Clean energy',
      'summary': 'Solar',
      'goalAmount': '10.5',
      'raisedAmount': 2,
      'status': 'active',
      'category': 'environment',
      'backersCount': '4',
    });
    expect(campaign.title, 'Solar Grid');
    expect(campaign.goalAmount, 10.5);
    expect(campaign.progress, greaterThan(0));
  });

  test('extracts nested lists', () {
    final items = extractMaps({
      'campaigns': [
        {'id': '1'},
      ],
    }, ['campaigns']);
    expect(items.single['id'], '1');
  });

  test('formats eth amounts', () {
    expect(Formatters.eth(2), contains('ETH'));
  });

  test('matches a campaign name inside a copilot question', () {
    const campaigns = [
      Campaign(
        id: '1',
        title: 'AeroGrid Decentralized Mesh',
        description: 'Mesh network',
        summary: 'Mesh',
        goalAmount: 10,
        raisedAmount: 3,
      ),
    ];
    final hit = CopilotAdvisor.matchCampaign(
      campaigns,
      'How do milestone escrows protect my pledge on AeroGrid?',
    );
    expect(hit?.id, '1');
  });
}
