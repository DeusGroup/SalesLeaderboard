import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertParticipantSchema } from "@shared/schema";
import type { Participant } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function AdminDashboard() {
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

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
      setIsAddUserDialogOpen(false);
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

  // Mutation for deleting participants
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

  // Mutation for updating participant metrics
  const updateMetricsMutation = useMutation({
    mutationFn: async (data: { 
      id: number; 
      boardRevenue?: number; 
      mspRevenue?: number; 
      voiceSeats?: number; 
      totalDeals?: number; 
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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">IT Incentive</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href="/"}>
              Leaderboard
            </Button>
            <Button 
              variant="ghost"
              onClick={() => logoutMutation.mutate()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Manage Profiles Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Manage Profiles</h2>
          <p className="text-sm text-muted-foreground mb-4">Select an employee to view and edit their profile</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {participants?.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id.toString()}>
                      {participant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        placeholder="Enter user name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="score">Initial Score</Label>
                      <Input
                        id="score"
                        type="number"
                        {...form.register("score", { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Add User
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Award Points Section */}
        <div>
          <h2 className="text-lg font-semibold mb-6">Award Points</h2>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 py-2 px-4 bg-gray-50 rounded-lg font-medium text-sm">
              <div>Name</div>
              <div>Board Revenue ($)</div>
              <div>MSP ($)</div>
              <div>Voice Seats</div>
              <div>Total Deals</div>
              <div>Total Score</div>
            </div>
            {/* Participant Rows */}
            {participants?.map((participant) => (
              <div
                key={participant.id}
                className="grid grid-cols-7 gap-4 items-center p-4 rounded-lg border bg-white"
              >
                <div className="flex items-center gap-2">
                  <Link href={`/admin/profile/${participant.id}`}>
                    <a className="flex items-center gap-2 hover:text-primary">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{participant.name}</span>
                    </a>
                  </Link>
                </div>
                <Input
                  type="number"
                  className="w-full"
                  placeholder="0"
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
                  className="w-full"
                  placeholder="0"
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
                  className="w-full"
                  placeholder="0"
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
                  className="w-full"
                  placeholder="0"
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{participant.score}</span>
                  <span className="text-sm text-muted-foreground">points</span>
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
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}