import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertParticipantSchema, insertDealSchema } from "@shared/schema";
import type { Participant, InsertDeal } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy, Plus, Trash2, Target, Calendar } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export function AdminDashboard() {
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

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

  const dealForm = useForm<InsertDeal>({
    resolver: zodResolver(insertDealSchema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "BOARD",
      date: new Date().toISOString(),
    },
  });

  const { data: participants, isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/participants"],
    onSuccess: (data) => {
      console.log('[Admin Dashboard] Loaded participants:', data?.length);
    },
    onError: (error) => {
      console.error('[Admin Dashboard] Error loading participants:', error);
    }
  });

  // Improve debuggability of participant selection
  const { data: selectedParticipant, isLoading: isLoadingParticipant } = useQuery<Participant>({
    queryKey: ["/api/participants", selectedParticipantId],
    enabled: !!selectedParticipantId,
    onSuccess: (data) => {
      console.log('[Admin Dashboard] Selected participant loaded:', {
        id: data?.id,
        name: data?.name,
        dealHistory: data?.dealHistory,
        dealHistoryLength: data?.dealHistory?.length
      });
    },
    onError: (error) => {
      console.error('[Admin Dashboard] Error loading selected participant:', error);
    }
  });

  const addDealMutation = useMutation({
    mutationFn: async (data: { participantId: string; deal: InsertDeal }) => {
      console.log('[Admin Dashboard] Adding deal:', data);
      const res = await apiRequest("POST", `/api/participants/${data.participantId}/deals`, data.deal);
      const result = await res.json();
      console.log('[Admin Dashboard] Server response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('[Admin Dashboard] Deal added successfully:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      if (selectedParticipantId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/participants", selectedParticipantId],
          exact: true 
        });
      }
      dealForm.reset();
      toast({
        title: "Success",
        description: "Deal added successfully",
      });
    },
    onError: (error: Error) => {
      console.error('[Admin Dashboard] Error adding deal:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const removeDealMutation = useMutation({
    mutationFn: async ({ participantId, dealId }: { participantId: string; dealId: string }) => {
      const res = await apiRequest("DELETE", `/api/participants/${participantId}/deals/${dealId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "Success",
        description: "Deal removed successfully",
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

  const bulkDealMutation = useMutation({
    mutationFn: async ({ participantId, dealIds, action, data }: { 
      participantId: string; 
      dealIds: string[]; 
      action: 'delete' | 'update';
      data?: { title?: string } 
    }) => {
      const res = await apiRequest(
        action === 'delete' ? "DELETE" : "PATCH",
        `/api/participants/${participantId}/deals`,
        { dealIds, ...(data || {}) }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      setSelectedDeals([]);
      toast({
        title: "Success",
        description: "Deals updated successfully",
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

  const handleBulkAction = (action: 'delete' | 'update') => {
    if (!selectedDeals.length) {
      toast({
        title: "Error",
        description: "Please select at least one deal",
        variant: "destructive",
      });
      return;
    }

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedDeals.length} deal(s)?`)) {
        bulkDealMutation.mutate({
          participantId: selectedParticipantId,
          dealIds: selectedDeals,
          action: 'delete'
        });
      }
    } else {
      const newTitle = prompt('Enter new title for selected deals:');
      if (newTitle) {
        bulkDealMutation.mutate({
          participantId: selectedParticipantId,
          dealIds: selectedDeals,
          action: 'update',
          data: { title: newTitle }
        });
      }
    }
  };

  // Add more debugging to the form submission
  const handleDealSubmit = (data: InsertDeal) => {
    console.log('[Admin Dashboard] Submitting deal form:', {
      formData: data,
      selectedParticipantId
    });

    if (!selectedParticipantId) {
      toast({
        title: "Error",
        description: "Please select a participant",
        variant: "destructive",
      });
      return;
    }

    addDealMutation.mutate({
      participantId: selectedParticipantId,
      deal: data,
    });
  };

  // Improve deal history rendering with better debugging
  const renderDealHistory = () => {
    console.log('[Admin Dashboard] Rendering deal history:', {
      selectedParticipantId,
      isLoadingParticipant,
      selectedParticipant,
      dealHistory: selectedParticipant?.dealHistory
    });

    if (!selectedParticipantId) {
      return (
        <div className="text-sm text-muted-foreground text-center py-4">
          Select a participant to view their deal history
        </div>
      );
    }

    if (isLoadingParticipant) {
      return (
        <div className="text-sm text-muted-foreground text-center py-4">
          Loading deal history...
        </div>
      );
    }

    if (!selectedParticipant || !selectedParticipant.dealHistory) {
      return (
        <div className="text-sm text-muted-foreground text-center py-4">
          No deals available
        </div>
      );
    }

    const deals = selectedParticipant.dealHistory;
    console.log('[Admin Dashboard] Deals to render:', deals);

    if (deals.length === 0) {
      return (
        <div className="text-sm text-muted-foreground text-center py-4">
          No deals recorded yet
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {deals.map((deal) => (
          <div
            key={deal.dealId}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
          >
            <Checkbox
              checked={selectedDeals.includes(deal.dealId)}
              onCheckedChange={(checked) => {
                setSelectedDeals(
                  checked
                    ? [...selectedDeals, deal.dealId]
                    : selectedDeals.filter(id => id !== deal.dealId)
                );
              }}
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{deal.title}</h4>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-muted-foreground">
                  ${deal.amount.toLocaleString()}
                </p>
                <span className="text-xs text-primary">{deal.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(deal.date).toLocaleDateString()}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm('Are you sure you want to remove this deal?')) {
                    removeDealMutation.mutate({
                      participantId: selectedParticipantId,
                      dealId: deal.dealId
                    });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
            <TabsTrigger value="deals" className="text-base">Deal Management</TabsTrigger>
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
                <div className="grid grid-cols-4 gap-8 py-2 px-4 bg-gray-50 rounded-lg font-medium text-sm">
                  <div>Name</div>
                  <div>Board Revenue</div>
                  <div>MSP Revenue</div>
                  <div>Voice Seats</div>
                </div>

                {participants?.map((participant) => (
                  <div key={participant.id} className="space-y-6 p-4 rounded-lg border bg-white">
                    <div className="flex items-center justify-between">
                      <Link href={`/admin/profile/${participant.id}`}>
                        <a className="flex items-center gap-2 hover:text-primary">
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
                          <span className="font-medium">{participant.name}</span>
                        </a>
                      </Link>
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

                    <div className="grid grid-cols-4 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-full"
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
                            className="w-full"
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

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-full"
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
                            className="w-full"
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

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-full"
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
                            className="w-full"
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

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-full"
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
                            className="w-full"
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

          <TabsContent value="deals">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Add New Deal</h3>
                <form
                  onSubmit={dealForm.handleSubmit(handleDealSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Select Participant</Label>
                    <Select
                      value={selectedParticipantId}
                      onValueChange={setSelectedParticipantId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a participant" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants?.map((participant) => (
                          <SelectItem
                            key={participant.id}
                            value={participant.id.toString()}
                          >
                            {participant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Deal Title</Label>
                    <Input
                      id="title"
                      {...dealForm.register("title")}
                      placeholder="Enter deal title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...dealForm.register("amount", { valueAsNumber: true })}
                      placeholder="Enter deal amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Deal Type</Label>
                    <Select
                      defaultValue={dealForm.getValues("type")}
                      onValueChange={(value: "BOARD" | "MSP" | "VOICE") =>
                        dealForm.setValue("type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select deal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOARD">Board Revenue</SelectItem>
                        <SelectItem value="MSP">MSP Revenue</SelectItem>
                        <SelectItem value="VOICE">Voice Seats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    Add Deal
                  </Button>
                </form>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Deal History</h3>
                  {selectedDeals.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleBulkAction('update')}
                      >
                        Edit Selected
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleBulkAction('delete')}
                      >
                        Delete Selected ({selectedDeals.length})
                      </Button>
                    </div>
                  )}
                </div>
                {renderDealHistory()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}