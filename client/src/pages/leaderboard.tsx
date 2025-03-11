import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy, DollarSign, Building2, Phone, Target } from "lucide-react";
import type { Participant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function LeaderboardPage() {
  const calculateProgress = (current: number, goal: number) => {
    if (!goal) return 0;
    const progress = (current / goal) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const { data: participants, isLoading } = useQuery<Participant[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1B3B] via-[#152B4E] to-[#1B3B6B]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg text-white shadow-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <img 
              src="/CCP.jpg" 
              alt="CCP Office Technology Solutions" 
              className="h-10 w-auto object-contain rounded-lg"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Sales Board
            </h1>
          </div>
          <Link href="/admin/login">
            <button className="text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white">
              Admin Login
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          <div className="space-y-4 overflow-x-auto pb-4">
            {isLoading ? (
              <div className="text-center py-8 text-white/80">Loading...</div>
            ) : participants?.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                No participants yet
              </div>
            ) : (
              <div className="space-y-4 min-w-[800px] lg:min-w-0">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 py-3 px-6 bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-white/10">
                  <div className="font-semibold text-sm text-white/90">Name</div>
                  <div className="font-semibold text-sm text-white/90 text-center col-span-3">Performance Metrics</div>
                  <div className="font-semibold text-sm text-white/90 text-center flex items-center justify-center gap-1">
                    <Trophy className="h-4 w-4 text-[#00B140]" />
                    <span>Total Score</span>
                  </div>
                </div>

                {/* Participant Rows */}
                {participants?.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`p-6 rounded-xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/10 transition-all duration-300 hover:transform hover:scale-[1.02] hover:bg-white/15 ${
                      index === 0 ? 'border-[#FFD700]/50 bg-[#FFD700]/5' :
                      index === 1 ? 'border-[#C0C0C0]/50 bg-[#C0C0C0]/5' :
                      index === 2 ? 'border-[#CD7F32]/50 bg-[#CD7F32]/5' : ''
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-6">
                      {participant.avatarUrl ? (
                        <img
                          src={participant.avatarUrl}
                          alt={participant.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                          index === 1 ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                          index === 2 ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                          'bg-white/10 text-white/80'
                        }`}>
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-lg text-white">{participant.name}</span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      {/* Board Revenue */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Board Revenue</span>
                          <span className="font-medium text-white">${participant.boardRevenue.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={calculateProgress(participant.boardRevenue, participant.boardRevenueGoal)} 
                          className="h-2 bg-white/10"
                          indicatorClassName="bg-gradient-to-r from-[#00B140] to-[#00D150] transition-all duration-700"
                        />
                        <div className="text-xs text-white/40 text-right">
                          Goal: ${participant.boardRevenueGoal.toLocaleString()}
                        </div>
                      </div>

                      {/* MSP Revenue */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">MSP Revenue</span>
                          <span className="font-medium text-white">${participant.mspRevenue.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={calculateProgress(participant.mspRevenue, participant.mspRevenueGoal)} 
                          className="h-2 bg-white/10"
                          indicatorClassName="bg-gradient-to-r from-[#00B140] to-[#00D150] transition-all duration-700"
                        />
                        <div className="text-xs text-white/40 text-right">
                          Goal: ${participant.mspRevenueGoal.toLocaleString()}
                        </div>
                      </div>

                      {/* Voice Seats */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Voice Seats</span>
                          <span className="font-medium text-white">{participant.voiceSeats.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={calculateProgress(participant.voiceSeats, participant.voiceSeatsGoal)} 
                          className="h-2 bg-white/10"
                          indicatorClassName="bg-gradient-to-r from-[#00B140] to-[#00D150] transition-all duration-700"
                        />
                        <div className="text-xs text-white/40 text-right">
                          Goal: {participant.voiceSeatsGoal.toLocaleString()}
                        </div>
                      </div>

                      {/* Total Deals */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Total Deals</span>
                          <span className="font-medium text-white">{participant.totalDeals.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={calculateProgress(participant.totalDeals, participant.totalDealsGoal)} 
                          className="h-2 bg-white/10"
                          indicatorClassName="bg-gradient-to-r from-[#00B140] to-[#00D150] transition-all duration-700"
                        />
                        <div className="text-xs text-white/40 text-right">
                          Goal: {participant.totalDealsGoal.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex justify-end mt-4">
                      <div className="bg-gradient-to-r from-[#00B140] to-[#00D150] rounded-full px-6 py-2 shadow-lg">
                        <span className="text-xl font-bold text-white">
                          {participant.score.toLocaleString()} points
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points Legend */}
          <Card className="h-fit bg-white/10 backdrop-blur-lg border-t-4 border-t-[#00B140] shadow-xl text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-[#00B140]" />
                Points System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative pl-8">
                  <DollarSign className="absolute left-0 top-1 h-5 w-5 text-[#00B140]" />
                  <h3 className="font-semibold text-white">Board Revenue</h3>
                  <p className="text-sm text-white/60 mt-1">
                    Direct dollar value (1:1)
                  </p>
                </div>
                <div className="relative pl-8">
                  <Building2 className="absolute left-0 top-1 h-5 w-5 text-[#00B140]" />
                  <h3 className="font-semibold text-white">MSP Revenue</h3>
                  <p className="text-sm text-white/60 mt-1">
                    Double dollar value (2:1)
                  </p>
                </div>
                <div className="relative pl-8">
                  <Phone className="absolute left-0 top-1 h-5 w-5 text-[#00B140]" />
                  <h3 className="font-semibold text-white">Voice Seats</h3>
                  <p className="text-sm text-white/60 mt-1">
                    10 points per seat
                  </p>
                </div>
                <div className="relative pl-8">
                  <Target className="absolute left-0 top-1 h-5 w-5 text-[#00B140]" />
                  <h3 className="font-semibold text-white">Total Deals</h3>
                  <p className="text-sm text-white/60 mt-1">
                    50 points per deal
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="font-medium text-sm mb-2 text-white/80">Total Score Formula:</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Board Revenue + (MSP Revenue × 2) + (Voice Seats × 10) + (Total Deals × 50)
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