import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-72 mb-8" />
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-10 w-full max-w-lg mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
