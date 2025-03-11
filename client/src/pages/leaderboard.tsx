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
    <div className="min-h-screen bg-white">
      <header className="border-b bg-[#0A1B3B] text-white shadow-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <img
              src="/CCP.jpg"
              alt="CCP Office Technology Solutions"
              className="h-9 w-auto object-contain rounded-lg"
            />
            <h1 className="text-2xl font-bold">
              Sales Board
            </h1>
          </div>
          <Link href="/admin/login">
            <button className="text-sm px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              Admin Login
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-4 px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
          <div className="space-y-3 overflow-x-auto pb-2">
            {isLoading ? (
              <div className="text-center py-4 text-gray-600 text-lg">Loading...</div>
            ) : participants?.length === 0 ? (
              <div className="text-center text-gray-600 py-4 text-lg">
                No participants yet
              </div>
            ) : (
              <div className="space-y-3 min-w-[1000px] lg:min-w-0">
                {/* Table Header */}
                <div className="grid grid-cols-[250px,1fr,180px] gap-4 py-2.5 px-4 bg-gray-50 rounded-lg font-medium text-base">
                  <div>Name</div>
                  <div className="text-center">Performance Metrics</div>
                  <div className="text-center flex items-center justify-center gap-1">
                    <Trophy className="h-5 w-5 text-[#00B140]" />
                    <span>Total Score</span>
                  </div>
                </div>

                {/* Participant Cards */}
                {participants?.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg bg-white shadow-sm border transition-all duration-300 hover:shadow-md ${
                      index === 0 ? 'border-[#FFD700] bg-[#FFD700]/5' :
                        index === 1 ? 'border-[#C0C0C0] bg-[#C0C0C0]/5' :
                          index === 2 ? 'border-[#CD7F32] bg-[#CD7F32]/5' : 'border-gray-100'
                    }`}
                  >
                    <div className="grid grid-cols-[250px,1fr,180px] gap-4 items-center">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        {participant.avatarUrl ? (
                          <img
                            src={participant.avatarUrl}
                            alt={participant.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            index === 0 ? 'bg-[#FFD700]/20 text-[#FFD700]' :
                              index === 1 ? 'bg-[#C0C0C0]/20 text-[#C0C0C0]' :
                                index === 2 ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                                  'bg-gray-100 text-gray-600'
                          }`}>
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-xl text-gray-900">{participant.name}</span>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-4 gap-6">
                        {/* Board Revenue */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700 text-base">Board Revenue</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-lg">
                            ${participant.boardRevenue.toLocaleString()}
                          </div>
                          <Progress
                            value={calculateProgress(participant.boardRevenue, participant.boardRevenueGoal)}
                            className="h-2 bg-gray-100"
                            indicatorClassName="bg-gradient-to-r from-[#00B140] to-[#00D150] transition-all duration-700"
                          />
                          <div className="text-sm text-gray-600">
                            Goal: ${participant.boardRevenueGoal.toLocaleString()}
                          </div>
                        </div>

                        {/* MSP Revenue */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700 text-base">MSP Revenue</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-lg">
                            ${participant.mspRevenue.toLocaleString()}
                          </div>
                          <Progress
                            value={calculateProgress(participant.mspRevenue, participant.mspRevenueGoal)}
                            className="h-2 bg-gray-100"
                            indicatorClassName="bg-gradient-to-r from-[#00B140] to-[#00D150] transition-all duration-700"
                          />
                          <div className="text-sm text-gray-600">
                            Goal: ${participant.mspRevenueGoal.toLocaleString()}
                          </div>
                        </div>

                        {/* Voice Seats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700 text-base">Voice Seats</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {participant.voiceSeats.toLocaleString()}
                          </div>
                          <Progress
                            value={calculateProgress(participant.voiceSeats, participant.voiceSeatsGoal)}
                            className="h-2 bg-gray-100"
                            indicatorClassName="bg-gradient-to-r from-[#00B140] to-[#00D150] transition-all duration-700"
                          />
                          <div className="text-sm text-gray-600">
                            Goal: {participant.voiceSeatsGoal.toLocaleString()}
                          </div>
                        </div>

                        {/* Total Deals */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700 text-base">Total Deals</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {participant.totalDeals.toLocaleString()}
                          </div>
                          <Progress
                            value={calculateProgress(participant.totalDeals, participant.totalDealsGoal)}
                            className="h-2 bg-gray-100"
                            indicatorClassName="bg-gradient-to-r from-[#00B140] to-[#00D150] transition-all duration-700"
                          />
                          <div className="text-sm text-gray-600">
                            Goal: {participant.totalDealsGoal.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-[#00B140] to-[#00D150] rounded-full px-5 py-2 shadow-md">
                          <span className="text-xl font-bold text-white">
                            {participant.score.toLocaleString()} points
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points Legend */}
          <Card className="h-fit bg-white border-t-4 border-t-[#00B140] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#00B140]" />
                Points System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pl-7">
                <DollarSign className="absolute left-0 top-1 h-4 w-4 text-[#00B140]" />
                <h3 className="font-medium text-base text-gray-900">Board Revenue</h3>
                <p className="text-sm text-gray-600">
                  Direct dollar value (1:1)
                </p>
              </div>
              <div className="relative pl-7">
                <Building2 className="absolute left-0 top-1 h-4 w-4 text-[#00B140]" />
                <h3 className="font-medium text-base text-gray-900">MSP Revenue</h3>
                <p className="text-sm text-gray-600">
                  Double dollar value (2:1)
                </p>
              </div>
              <div className="relative pl-7">
                <Phone className="absolute left-0 top-1 h-4 w-4 text-[#00B140]" />
                <h3 className="font-medium text-base text-gray-900">Voice Seats</h3>
                <p className="text-sm text-gray-600">
                  10 points per seat
                </p>
              </div>
              <div className="relative pl-7">
                <Target className="absolute left-0 top-1 h-4 w-4 text-[#00B140]" />
                <h3 className="font-medium text-base text-gray-900">Total Deals</h3>
                <p className="text-sm text-gray-600">
                  50 points per deal
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h4 className="font-medium text-sm text-gray-800">Total Score Formula:</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Board Revenue + (MSP Revenue × 2) + (Voice Seats × 10) + (Total Deals × 50)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}