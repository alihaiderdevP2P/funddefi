"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Send } from "lucide-react";

interface ChatMessage {
  sender: "user" | "support";
  message: string;
  time: string;
}

interface SupportLiveChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportLiveChat({ open, onOpenChange }: SupportLiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "support",
      message: "Hello! I'm your FundFlow AI assistant. How can I help you today?",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const time = new Date().toLocaleTimeString();

    setMessages((prev) => [
      ...prev,
      { sender: "user", message: userMessage, time },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.message,
      }));

      const response = await fetch("/api/ai/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      });

      const data = await response.json();
      const reply =
        data.response ||
        data.message ||
        "I'm here to help! Could you please rephrase your question?";

      setMessages((prev) => [
        ...prev,
        { sender: "support", message: reply, time: new Date().toLocaleTimeString() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "support",
          message:
            "Sorry, I'm having trouble connecting right now. Please try again or submit a support ticket.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="live-chat-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
            Live Chat Support
          </DialogTitle>
          <DialogDescription id="live-chat-desc">
            Chat with our AI-powered support assistant in real-time
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[400px]">
          <div
            className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg mb-4"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <span className="text-xs opacity-70 mt-1 block">{msg.time}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              aria-label="Chat message input"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
