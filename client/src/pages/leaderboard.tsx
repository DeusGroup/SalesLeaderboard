import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy, DollarSign, Building2, Phone, Target } from "lucide-react";
import type { Participant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeaderboardPage() {
  // Calculate progress percentage safely
  const calculateProgress = (current: number, goal: number) => {
    if (!goal) return 0;
    const progress = (current / goal) * 100;
    return Math.min(100, Math.max(0, progress));
  };

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
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="metrics" className="text-base">Performance Metrics</TabsTrigger>
          </TabsList>

          {/* Metrics Tab Content */}
          <TabsContent value="metrics">
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
                    <div className="grid grid-cols-5 gap-4 py-3 px-6 bg-white rounded-lg shadow-sm border-b-2 border-[#00B140]/10">
                      <div className="font-semibold text-sm text-[#1B3B6B]">Name</div>
                      <div className="font-semibold text-sm text-[#1B3B6B] text-center col-span-3">Performance Metrics</div>
                      <div className="font-semibold text-sm text-[#1B3B6B] text-center flex items-center justify-center gap-1">
                        <Trophy className="h-4 w-4 text-[#00B140]" />
                        <span>Total Score</span>
                      </div>
                    </div>

                    {/* Participant Rows */}
                    {participants?.map((participant, index) => (
                      <div
                        key={participant.id}
                        className={`p-4 rounded-lg bg-white shadow-sm border ${
                          index === 0 ? 'border-[#00B140] bg-green-50' :
                          index === 1 ? 'border-gray-400 bg-gray-50' :
                          index === 2 ? 'border-[#1B3B6B] bg-blue-50' : ''
                        }`}
                      >
                        {/* User Info */}
                        <div className="flex items-center gap-2 mb-4">
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

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {/* Board Revenue */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Board Revenue</span>
                              <span className="font-medium">${participant.boardRevenue.toLocaleString()}</span>
                            </div>
                            <Progress 
                              value={calculateProgress(participant.boardRevenue, participant.boardRevenueGoal)} 
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground text-right">
                              Goal: ${participant.boardRevenueGoal.toLocaleString()}
                            </div>
                          </div>

                          {/* MSP Revenue */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">MSP Revenue</span>
                              <span className="font-medium">${participant.mspRevenue.toLocaleString()}</span>
                            </div>
                            <Progress 
                              value={calculateProgress(participant.mspRevenue, participant.mspRevenueGoal)} 
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground text-right">
                              Goal: ${participant.mspRevenueGoal.toLocaleString()}
                            </div>
                          </div>

                          {/* Voice Seats */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Voice Seats</span>
                              <span className="font-medium">{participant.voiceSeats.toLocaleString()}</span>
                            </div>
                            <Progress 
                              value={calculateProgress(participant.voiceSeats, participant.voiceSeatsGoal)} 
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground text-right">
                              Goal: {participant.voiceSeatsGoal.toLocaleString()}
                            </div>
                          </div>

                          {/* Total Deals */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Total Deals</span>
                              <span className="font-medium">{participant.totalDeals.toLocaleString()}</span>
                            </div>
                            <Progress 
                              value={calculateProgress(participant.totalDeals, participant.totalDealsGoal)} 
                              className="h-2"
                            />
                            <div className="text-xs text-muted-foreground text-right">
                              Goal: {participant.totalDealsGoal.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex justify-end mt-2">
                          <div className="bg-[#00B140]/10 rounded-lg px-3 py-1">
                            <span className="text-base md:text-lg font-bold text-[#00B140]">
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
                        Double dollar value (2:1)
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
                        50 points per deal
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Total Score Formula:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Board Revenue + (MSP Revenue × 2) + (Voice Seats × 10) + (Total Deals × 50)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}