"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  className?: string;
}

export function AIChatAssistant({ className = "" }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! I'm your AI assistant for FundFlow. I can help you with campaign creation, finding projects, understanding blockchain crowdfunding, and more. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          data.response ||
          "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Failed to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "How do I create a campaign?",
    "What are the fees?",
    "How does blockchain work here?",
    "Show me trending campaigns",
    "Help with campaign optimization",
  ];

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Brain className="w-5 h-5 mr-2" />
          AI Assistant
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="w-3 h-3" />
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-96 ${className}`}>
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-primary" />
              AI Assistant
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by AI
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-80 px-4">
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === "assistant" && (
                          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        {message.type === "user" && (
                          <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="text-sm">{message.content}</div>
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">
                  Quick actions:
                </div>
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setInputValue(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about FundFlow..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
