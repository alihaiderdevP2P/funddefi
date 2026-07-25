import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

interface CampaignFormStepsProps {
  steps: Step[];
  currentStep: number;
}

export function CampaignFormSteps({
  steps,
  currentStep,
}: CampaignFormStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card
          key={step.id}
          className={`transition-all ${
            step.id === currentStep
              ? "ring-2 ring-primary/20 border-primary/20"
              : step.id < currentStep
                ? "bg-muted/50"
                : ""
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : step.id === currentStep ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {step.description}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={
                  step.id < currentStep
                    ? "default"
                    : step.id === currentStep
                      ? "secondary"
                      : "outline"
                }
              >
                {step.id < currentStep
                  ? "Completed"
                  : step.id === currentStep
                    ? "Current"
                    : "Upcoming"}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
