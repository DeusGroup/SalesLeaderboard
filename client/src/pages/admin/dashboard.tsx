import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertParticipantSchema } from "@shared/schema";
import type { Participant } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy, Plus } from "lucide-react";
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
  Card,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function AdminDashboard() {
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string>("");

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
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </div>
          </div>
        </div>

        {/* Award Points Section */}
        <div>
          <h2 className="text-lg font-semibold mb-6">Award Points</h2>
          <div className="space-y-4">
            {participants?.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-white"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 font-medium">{participant.name}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={participant.score}
                    className="w-24"
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
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}