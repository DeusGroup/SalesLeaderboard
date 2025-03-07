import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Participant } from "@shared/schema";
import { Trophy, PenSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/avatar-upload";

export function UserProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Query participant data
  const { data: participant, isLoading } = useQuery<Participant>({
    queryKey: ["/api/participants", id],
    retry: false,
  });

  // Mutation for updating participant profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; role: string; department: string; avatarUrl?: string }) => {
      const res = await apiRequest("PATCH", `/api/participants/${id}/profile`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants", id] });
      setIsEditDialogOpen(false);
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

  // Mutation for deleting participant
  const deleteParticipantMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/participants/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Participant deleted successfully",
      });
      setLocation("/admin/dashboard");
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
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
        {/* Profile Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4">
            <AvatarUpload
              currentAvatarUrl={participant?.avatarUrl}
              onUploadComplete={(url) => {
                updateProfileMutation.mutate({
                  ...participant,
                  avatarUrl: url,
                });
              }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-1">{participant?.name}</h2>
          <p className="text-muted-foreground mb-4">{participant?.role || 'Sales Representative'}</p>
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              className="gap-2"
            >
              <PenSquare className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${participant.name}?`)) {
                  deleteParticipantMutation.mutate();
                }
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete User
            </Button>
          </div>
          <div className="inline-block bg-primary/5 rounded-lg px-6 py-3">
            <div className="text-4xl font-bold text-primary mb-1">
              {participant.score || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Performance Trend */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Track your point earnings and achievements over time
            </p>
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
          </div>

          {/* Points History */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Points History</h3>
            <div className="space-y-4">
              {participant.performanceHistory?.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{entry.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-primary">+{entry.score}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateProfileMutation.mutate({
                  name: formData.get("name") as string,
                  role: formData.get("role") as string,
                  department: formData.get("department") as string,
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={participant.name}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Job Title</Label>
                <Input
                  id="role"
                  name="role"
                  defaultValue={participant.role || "Sales Representative"}
                  placeholder="Enter job title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={participant.department || ""}
                  placeholder="Enter department"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Profile</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default UserProfile;