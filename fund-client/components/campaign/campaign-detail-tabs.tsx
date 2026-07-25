"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignBackersList } from "./campaign-backers-list";
import { CampaignUpdatesPanel } from "./campaign-updates-panel";
import { useCampaignTab, type CampaignTab } from "@/hooks/use-campaign-tab";
import type { Funding } from "@/lib/api";

interface CampaignDetailTabsProps {
  description: string;
  campaignId: string;
  creatorId: string;
  currentUserId?: string;
  fundings: Funding[];
  fundingsLoading: boolean;
}

export function CampaignDetailTabs({
  description,
  campaignId,
  creatorId,
  currentUserId,
  fundings,
  fundingsLoading,
}: CampaignDetailTabsProps) {
  const { activeTab, setActiveTab } = useCampaignTab("story");

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as CampaignTab)}
      className="w-full"
    >
      <TabsList
        className="grid w-full grid-cols-3"
        role="tablist"
        aria-label="Campaign sections"
      >
        <TabsTrigger value="story" role="tab">
          Story
        </TabsTrigger>
        <TabsTrigger value="updates" role="tab">
          Updates
        </TabsTrigger>
        <TabsTrigger value="backers" role="tab">
          Backers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="story" className="mt-6" role="tabpanel">
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <div className="whitespace-pre-line text-foreground leading-relaxed">
            {description}
          </div>
        </article>
      </TabsContent>

      <TabsContent value="updates" className="mt-6" role="tabpanel">
        <CampaignUpdatesPanel
          campaignId={campaignId}
          creatorId={creatorId}
          currentUserId={currentUserId}
        />
      </TabsContent>

      <TabsContent value="backers" className="mt-6" role="tabpanel">
        <CampaignBackersList
          fundings={fundings}
          loading={fundingsLoading}
        />
      </TabsContent>
    </Tabs>
  );
}
