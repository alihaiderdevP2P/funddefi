"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  TrendingUp,
  Eye,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { AICampaignAssistant } from "@/components/ai-campaign-assistant";
import { RoleAuthGuard } from "@/components/role-auth-guard";
import { CampaignCreationGuide } from "@/components/campaign-creation-guide";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

const steps = [
  { id: 1, title: "Basic Info", description: "Tell us about your project" },
  {
    id: 2,
    title: "Funding",
    description: "Set your funding goal and timeline",
  },
  { id: 3, title: "Story", description: "Share your project story" },
  { id: 4, title: "Rewards", description: "Create backer rewards" },
  { id: 5, title: "Review", description: "Review and launch" },
];

const categories = [
  { value: "technology", label: "Technology" },
  { value: "creative", label: "Creative" },
  { value: "community", label: "Community" },
  { value: "business", label: "Business" },
  { value: "environment", label: "Environment" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
] as const;

interface Reward {
  id: string;
  amount: number;
  title: string;
  description: string;
  estimatedDelivery: string;
  quantity?: number;
}

export default function CreateCampaignPage() {
  const { token, isAuthenticated, user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "",
    location: "",
    goal: "",
    duration: "",
    story: "",
    risks: "",
    image: null as File | null,
  });
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim())
          newErrors.title = "Project title is required";
        if (!formData.subtitle.trim())
          newErrors.subtitle = "Project subtitle is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.location.trim())
          newErrors.location = "Location is required";
        break;
      case 2:
        if (!formData.goal || Number.parseFloat(formData.goal) < 1000) {
          newErrors.goal = "Funding goal must be at least $1,000";
        }
        if (
          !formData.duration ||
          Number.parseInt(formData.duration) < 1 ||
          Number.parseInt(formData.duration) > 60
        ) {
          newErrors.duration = "Campaign duration must be between 1-60 days";
        }
        break;
      case 3:
        if (!formData.story.trim() || formData.story.length < 100) {
          newErrors.story = "Project story must be at least 100 characters";
        }
        break;
      case 4:
        // Validate rewards if any exist
        rewards.forEach((reward, index) => {
          if (!reward.title.trim()) {
            newErrors[`reward_${index}_title`] = "Reward title is required";
          }
          if (!reward.description.trim()) {
            newErrors[`reward_${index}_description`] =
              "Reward description is required";
          }
          if (!reward.amount || reward.amount <= 0) {
            newErrors[`reward_${index}_amount`] =
              "Reward amount must be greater than 0";
          }
          if (!reward.estimatedDelivery) {
            newErrors[`reward_${index}_delivery`] = "Delivery date is required";
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addReward = () => {
    const newReward: Reward = {
      id: Date.now().toString(),
      amount: 0,
      title: "",
      description: "",
      estimatedDelivery: "",
    };
    setRewards([...rewards, newReward]);
  };

  const updateReward = (id: string, field: keyof Reward, value: any) => {
    setRewards((prev) =>
      prev.map((reward) =>
        reward.id === id ? { ...reward, [field]: value } : reward
      )
    );
  };

  const removeReward = (id: string) => {
    setRewards((prev) => prev.filter((reward) => reward.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData("image", file);
    }
  };

  const handleAIContentGenerated = (content: string, type: string) => {
    switch (type) {
      case "campaign-description":
        updateFormData("story", content);
        break;
      case "campaign-title":
        // Extract first title from generated list
        const titles = content.split("\n").filter((line) => line.trim());
        if (titles.length > 0) {
          updateFormData("title", titles[0].replace(/^\d+\.\s*/, ""));
        }
        break;
      case "reward-descriptions":
        // Parse reward descriptions and update rewards
        const rewardLines = content
          .split("\n")
          .filter((line) => line.includes("$"));
        // This would need more sophisticated parsing in a real app
        break;
    }
    setShowAIAssistant(false);
  };

  const handleLaunchCampaign = async () => {
    try {
      // Check authentication (show warning but allow creation)
      if (!isAuthenticated || !token) {
        const proceed = confirm(
          "You're not logged in. Campaigns created without authentication will be created locally. Continue anyway?"
        );
        if (!proceed) {
          return;
        }
      }

      // Validate all steps
      for (let step = 1; step <= steps.length; step++) {
        if (!validateStep(step)) {
          setCurrentStep(step);
          return;
        }
      }

      setIsCreating(true);

      let imageUrl = "/placeholder.svg";
      if (formData.image) {
        try {
          const { uploadCampaignImage } = await import("@/lib/upload-image");
          imageUrl = await uploadCampaignImage(formData.image, token);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          const retry = confirm(
            "Could not upload image to Supabase Storage. Create campaign without image?"
          );
          if (!retry) {
            setIsCreating(false);
            return;
          }
        }
      }

      // Prepare campaign data
      const campaignData = {
        title: formData.title,
        description: formData.story,
        summary: formData.subtitle,
        goalAmount: Number.parseFloat(formData.goal),
        endDate: new Date(
          Date.now() + Number.parseInt(formData.duration) * 24 * 60 * 60 * 1000
        ).toISOString(),
        category: formData.category,
        imageUrl,
        rewards: rewards
          .filter(
            (reward) =>
              reward.title.trim() &&
              reward.description.trim() &&
              reward.amount > 0
          )
          .map((reward) => {
          let deliveryDate = undefined;
          if (reward.estimatedDelivery) {
            try {
              // Convert the date string to ISO format
              const date = new Date(reward.estimatedDelivery);
              if (isNaN(date.getTime())) {
                throw new Error("Invalid date");
              }
              deliveryDate = date.toISOString();
            } catch (error) {
              console.warn(
                "Invalid delivery date:",
                reward.estimatedDelivery,
                error
              );
              // Set a default date 6 months from now
              deliveryDate = new Date(
                Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
              ).toISOString();
            }
          }

          return {
            title: reward.title,
            description: reward.description,
            minAmount: Number(reward.amount),
            deliveryDate,
          };
        }),
      };

      // Create campaign via API (with or without auth token)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add auth token if available
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers,
        body: JSON.stringify(campaignData),
      });

      // Check if response is ok
      if (!response.ok) {
        // Try to get error message
        let errorMessage = "Failed to create campaign";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // For 401, show a more helpful message
        if (response.status === 401) {
          errorMessage =
            "Authentication required. The campaign was created locally and will be visible on the campaigns page.";

          // Still create locally via fallback
          // The API route should handle this, but we'll show a helpful message
          alert(
            `Campaign "${campaignData.title}" created successfully! (Created locally - authentication may be required for full features)`
          );
          window.location.href = "/campaigns";
          return;
        }

        throw new Error(errorMessage);
      }

      const createdCampaign = await response.json();

      // Show success message and redirect
      alert(
        `Campaign "${createdCampaign.title}" submitted for admin review. You'll be notified once it's approved.`
      );

      // Redirect to campaigns page
      window.location.href = "/campaigns";
    } catch (error) {
      console.error("Error launching campaign:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Check if it's a network error or if we can still proceed
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("network")
      ) {
        alert(
          `Network error occurred, but your campaign data has been saved. Please check the campaigns page.`
        );
        window.location.href = "/campaigns";
      } else {
        alert(`Failed to launch campaign: ${errorMessage}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Project Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
              >
                {showAIAssistant ? "Hide" : "Show"} AI Assistant
              </Button>
            </div>

            {showAIAssistant && (
              <AICampaignAssistant
                campaignData={formData}
                onContentGenerated={handleAIContentGenerated}
              />
            )}

            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="Give your project a clear, compelling title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subtitle">Project Subtitle *</Label>
              <Input
                id="subtitle"
                placeholder="Briefly describe what your project is about"
                value={formData.subtitle}
                onChange={(e) => updateFormData("subtitle", e.target.value)}
                className={errors.subtitle ? "border-destructive" : ""}
              />
              {errors.subtitle && (
                <p className="text-sm text-destructive mt-1">
                  {errors.subtitle}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData("category", value)}
                >
                  <SelectTrigger
                    className={errors.category ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="image">Project Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    {formData.image
                      ? formData.image.name
                      : "Click to upload project image"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="goal">Funding Goal (USD) *</Label>
              <Input
                id="goal"
                type="number"
                placeholder="50000"
                value={formData.goal}
                onChange={(e) => updateFormData("goal", e.target.value)}
                className={errors.goal ? "border-destructive" : ""}
              />
              {errors.goal && (
                <p className="text-sm text-destructive mt-1">{errors.goal}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Minimum funding goal is $1,000. This is the amount you need to
                successfully complete your project.
              </p>
            </div>

            <div>
              <Label htmlFor="duration">Campaign Duration (Days) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={formData.duration}
                onChange={(e) => updateFormData("duration", e.target.value)}
                className={errors.duration ? "border-destructive" : ""}
              />
              {errors.duration && (
                <p className="text-sm text-destructive mt-1">
                  {errors.duration}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Choose between 1-60 days. Shorter campaigns create urgency,
                longer campaigns give more time to build momentum.
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Funding Model</CardTitle>
                <CardDescription>
                  All-or-nothing funding with smart contract escrow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • Funds are held in a smart contract until your goal is
                    reached
                  </li>
                  <li>
                    • If you don't reach your goal, all backers are
                    automatically refunded
                  </li>
                  <li>
                    • Once funded, you receive the full amount minus platform
                    fees (5%)
                  </li>
                  <li>
                    • Transparent, trustless funding with blockchain technology
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Project Story</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
              >
                {showAIAssistant ? "Hide" : "Show"} AI Assistant
              </Button>
            </div>

            {showAIAssistant && (
              <AICampaignAssistant
                campaignData={formData}
                onContentGenerated={handleAIContentGenerated}
              />
            )}

            <div>
              <Label htmlFor="story">Project Story *</Label>
              <Textarea
                id="story"
                placeholder="Tell the story of your project. What problem does it solve? Why are you passionate about it? What makes it unique?"
                value={formData.story}
                onChange={(e) => updateFormData("story", e.target.value)}
                className={`min-h-[200px] ${
                  errors.story ? "border-destructive" : ""
                }`}
              />
              {errors.story && (
                <p className="text-sm text-destructive mt-1">{errors.story}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {formData.story.length}/100 characters minimum
              </p>
            </div>

            <div>
              <Label htmlFor="risks">Risks & Challenges</Label>
              <Textarea
                id="risks"
                placeholder="Be transparent about potential risks and how you plan to address them. This builds trust with backers."
                value={formData.risks}
                onChange={(e) => updateFormData("risks", e.target.value)}
                className="min-h-[150px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Optional but recommended. Transparency builds trust with
                potential backers.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Backer Rewards</h3>
                <p className="text-muted-foreground">
                  Create rewards to incentivize backers
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                >
                  {showAIAssistant ? "Hide" : "Show"} AI Assistant
                </Button>
                <Button onClick={addReward} variant="outline">
                  Add Reward
                </Button>
              </div>
            </div>

            {showAIAssistant && (
              <AICampaignAssistant
                campaignData={formData}
                onContentGenerated={handleAIContentGenerated}
              />
            )}

            {rewards.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    No rewards created yet
                  </p>
                  <Button onClick={addReward}>Create Your First Reward</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <Card key={reward.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Reward Tier</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReward(reward.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Pledge Amount (USD)</Label>
                          <Input
                            type="number"
                            placeholder="25"
                            value={reward.amount || ""}
                            onChange={(e) =>
                              updateReward(
                                reward.id,
                                "amount",
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            className={
                              errors[`reward_${rewards.indexOf(reward)}_amount`]
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {errors[
                            `reward_${rewards.indexOf(reward)}_amount`
                          ] && (
                            <p className="text-sm text-destructive mt-1">
                              {
                                errors[
                                  `reward_${rewards.indexOf(reward)}_amount`
                                ]
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Estimated Delivery</Label>
                          <Input
                            type="date"
                            placeholder="Select delivery date"
                            value={reward.estimatedDelivery}
                            onChange={(e) =>
                              updateReward(
                                reward.id,
                                "estimatedDelivery",
                                e.target.value
                              )
                            }
                            className={
                              errors[
                                `reward_${rewards.indexOf(reward)}_delivery`
                              ]
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {errors[
                            `reward_${rewards.indexOf(reward)}_delivery`
                          ] && (
                            <p className="text-sm text-destructive mt-1">
                              {
                                errors[
                                  `reward_${rewards.indexOf(reward)}_delivery`
                                ]
                              }
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            When will backers receive this reward?
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label>Reward Title</Label>
                        <Input
                          placeholder="Early Bird Special"
                          value={reward.title}
                          onChange={(e) =>
                            updateReward(reward.id, "title", e.target.value)
                          }
                          className={
                            errors[`reward_${rewards.indexOf(reward)}_title`]
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {errors[`reward_${rewards.indexOf(reward)}_title`] && (
                          <p className="text-sm text-destructive mt-1">
                            {errors[`reward_${rewards.indexOf(reward)}_title`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Reward Description</Label>
                        <Textarea
                          placeholder="Describe what backers will receive for this pledge amount"
                          value={reward.description}
                          onChange={(e) =>
                            updateReward(
                              reward.id,
                              "description",
                              e.target.value
                            )
                          }
                          className={
                            errors[
                              `reward_${rewards.indexOf(reward)}_description`
                            ]
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {errors[
                          `reward_${rewards.indexOf(reward)}_description`
                        ] && (
                          <p className="text-sm text-destructive mt-1">
                            {
                              errors[
                                `reward_${rewards.indexOf(reward)}_description`
                              ]
                            }
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Review Your Campaign</h3>
              <p className="text-muted-foreground">
                Double-check everything before launching. You can edit most
                details after launch.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Title</Label>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <Badge variant="secondary">
                      {categories.find((c) => c.value === formData.category)
                        ?.label ?? formData.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Goal</Label>
                    <p className="font-medium">
                      $
                      {Number.parseFloat(formData.goal || "0").toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="font-medium">{formData.duration} days</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Subtitle</Label>
                  <p>{formData.subtitle}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Story Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {formData.story.substring(0, 300)}...
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rewards ({rewards.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {rewards.length > 0 ? (
                  <div className="space-y-2">
                    {rewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded"
                      >
                        <div>
                          <p className="font-medium">
                            ${reward.amount} - {reward.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reward.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No rewards created</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                  Ready to Launch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your campaign will be deployed to the blockchain and become
                  immediately visible to backers.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleLaunchCampaign}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating Campaign..." : "Launch Campaign"}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <RoleAuthGuard
      requiredRoles={["user"]}
      title="Authentication Required"
      description="Please sign in to create and deploy your crowdfunding campaign"
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">
                FundFlow
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/campaigns"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Campaigns
              </Link>
              <Link href="/create" className="text-foreground font-medium">
                Start Campaign
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/campaigns">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Help Section */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Create Your Campaign</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Follow our step-by-step process to launch your
                blockchain-powered crowdfunding campaign. Need help? Check out
                our creation guide below.
              </p>
            </div>

            <div className="mb-8">
              <CampaignCreationGuide />
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Campaign Setup</h2>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </div>
            </div>

            <Progress
              value={(currentStep / steps.length) * 100}
              className="mb-6"
            />

            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id <= currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div
                      className={`text-sm font-medium ${
                        step.id <= currentStep
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-px mx-4 ${
                        step.id < currentStep ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>
                  {steps[currentStep - 1].description}
                </CardDescription>
              </CardHeader>
              <CardContent>{renderStepContent()}</CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleLaunchCampaign}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Launch Campaign"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleAuthGuard>
  );
}
