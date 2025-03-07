import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import type { Participant } from "@shared/schema";

export default function LeaderboardPage() {
  const { data: participants, isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Sales Board</h1>
          </div>
          <Link href="/admin/login">
            <a className="text-sm text-muted-foreground hover:text-foreground">
              Admin Login
            </a>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : participants?.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No participants yet
            </div>
          ) : (
            <div className="space-y-4">
              {participants?.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm border"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-100 text-gray-700"
                        : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-muted"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {participant.score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
