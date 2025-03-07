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
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertSaleSchema } from "@shared/schema";
import type { Sale } from "@shared/schema";
import { useForm } from "react-hook-form";
import { Loader2, LogOut } from "lucide-react";

interface LeaderboardEntry {
  userId: number;
  displayName: string;
  totalAmount: number;
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery<
    LeaderboardEntry[]
  >({
    queryKey: ["/api/leaderboard"],
  });

  const { data: sales, isLoading: isLoadingSales } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const form = useForm({
    resolver: zodResolver(insertSaleSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: { amount: number; description: string }) => {
      const res = await apiRequest("POST", "/api/sales", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      form.reset();
      toast({
        title: "Sale recorded",
        description: "Your sale has been added to the leaderboard",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Sales Board</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.displayName}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Record Sale</CardTitle>
                <CardDescription>Add a new sale to the board</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    createSaleMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      {...form.register("amount", { valueAsNumber: true })}
                    />
                    {form.formState.errors.amount && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.amount.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createSaleMutation.isPending}
                  >
                    {createSaleMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Record Sale
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Sales</CardTitle>
                <CardDescription>Your recent sales history</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : sales?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No sales recorded yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sales?.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex justify-between items-center p-4 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{sale.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold">${sale.amount}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top performers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : leaderboard?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No sales recorded yet
                </p>
              ) : (
                <div className="space-y-4">
                  {leaderboard?.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                            ? "bg-orange-700 text-white"
                            : "bg-muted"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{entry.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          Total sales: ${entry.totalAmount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
