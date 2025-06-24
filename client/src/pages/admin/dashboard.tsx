import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertParticipantSchema } from "@shared/schema";
import type { Participant } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy, Plus, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export function AdminDashboard() {
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  const calculateProgress = (current: number, goal: number) => {
    if (!goal) return 0;
    const progress = (current / goal) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const participantForm = useForm({
    resolver: zodResolver(insertParticipantSchema),
    defaultValues: {
      name: "",
      boardRevenue: 0,
      mspRevenue: 0,
      voiceSeats: 0,
      totalDeals: 0,
      boardRevenueGoal: 0,
      mspRevenueGoal: 0,
      voiceSeatsGoal: 0,
      totalDealsGoal: 0,
    },
  });

  const { data: participants, isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
    retry: 1,
    refetchOnMount: true,
  });

  const updateMetricsMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      boardRevenue?: number;
      mspRevenue?: number;
      voiceSeats?: number;
      totalDeals?: number;
      boardRevenueGoal?: number;
      mspRevenueGoal?: number;
      voiceSeatsGoal?: number;
      totalDealsGoal?: number;
    }) => {
      const res = await apiRequest("PATCH", `/api/participants/${data.id}/metrics`, data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both admin and public leaderboard data
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({
        title: "Success",
        description: "Metrics updated successfully",
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

  const deleteParticipantMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/participants/${id}`);
    },
    onSuccess: () => {
      // Invalidate both admin and public leaderboard data
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({
        title: "Success",
        description: "Participant deleted successfully",
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

  const createParticipantMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/participants", data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both admin and public leaderboard data 
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({
        title: "Success",
        description: "Participant added successfully",
      });
      setIsAddUserDialogOpen(false);
      participantForm.reset();
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
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Sales Board</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.location.href="/"}>
              Leaderboard
            </Button>
            <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage team performance and track progress toward goals</p>
        </div>
        
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="metrics" className="text-base">Performance Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Performance Tracking</h2>
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={participantForm.handleSubmit((data) =>
                        createParticipantMutation.mutate(data)
                      )}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          {...participantForm.register("name")}
                          placeholder="Enter user name"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Add User
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading participants...</p>
                    </div>
                  ) : participants?.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No participants found</p>
                      <Button onClick={() => setIsAddUserDialogOpen(true)}>
                        Add your first participant
                      </Button>
                    </div>
                  ) : (
                    participants?.map((participant) => (
                    <div key={participant.id} className="p-6 rounded-lg border bg-white">
                      {/* User Info Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          {participant.avatarUrl ? (
                            <img
                              src={participant.avatarUrl}
                              alt={participant.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <Link href={`/admin/profile/${participant.id}`} className="text-lg font-semibold hover:text-primary cursor-pointer">
                              {participant.name}
                            </Link>
                            <div className="text-sm text-gray-600">{participant.role || "Sales Representative"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-lg px-4 py-2">
                            <span className="font-bold text-primary text-lg">
                              {participant.score.toLocaleString()} points
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${participant.name}?`)) {
                                deleteParticipantMutation.mutate(participant.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Board Revenue */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-700">Board Revenue</h4>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                className="flex-1"
                                placeholder="Current"
                                defaultValue={participant.boardRevenue}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    updateMetricsMutation.mutate({
                                      id: participant.id,
                                      boardRevenue: value
                                    });
                                  }
                                }}
                              />
                              <Input
                                type="number"
                                className="flex-1"
                                placeholder="Goal"
                                defaultValue={participant.boardRevenueGoal}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    updateMetricsMutation.mutate({
                                      id: participant.id,
                                      boardRevenueGoal: value
                                    });
                                  }
                                }}
                              />
                            </div>
                            <Progress value={calculateProgress(participant.boardRevenue, participant.boardRevenueGoal)} />
                            <div className="text-xs text-gray-500">
                              ${participant.boardRevenue.toLocaleString()} / ${participant.boardRevenueGoal.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* MSP Revenue */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-700">MSP Revenue</h4>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                className="flex-1"
                                placeholder="Current"
                                defaultValue={participant.mspRevenue}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    updateMetricsMutation.mutate({
                                      id: participant.id,
                                      mspRevenue: value
                                    });
                                  }
                                }}
                              />
                              <Input
                                type="number"
                                className="flex-1"
                                placeholder="Goal"
                                defaultValue={participant.mspRevenueGoal}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    updateMetricsMutation.mutate({
                                      id: participant.id,
                                      mspRevenueGoal: value
                                    });
                                  }
                                }}
                              />
                            </div>
                            <Progress value={calculateProgress(participant.mspRevenue, participant.mspRevenueGoal)} />
                            <div className="text-xs text-gray-500">
                              ${participant.mspRevenue.toLocaleString()} / ${participant.mspRevenueGoal.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Voice Seats */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-700">Voice Seats</h4>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                className="flex-1"
                                placeholder="Current"
                                defaultValue={participant.voiceSeats}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    updateMetricsMutation.mutate({
                                      id: participant.id,
                                      voiceSeats: value
                                    });
                                  }
                                }}
                              />
                              <Input
                                type="number"
                                className="flex-1"
                                placeholder="Goal"
                                defaultValue={participant.voiceSeatsGoal}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    updateMetricsMutation.mutate({
                                      id: participant.id,
                                      voiceSeatsGoal: value
                                    });
                                  }
                                }}
                              />
                            </div>
                            <Progress value={calculateProgress(participant.voiceSeats, participant.voiceSeatsGoal)} />
                            <div className="text-xs text-gray-500">
                              {participant.voiceSeats} / {participant.voiceSeatsGoal} seats
                            </div>
                          </div>
                        </div>

                        {/* Total Deals */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-700">Total Deals</h4>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                className="flex-1"
                                placeholder="Current"
                                defaultValue={participant.totalDeals}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    updateMetricsMutation.mutate({
                                      id: participant.id,
                                      totalDeals: value
                                    });
                                  }
                                }}
                              />
                              <Input
                                type="number"
                                className="flex-1"
                                placeholder="Goal"
                                defaultValue={participant.totalDealsGoal}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    updateMetricsMutation.mutate({
                                      id: participant.id,
                                      totalDealsGoal: value
                                    });
                                  }
                                }}
                              />
                            </div>
                            <Progress value={calculateProgress(participant.totalDeals, participant.totalDealsGoal)} />
                            <div className="text-xs text-gray-500">
                              {participant.totalDeals} / {participant.totalDealsGoal} deals
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}