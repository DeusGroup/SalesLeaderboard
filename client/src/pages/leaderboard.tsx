import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import type { Participant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Admin Login
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : participants?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No participants yet
              </div>
            ) : (
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
                {participants?.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`grid grid-cols-6 gap-4 items-center p-4 rounded-lg bg-white shadow-sm border ${
                      index === 0 ? 'border-yellow-400 bg-yellow-50' :
                      index === 1 ? 'border-gray-400 bg-gray-50' :
                      index === 2 ? 'border-orange-400 bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{participant.name}</span>
                    </div>
                    <div>{participant.boardRevenue}</div>
                    <div>{participant.mspRevenue}</div>
                    <div>{participant.voiceSeats}</div>
                    <div>{participant.totalDeals}</div>
                    <div className="font-bold text-primary">{participant.score}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points Legend */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Points Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Board Revenue</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct dollar value (1:1)
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">MSP Revenue</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct dollar value (1:1)
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Voice Seats</h3>
                  <p className="text-sm text-muted-foreground">
                    10 points per seat
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Total Deals</h3>
                  <p className="text-sm text-muted-foreground">
                    100 points per deal
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Total Score = Board Revenue + MSP Revenue + (Voice Seats × 10) + (Total Deals × 100)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}