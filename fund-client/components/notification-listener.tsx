"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import websocketService from "@/lib/websocket";

/**
 * Listens for user-notification websocket events and shows toast popups.
 */
export function NotificationListener() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handler = (data: {
      title?: string;
      message?: string;
      showPopup?: boolean;
      type?: string;
    }) => {
      if (data?.showPopup === false) return;
      toast({
        title: data.title || "Notification",
        description: data.message,
      });
    };

    websocketService.onUserNotification(handler);
    return () => {
      websocketService.offUserNotification(handler);
    };
  }, [isAuthenticated, toast]);

  return null;
}
