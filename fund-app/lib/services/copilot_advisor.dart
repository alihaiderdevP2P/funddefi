import '../core/utils/formatters.dart';
import '../models/campaign.dart';
import '../models/support.dart';
import '../models/user.dart';
import '../providers/app_scope.dart';

class CopilotReply {
  const CopilotReply({
    required this.text,
    this.campaignId,
    this.campaignTitle,
    this.route,
  });

  final String text;
  final String? campaignId;
  final String? campaignTitle;
  final String? route;
}

/// On-device FundFlow advisor. Uses live campaigns and help articles from
/// fund-server — there is no Gemini endpoint on this API.
class CopilotAdvisor {
  const CopilotAdvisor();

  static Campaign? matchCampaign(List<Campaign> campaigns, String query) {
    final q = query.toLowerCase();
    Campaign? best;
    var bestScore = 0;
    for (final campaign in campaigns) {
      final title = campaign.title.toLowerCase();
      if (title.length >= 4 && q.contains(title)) return campaign;
      final words = title
          .split(RegExp(r'[^a-z0-9]+'))
          .where((w) => w.length >= 4);
      var score = 0;
      for (final word in words) {
        if (q.contains(word)) score += word.length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = campaign;
      }
    }
    return bestScore >= 4 ? best : null;
  }

  Future<CopilotReply> reply({
    required AppScope scope,
    required String message,
    User? user,
  }) async {
    final text = message.trim();
    final lower = text.toLowerCase();

    List<Campaign> campaigns = const [];
    List<HelpArticle> articles = const [];
    try {
      final listed = await scope.campaigns.list(limit: 40);
      campaigns = listed.campaigns;
    } catch (_) {}
    try {
      articles = await scope.support.articles();
    } catch (_) {}

    final matched = matchCampaign(campaigns, lower);

    if (_wantsCreate(lower)) {
      return const CopilotReply(
        text:
            'To create a campaign on FundFlow:\n\n'
            '1. Tap + or open Create.\n'
            '2. Basics — title, category, and cover image.\n'
            '3. Funding — ETH goal and end date (Sepolia test escrow).\n'
            '4. Story and optional reward tiers.\n'
            '5. Review and submit. fund-server stores the campaign; you can post updates from the campaign page.\n\n'
            'I can open the Create flow for you.',
        route: '/create',
      );
    }

    if (_wantsGreen(lower)) {
      return _greenCampaigns(scope, campaigns);
    }

    if (_wantsEscrow(lower)) {
      if (matched != null) {
        return _escrowFor(matched, named: true);
      }
      return const CopilotReply(
        text:
            'FundFlow uses a 3-tier escrow recorded against each campaign:\n\n'
            '1. Published — story, cover, and rewards go live.\n'
            '2. Funding — pledges are held as escrow records (pending → confirmed).\n'
            '3. Goal reached — payout to the creator, or refund if the campaign expires unfunded.\n\n'
            'Ask me about a specific campaign by name to inspect its live milestone state.',
        route: '/how-it-works',
      );
    }

    if (_wantsGas(lower)) {
      return const CopilotReply(
        text:
            'Live L2 gas oracles are not wired into this app. Pledges are recorded by fund-server with a transaction reference.\n\n'
            'On Sepolia, test transactions are typically negligible. For a mainnet wallet signature, check the gas quote in MetaMask / WalletConnect before you confirm.\n\n'
            'You can attach a wallet address in Settings after you sign in.',
        route: '/settings',
      );
    }

    if (_wantsFees(lower)) {
      return const CopilotReply(
        text:
            'FundFlow records pledge amounts in ETH against the campaign. There is no separate platform-fee field on fund-server — what you pledge is what is stored.\n\n'
            'Reward tiers may require a minimum ETH amount. Open a campaign to see live tiers before you back it.',
        route: '/campaigns',
      );
    }

    if (_wantsWallet(lower)) {
      return const CopilotReply(
        text:
            'Connect with email first, then add a wallet in Settings. FundFlow is non-custodial: withdrawals and refunds follow campaign status (pending, confirmed, refunded) rather than FundFlow holding your keys.',
        route: '/settings',
      );
    }

    if (_wantsDraft(lower)) {
      final campaign = matched;
      if (campaign == null) {
        return const CopilotReply(
          text:
              'Name the campaign you want to update, or open Dashboard → Created and tap Draft Update with AI. I will write a milestone dispatch from live backer stats.',
          route: '/dashboard',
        );
      }
      return CopilotReply(
        text: _draftUpdate(campaign, user),
        campaignId: campaign.id,
        campaignTitle: campaign.title,
      );
    }

    if (_wantsFind(lower)) {
      return _listCampaigns(
        campaigns.take(5).toList(),
        heading: campaigns.isEmpty
            ? 'I could not reach fund-server for live campaigns. Check the API URL in Settings, then try again.'
            : 'Here are live campaigns you can inspect:',
      );
    }

    if (matched != null) {
      return _campaignBrief(matched);
    }

    final articleHit = _matchArticle(articles, lower);
    if (articleHit != null) {
      final slug = articleHit.slug ?? articleHit.id;
      return CopilotReply(
        text:
            '${articleHit.title}\n\n'
            '${articleHit.summary ?? articleHit.content ?? 'Open the help article for the full walkthrough.'}',
        route: '/support/articles/$slug',
      );
    }

    if (_wantsSupport(lower)) {
      return const CopilotReply(
        text:
            'I can answer campaign, escrow, and account questions here. For a tracked ticket (refunds, bugs, account issues), open the Help center and submit a support request.',
        route: '/support',
      );
    }

    return CopilotReply(
      text:
          'I can inspect campaign milestone escrows, outline how pledges are recorded, or walk you through creating a campaign.\n\n'
          'Try “How do I create a campaign?”, “Find green campaigns”, or name a live project.\n\n'
          '${campaigns.isEmpty ? 'Live campaign search needs fund-server at the API URL in Settings.' : 'I currently see ${campaigns.length} campaigns in the catalog.'}',
    );
  }

  bool _wantsCreate(String q) =>
      q.contains('create a campaign') ||
      q.contains('create campaign') ||
      q.contains('launch a campaign') ||
      q.contains('start a campaign') ||
      q.contains('new campaign') ||
      (q.contains('campaign') &&
          (q.contains('help me') || q.contains('strong campaign'))) ||
      (q.contains('draft') &&
          q.contains('campaign') &&
          !q.contains('update'));

  bool _wantsGreen(String q) =>
      q.contains('green') ||
      q.contains('environment') ||
      q.contains('climate') ||
      q.contains('eco') ||
      q.contains('sustainab');

  bool _wantsEscrow(String q) =>
      q.contains('escrow') ||
      q.contains('milestone') ||
      q.contains('protect') && q.contains('pledge') ||
      q.contains('how does funding') ||
      q.contains('smart contract');

  bool _wantsGas(String q) =>
      q.contains('gas') || q.contains('fee estimate') || q.contains('gwei');

  bool _wantsFees(String q) =>
      q.contains('fee') || q.contains('fees') || q.contains('commission');

  bool _wantsWallet(String q) =>
      q.contains('wallet') || q.contains('metamask') || q.contains('connect');

  bool _wantsDraft(String q) =>
      q.contains('draft') ||
      q.contains('update with ai') ||
      q.contains('proposal') ||
      (q.contains('write') && q.contains('update'));

  bool _wantsFind(String q) =>
      q.contains('find campaign') ||
      q.contains('discover') ||
      q.contains('trending') ||
      q.contains('show me') ||
      q.contains('browse campaign');

  bool _wantsSupport(String q) =>
      q.contains('support') ||
      q.contains('ticket') ||
      q.contains('help center') ||
      q.contains('refund');

  CopilotReply _escrowFor(Campaign campaign, {required bool named}) {
    final published = campaign.status != 'draft';
    final goalHit = campaign.status == 'funded' ||
        campaign.raisedAmount >= campaign.goalAmount;
    final network = Formatters.networkLabel(campaign.contractAddress);
    final contract = campaign.contractAddress == null ||
            campaign.contractAddress!.isEmpty
        ? 'Escrow is recorded on fund-server until a contract address is attached.'
        : 'Contract ${Formatters.shortAddress(campaign.contractAddress)} on $network.';

    return CopilotReply(
      text:
          '${campaign.title} uses a 3-tier escrow locked to campaign status:\n\n'
          '${published ? '✓' : '○'} Published — story and reward tiers ${published ? 'are live' : 'are still in draft'}.\n'
          '${goalHit ? '✓' : '○'} Funding — ${Formatters.eth(campaign.raisedAmount)} of ${Formatters.eth(campaign.goalAmount)} from ${campaign.backersCount} backers (${Formatters.percent(campaign.raisedAmount, campaign.goalAmount)}).\n'
          '${campaign.status == 'funded' ? '✓' : '○'} Payout / refund — ${campaign.status == 'funded' ? 'goal met; payout can release to the creator wallet.' : campaign.status == 'expired' ? 'campaign ended; unfunded pledges follow refund status.' : 'funds stay in escrow until the goal is met or the campaign expires.'}\n\n'
          '$contract ${Formatters.daysLeft(campaign.endDate)}.\n\n'
          '${named ? 'Your pledge is not custodied by FundFlow as a hot wallet — it is tracked against this campaign and released or refunded with its status.' : 'Name a campaign if you want this broken down for a specific project.'}',
      campaignId: campaign.id,
      campaignTitle: campaign.title,
    );
  }

  CopilotReply _campaignBrief(Campaign campaign) {
    return CopilotReply(
      text:
          '${campaign.title} · ${Formatters.categoryLabel(campaign.category)} · ${Formatters.statusLabel(campaign.status)}\n\n'
          '${campaign.summary.isNotEmpty ? campaign.summary : campaign.description}\n\n'
          '${Formatters.eth(campaign.raisedAmount)} raised of ${Formatters.eth(campaign.goalAmount)} · ${campaign.backersCount} backers · ${Formatters.daysLeft(campaign.endDate)}.\n'
          'Network: ${Formatters.networkLabel(campaign.contractAddress)}.',
      campaignId: campaign.id,
      campaignTitle: campaign.title,
    );
  }

  String _draftUpdate(Campaign campaign, User? user) {
    final name = (user?.name.split(' ').first ?? 'the team');
    return 'Draft milestone dispatch for ${campaign.title}:\n\n'
        'Title: Progress update — ${Formatters.monthYear(DateTime.now())}\n\n'
        'Hello backers — $name here. We have ${Formatters.eth(campaign.raisedAmount)} toward ${Formatters.eth(campaign.goalAmount)} '
        '(${Formatters.percent(campaign.raisedAmount, campaign.goalAmount)}) from ${campaign.backersCount} supporters. '
        '${Formatters.daysLeft(campaign.endDate)}. Next we will post the following milestone on the campaign page and keep escrow releases aligned with that roadmap.\n\n'
        'Open the campaign as the creator to post this from Updates.';
  }

  Future<CopilotReply> _greenCampaigns(
    AppScope scope,
    List<Campaign> fallback,
  ) async {
    var green = fallback
        .where((c) =>
            c.category == 'environment' ||
            c.title.toLowerCase().contains('green') ||
            c.summary.toLowerCase().contains('green') ||
            c.description.toLowerCase().contains('climate'))
        .toList();
    try {
      final env = await scope.campaigns.list(category: 'environment', limit: 20);
      final ids = green.map((c) => c.id).toSet();
      for (final c in env.campaigns) {
        if (ids.add(c.id)) green.add(c);
      }
    } catch (_) {}
    if (green.isEmpty) {
      return const CopilotReply(
        text:
            'No environment-tagged campaigns are live right now. Browse the full catalog, or launch one under the Environment category.',
        route: '/campaigns',
      );
    }
    return _listCampaigns(
      green.take(5).toList(),
      heading: 'Green / environment campaigns on FundFlow:',
    );
  }

  CopilotReply _listCampaigns(List<Campaign> campaigns, {required String heading}) {
    if (campaigns.isEmpty) {
      return CopilotReply(text: heading, route: '/campaigns');
    }
    final lines = campaigns
        .map((c) =>
            '• ${c.title} — ${Formatters.eth(c.raisedAmount)} / ${Formatters.eth(c.goalAmount)} · ${Formatters.statusLabel(c.status)}')
        .join('\n');
    return CopilotReply(
      text: '$heading\n\n$lines',
      campaignId: campaigns.length == 1 ? campaigns.first.id : null,
      campaignTitle: campaigns.length == 1 ? campaigns.first.title : null,
      route: '/campaigns',
    );
  }

  HelpArticle? _matchArticle(List<HelpArticle> articles, String query) {
    HelpArticle? best;
    var score = 0;
    for (final article in articles) {
      final hay = '${article.title} ${article.summary ?? ''} ${article.content ?? ''}'
          .toLowerCase();
      var s = 0;
      for (final word in query.split(RegExp(r'\s+'))) {
        if (word.length >= 4 && hay.contains(word)) s += 1;
      }
      if (s > score) {
        score = s;
        best = article;
      }
    }
    return score >= 2 ? best : null;
  }
}
