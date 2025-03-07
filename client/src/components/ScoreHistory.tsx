import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Score {
  id: number;
  score: number;
  description: string;
  createdAt: string;
}

export function ScoreHistory() {
  const { data: scores, isLoading } = useQuery<Score[]>({
    queryKey: ["/api/scores"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : scores?.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No scores recorded yet
          </div>
        ) : (
          <div className="space-y-4">
            {scores?.map((score) => (
              <div
                key={score.id}
                className="flex justify-between items-center p-4 rounded-lg bg-white shadow-sm border"
              >
                <div>
                  <p className="font-medium">{score.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(score.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-primary">Score: {score.score}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </CardContent>
    </Card>
  );
}
