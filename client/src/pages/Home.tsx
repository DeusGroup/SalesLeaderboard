import { Header } from "@/components/Header";
import { AddScore } from "@/components/AddScore";
import { ScoreHistory } from "@/components/ScoreHistory";
import { Leaderboard } from "@/components/Leaderboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <AddScore />
            <ScoreHistory />
          </div>
          <Leaderboard />
        </div>
      </main>
    </div>
  );
}
