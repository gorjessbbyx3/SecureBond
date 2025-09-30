import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp } from "lucide-react";

interface ComplianceProgressProps {
  checkInStreak: number;
  paymentCompliance: number;
  courtAttendance: number;
  overallScore: number;
}

export function ComplianceProgress({ 
  checkInStreak, 
  paymentCompliance, 
  courtAttendance, 
  overallScore 
}: ComplianceProgressProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Excellent", color: "bg-green-500" };
    if (score >= 60) return { variant: "secondary" as const, label: "Good", color: "bg-yellow-500" };
    return { variant: "destructive" as const, label: "Needs Attention", color: "bg-red-500" };
  };

  const badge = getScoreBadge(overallScore);

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Compliance Status
          </CardTitle>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Compliance</span>
            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`} data-testid="text-overall-score">
              {overallScore}%
            </span>
          </div>
          <Progress value={overallScore} className="h-3" data-testid="progress-overall" />
        </div>

        {/* Check-in Streak */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Check-in Streak</span>
            </div>
            <span className="text-sm font-semibold" data-testid="text-checkin-streak">{checkInStreak} days</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${
                  i < (checkInStreak % 7) ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Payment Compliance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {paymentCompliance >= 80 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : paymentCompliance >= 60 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Payment Compliance</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(paymentCompliance)}`}>
              {paymentCompliance}%
            </span>
          </div>
          <Progress value={paymentCompliance} className="h-2" />
        </div>

        {/* Court Attendance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {courtAttendance >= 80 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : courtAttendance >= 60 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Court Attendance</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(courtAttendance)}`}>
              {courtAttendance}%
            </span>
          </div>
          <Progress value={courtAttendance} className="h-2" />
        </div>

        {/* Motivational Message */}
        <div className={`p-3 rounded-lg ${
          overallScore >= 80 
            ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" 
            : overallScore >= 60
            ? "bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800"
            : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
        }`}>
          <p className="text-xs font-medium">
            {overallScore >= 80 && "🎉 Excellent work! Keep up the great compliance!"}
            {overallScore >= 60 && overallScore < 80 && "👍 Good progress! A few improvements will get you to excellent."}
            {overallScore < 60 && "⚠️ Attention needed. Please check in regularly and stay current with payments."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
