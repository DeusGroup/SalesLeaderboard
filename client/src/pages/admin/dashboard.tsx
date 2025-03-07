import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { insertParticipantSchema } from "@shared/schema";
import type { Participant } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { admin, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Form for adding new participants
  const form = useForm({
    resolver: zodResolver(insertParticipantSchema),
    defaultValues: {
      name: "",
      score: 0,
    },
  });

  // Query participants
  const { data: participants, isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
  });

  // Mutation for creating new participants
  const createParticipantMutation = useMutation({
    mutationFn: async (data: { name: string; score: number }) => {
      const res = await apiRequest("POST", "/api/participants", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      form.reset();
      toast({
        title: "Success",
        description: "Participant added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating participant scores
  const updateScoreMutation = useMutation({
    mutationFn: async ({ id, score }: { id: number; score: number }) => {
      const res = await apiRequest("PATCH", `/api/participants/${id}/score`, { score });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "Success",
        description: "Score updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Add Participant</CardTitle>
                <CardDescription>Create a new participant entry</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    createParticipantMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="score">Initial Score</Label>
                    <Input
                      id="score"
                      type="number"
                      {...form.register("score", { valueAsNumber: true })}
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={createParticipantMutation.isPending}
                  >
                    {createParticipantMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Participant
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <CardTitle>Manage Participants</CardTitle>
              </div>
              <CardDescription>Update participant scores</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : participants?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No participants yet
                </p>
              ) : (
                <div className="space-y-4">
                  {participants?.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm border"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{participant.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            defaultValue={participant.score}
                            className="w-24 bg-white"
                            onChange={(e) => {
                              const newScore = parseInt(e.target.value);
                              if (!isNaN(newScore)) {
                                updateScoreMutation.mutate({
                                  id: participant.id,
                                  score: newScore,
                                });
                              }
                            }}
                          />
                          <span className="text-sm text-muted-foreground">
                            points
                          </span>
                        </div>
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
