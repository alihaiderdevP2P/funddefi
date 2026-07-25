"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  Wallet,
  Save,
  Camera,
  Mail,
  Lock,
  Globe,
  Moon,
  Monitor,
  Sun,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { saveThemePreference } from "@/lib/theme-preferences";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import type { SupportedLocale } from "@/lib/i18n/i18n";
import { uploadProfileImage } from "@/lib/upload-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const NOTIFICATION_PREFS_KEY = "notification_preferences";
const APP_PREFERENCES_KEY = "app_preferences";

type AppPreferences = {
  theme: "light" | "dark" | "system";
  language: SupportedLocale;
  currency: string;
};

const DEFAULT_APP_PREFERENCES: AppPreferences = {
  theme: "system",
  language: "en",
  currency: "USD",
};

export default function SettingsPage() {
  const { user, token, isAuthenticated, updateUser, refreshProfile } =
    useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme: activeTheme, resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const [themeMounted, setThemeMounted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const preferencesLoadedRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [walletData, setWalletData] = useState({
    walletAddress: user?.walletAddress || "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    campaignUpdates: true,
    fundingAlerts: true,
    marketingEmails: false,
  });

  const [preferences, setPreferences] = useState<AppPreferences>(
    DEFAULT_APP_PREFERENCES
  );

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/settings");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch {
      // ignore invalid stored notification preferences
    }
  }, []);

  useEffect(() => {
    if (!themeMounted || preferencesLoadedRef.current) return;
    preferencesLoadedRef.current = true;

    try {
      const savedPreferences = localStorage.getItem(APP_PREFERENCES_KEY);
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences) as Partial<AppPreferences>;
        const nextTheme =
          parsed.theme === "light" ||
          parsed.theme === "dark" ||
          parsed.theme === "system"
            ? parsed.theme
            : DEFAULT_APP_PREFERENCES.theme;
        setPreferences({
          theme: nextTheme,
          language: ["en", "es", "fr"].includes(parsed.language ?? "")
            ? (parsed.language as SupportedLocale)
            : DEFAULT_APP_PREFERENCES.language,
          currency: parsed.currency || DEFAULT_APP_PREFERENCES.currency,
        });
        setTheme(nextTheme);
        return;
      }
    } catch {
      // ignore invalid stored preferences
    }

    setPreferences({
      theme:
        activeTheme === "light" ||
        activeTheme === "dark" ||
        activeTheme === "system"
          ? activeTheme
          : DEFAULT_APP_PREFERENCES.theme,
      language: locale,
      currency: DEFAULT_APP_PREFERENCES.currency,
    });
  }, [themeMounted, activeTheme, locale, setTheme]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
      setAvatarPreview(user.avatar || "");
      setAvatarFile(null);
      setWalletData({
        walletAddress: user.walletAddress || "",
      });
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast({
        title: "File too large",
        description: "Profile photo must be 2MB or smaller.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview("");
    setProfileData((prev) => ({ ...prev, avatar: "" }));
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);

      let avatarUrl = profileData.avatar;
      if (avatarFile) {
        avatarUrl = await uploadProfileImage(avatarFile, token);
      }

      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name.trim(),
          bio: profileData.bio,
          avatar: avatarUrl,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      setProfileData({
        name: updatedUser.name || "",
        email: updatedUser.email || profileData.email,
        bio: updatedUser.bio || "",
        avatar: updatedUser.avatar || "",
      });
      setAvatarPreview(updatedUser.avatar || "");
      setAvatarFile(null);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error ||
            err.message ||
            (Array.isArray(err.message) ? err.message[0] : undefined) ||
            "Failed to change password"
        );
      }

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Change Failed",
        description:
          error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWalletUpdate = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        throw new Error("Failed to update wallet address");
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);

      toast({
        title: "Wallet Updated",
        description: "Your wallet address has been updated successfully.",
      });

      await refreshProfile();
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);

      localStorage.setItem(
        NOTIFICATION_PREFS_KEY,
        JSON.stringify(notifications)
      );

      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (theme: AppPreferences["theme"]) => {
    setPreferences((prev) => ({ ...prev, theme }));
    if (themeMounted) {
      setTheme(theme);
      saveThemePreference(theme);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setLoading(true);

      setTheme(preferences.theme);
      setLocale(preferences.language);

      localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(preferences));
      window.dispatchEvent(
        new CustomEvent("app-preferences-change", { detail: preferences })
      );

      toast({
        title: "Preferences Saved",
        description: "Your app preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save app preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-foreground">Settings</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/campaigns"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Campaign
            </Link>
          </nav>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="wallet">
              <Wallet className="w-4 h-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Globe className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={avatarPreview || profileData.avatar}
                      alt={profileData.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profileData.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleAvatarSelect}
                      aria-label="Upload profile photo"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                      {(avatarPreview || profileData.avatar) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={loading}
                          onClick={handleRemoveAvatar}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF or WebP. Max size 2MB
                      {avatarFile && (
                        <span className="block text-primary">
                          New photo selected — click Save Changes to apply
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    {user?.isVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Account
                      </Badge>
                    )}
                    {user?.role && (
                      <Badge variant="secondary">{user.role}</Badge>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Additional security options for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active Sessions</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage your active sessions
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Connection</CardTitle>
                <CardDescription>
                  Manage your connected wallet address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    value={walletData.walletAddress}
                    onChange={(e) =>
                      setWalletData({
                        ...walletData,
                        walletAddress: e.target.value,
                      })
                    }
                    placeholder="0x..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Ethereum wallet address for receiving funds
                  </p>
                </div>

                <Button
                  onClick={handleWalletUpdate}
                  disabled={loading}
                  className="w-full"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Update Wallet Address
                </Button>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Connected Wallets
                  </p>
                  {walletData.walletAddress ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <code className="text-sm">
                          {walletData.walletAddress.slice(0, 6)}...
                          {walletData.walletAddress.slice(-4)}
                        </code>
                      </div>
                      <Badge variant="secondary">Connected</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No wallet connected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Campaign Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about your campaign updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.campaignUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        campaignUpdates: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Funding Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts when you receive funding
                    </p>
                  </div>
                  <Switch
                    checked={notifications.fundingAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        fundingAlerts: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        marketingEmails: checked,
                      })
                    }
                  />
                </div>

                <Button
                  onClick={handleNotificationUpdate}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>
                  Customize your platform experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleThemeSelect("light")}
                      className={cn(
                        preferences.theme === "light" &&
                          "bg-zinc-100 text-zinc-900 border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900"
                      )}
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleThemeSelect("dark")}
                      className={cn(
                        preferences.theme === "dark" &&
                          "bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-900 hover:text-white"
                      )}
                    >
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleThemeSelect("system")}
                      className={cn(
                        preferences.theme === "system" &&
                          "bg-sky-500/15 text-sky-700 border-sky-300 hover:bg-sky-500/15 hover:text-sky-700 dark:text-sky-300 dark:border-sky-700"
                      )}
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      {preferences.theme === "system" && themeMounted
                        ? `System · ${resolvedTheme === "dark" ? "Dark" : "Light"}`
                        : "System"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences({
                        ...preferences,
                        language: value as SupportedLocale,
                      })
                    }
                  >
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, currency: value })
                    }
                  >
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handlePreferencesUpdate}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
