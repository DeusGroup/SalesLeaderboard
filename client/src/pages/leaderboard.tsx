import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy, DollarSign, Building2, Phone, Target } from "lucide-react";
import type { Participant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeaderboardPage() {
  const { data: participants, isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="border-b bg-[#0A1B3B] text-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <img 
              src="/CCP.jpg" 
              alt="CCP Office Technology Solutions" 
              className="h-8 w-auto object-contain"
            />
            <h1 className="text-xl md:text-2xl font-bold text-white">Sales Board</h1>
          </div>
          <Link href="/admin/login">
            <button className="text-sm text-white/80 hover:text-white transition-colors">
              Admin Login
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          <div className="space-y-4 overflow-x-auto pb-4">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : participants?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No participants yet
              </div>
            ) : (
              <div className="space-y-4 min-w-[800px] lg:min-w-0">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 py-3 px-6 bg-white rounded-lg shadow-sm border-b-2 border-[#00B140]/10">
                  <div className="font-semibold text-sm text-[#1B3B6B]">Name</div>
                  <div className="font-semibold text-sm text-[#1B3B6B] text-center flex items-center justify-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden md:inline">Board Revenue</span>
                    <span className="md:hidden">Board Rev.</span>
                  </div>
                  <div className="font-semibold text-sm text-[#1B3B6B] text-center flex items-center justify-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span className="hidden md:inline">MSP Revenue</span>
                    <span className="md:hidden">MSP Rev.</span>
                  </div>
                  <div className="font-semibold text-sm text-[#1B3B6B] text-center flex items-center justify-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>Voice Seats</span>
                  </div>
                  <div className="font-semibold text-sm text-[#1B3B6B] text-center flex items-center justify-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Total Deals</span>
                  </div>
                  <div className="font-semibold text-sm text-[#1B3B6B] text-center flex items-center justify-center gap-1">
                    <Trophy className="h-4 w-4 text-[#00B140]" />
                    <span>Total Score</span>
                  </div>
                </div>

                {/* Participant Rows */}
                {participants?.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`grid grid-cols-6 gap-4 items-center p-4 rounded-lg bg-white shadow-sm border ${
                      index === 0 ? 'border-[#00B140] bg-green-50' :
                      index === 1 ? 'border-gray-400 bg-gray-50' :
                      index === 2 ? 'border-[#1B3B6B] bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {participant.avatarUrl ? (
                        <img
                          src={participant.avatarUrl}
                          alt={participant.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                          index === 0 ? 'bg-green-100 text-[#00B140]' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-blue-100 text-[#1B3B6B]' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-sm md:text-base">{participant.name}</span>
                    </div>
                    <div className="text-center font-medium text-sm md:text-base">${participant.boardRevenue.toLocaleString()}</div>
                    <div className="text-center font-medium text-sm md:text-base">${participant.mspRevenue.toLocaleString()}</div>
                    <div className="text-center font-medium text-sm md:text-base">{participant.voiceSeats.toLocaleString()}</div>
                    <div className="text-center font-medium text-sm md:text-base">{participant.totalDeals.toLocaleString()}</div>
                    <div className="flex items-center justify-center">
                      <div className="bg-[#00B140]/10 rounded-lg px-3 py-1">
                        <span className="text-base md:text-lg font-bold text-[#00B140]">
                          {participant.score.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points Legend */}
          <Card className="h-fit bg-gradient-to-br from-white to-gray-50 border-t-4 border-t-[#00B140] order-first lg:order-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#00B140]" />
                Points System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative pl-8">
                  <DollarSign className="absolute left-0 top-1 h-5 w-5 text-[#00B140]" />
                  <h3 className="font-semibold text-[#1B3B6B]">Board Revenue</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Direct dollar value (1:1)
                  </p>
                </div>
                <div className="relative pl-8">
                  <Building2 className="absolute left-0 top-1 h-5 w-5 text-[#00B140]" />
                  <h3 className="font-semibold text-[#1B3B6B]">MSP Revenue</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Double points (2:1)
                  </p>
                </div>
                <div className="relative pl-8">
                  <Phone className="absolute left-0 top-1 h-5 w-5 text-[#00B140]" />
                  <h3 className="font-semibold text-[#1B3B6B]">Voice Seats</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    10 points per seat
                  </p>
                </div>
                <div className="relative pl-8">
                  <Target className="absolute left-0 top-1 h-5 w-5 text-[#00B140]" />
                  <h3 className="font-semibold text-[#1B3B6B]">Total Deals</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    100 points per deal
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Total Score Formula:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Board Revenue + (MSP Revenue × 2) + (Voice Seats × 10) + (Total Deals × 100)
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