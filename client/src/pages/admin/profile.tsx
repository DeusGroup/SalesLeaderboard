import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Participant } from "@shared/schema";
import { Trophy, PenSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function UserProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Query participant data
  const { data: participant, isLoading } = useQuery<Participant>({
    queryKey: ["/api/participants", id],
    retry: false, // Don't retry on failure
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load participant data",
        variant: "destructive",
      });
      setLocation("/admin/dashboard");
    },
  });

  // Mutation for updating participant
  const updateParticipantMutation = useMutation({
    mutationFn: async (data: Partial<Participant>) => {
      const res = await apiRequest("PATCH", `/api/participants/${id}/metrics`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants", id] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!participant) {
    return <div className="flex items-center justify-center min-h-screen">Participant not found</div>;
  }

  const performanceData = participant.performanceHistory?.map((entry) => ({
    timestamp: new Date(entry.timestamp).toLocaleDateString(),
    score: entry.score,
  })) || [];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">IT Incentive</h1>
          </div>
          <Button variant="ghost" onClick={() => setLocation("/admin/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                {participant.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <CardTitle className="text-2xl">{participant.name}</CardTitle>
                <p className="text-muted-foreground">{participant.role || 'Sales Representative'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-primary">{participant.score || 0}</h2>
              <span className="text-muted-foreground">points</span>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Board Revenue ($)</label>
                    <Input
                      type="number"
                      defaultValue={participant.boardRevenue}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          updateParticipantMutation.mutate({ boardRevenue: value });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">MSP Revenue ($)</label>
                    <Input
                      type="number"
                      defaultValue={participant.mspRevenue}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          updateParticipantMutation.mutate({ mspRevenue: value });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Voice Seats</label>
                    <Input
                      type="number"
                      defaultValue={participant.voiceSeats}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          updateParticipantMutation.mutate({ voiceSeats: value });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Deals</label>
                    <Input
                      type="number"
                      defaultValue={participant.totalDeals}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          updateParticipantMutation.mutate({ totalDeals: value });
                        }
                      }}
                    />
                  </div>
                </div>
                <Button onClick={() => setIsEditing(false)}>Done</Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <PenSquare className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Points History */}
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participant.performanceHistory?.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="font-bold text-primary">{entry.score}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default UserProfile;