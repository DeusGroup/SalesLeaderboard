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
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
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

      <main className="container mx-auto py-8 px-4">
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
                  {/* Header Row */}
                  <div className="grid grid-cols-[200px,1fr,1fr,1fr,1fr] gap-8 py-2 px-4 bg-gray-50 rounded-lg font-medium text-sm">
                    <div>Name</div>
                    <div className="pl-4">Board Revenue</div>
                    <div className="pl-4">MSP Revenue</div>
                    <div className="pl-4">Voice Seats</div>
                    <div className="pl-4">Total Deals</div>
                  </div>

                  {participants?.map((participant) => (
                    <div key={participant.id} className="space-y-6 p-4 rounded-lg border bg-white">
                      <div className="grid grid-cols-[200px,1fr,1fr,1fr,1fr] gap-8 items-start">
                        {/* User Info */}
                        <div className="flex items-center gap-2">
                          {participant.avatarUrl ? (
                            <img
                              src={participant.avatarUrl}
                              alt={participant.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600">
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <Link href={`/admin/profile/${participant.id}`} className="font-medium hover:text-primary cursor-pointer">
                            {participant.name}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${participant.name}?`)) {
                                deleteParticipantMutation.mutate(participant.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Board Revenue */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-[120px]"
                              placeholder="Current Revenue"
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
                            <Target className="h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              className="w-[120px]"
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
                        </div>

                        {/* MSP Revenue */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-[120px]"
                              placeholder="Current MSP"
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
                            <Target className="h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              className="w-[120px]"
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
                        </div>

                        {/* Voice Seats */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-[120px]"
                              placeholder="Current Seats"
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
                            <Target className="h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              className="w-[120px]"
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
                        </div>

                        {/* Total Deals */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-[120px]"
                              placeholder="Current Deals"
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
                            <Target className="h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              className="w-[120px]"
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
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div className="bg-primary/10 rounded-lg px-3 py-1">
                          <span className="font-bold text-primary">
                            {participant.score.toLocaleString()} points
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}