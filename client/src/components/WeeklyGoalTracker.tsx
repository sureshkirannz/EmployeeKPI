import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface WeeklyGoals {
  faceToFaceMeetings1: number;
  faceToFaceMeetings2: number;
  faceToFaceMeetings3: number;
  events: number;
  videos: number;
  hoursProspected: number;
  thankYouCards1: number;
  thankYouCards2: number;
  leadsReceived: number;
}

interface WeeklyGoalTrackerProps {
  weekStart: Date;
  weekEnd: Date;
  onSubmit: (goals: WeeklyGoals) => void;
}

export default function WeeklyGoalTracker({ weekStart, weekEnd, onSubmit }: WeeklyGoalTrackerProps) {
  const [goals, setGoals] = useState<WeeklyGoals>({
    faceToFaceMeetings1: 0,
    faceToFaceMeetings2: 0,
    faceToFaceMeetings3: 0,
    events: 0,
    videos: 0,
    hoursProspected: 0,
    thankYouCards1: 0,
    thankYouCards2: 0,
    leadsReceived: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(goals);
  };

  const updateGoal = (field: keyof WeeklyGoals, value: string) => {
    setGoals({ ...goals, [field]: parseFloat(value) || 0 });
  };

  const days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Weekend"];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-xl">Weekly Goal Tracker</CardTitle>
          <div className="text-sm text-muted-foreground">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 mb-2 pb-2 border-b">
                <div className="font-semibold text-sm"></div>
                {days.map((day) => (
                  <div key={day} className="text-center text-sm font-medium">
                    {day}
                  </div>
                ))}
                <div className="text-center text-sm font-medium">Week Total</div>
              </div>

              {/* Face to Face Meetings */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-semibold">Face To Face Meetings</Label>
                {[1, 2, 3].map((num) => (
                  <div key={num} className="grid grid-cols-8 gap-2 items-center">
                    <div className="text-sm text-muted-foreground">{num}</div>
                    {days.map((day, idx) => (
                      <Input
                        key={`ftf-${num}-${day}`}
                        type="number"
                        min="0"
                        step="0.1"
                        className="h-9 text-center"
                        placeholder="0"
                        data-testid={`input-ftf-${num}-${idx}`}
                      />
                    ))}
                    <Input
                      type="number"
                      value={goals[`faceToFaceMeetings${num}` as keyof WeeklyGoals]}
                      onChange={(e) => updateGoal(`faceToFaceMeetings${num}` as keyof WeeklyGoals, e.target.value)}
                      className="h-9 text-center font-mono font-semibold"
                      placeholder="0"
                      data-testid={`input-ftf-total-${num}`}
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Max 3 per week</p>
              </div>

              {/* Events */}
              <div className="grid grid-cols-8 gap-2 items-center mb-4">
                <Label className="text-sm font-semibold">Events</Label>
                {days.map((day, idx) => (
                  <Input
                    key={`event-${day}`}
                    type="number"
                    min="0"
                    step="0.1"
                    className="h-9 text-center"
                    placeholder="0"
                    data-testid={`input-events-${idx}`}
                  />
                ))}
                <Input
                  type="number"
                  value={goals.events}
                  onChange={(e) => updateGoal("events", e.target.value)}
                  className="h-9 text-center font-mono font-semibold"
                  placeholder="0"
                  data-testid="input-events-total"
                />
              </div>

              {/* Videos */}
              <div className="grid grid-cols-8 gap-2 items-center mb-4">
                <Label className="text-sm font-semibold">Videos</Label>
                {days.map((day, idx) => (
                  <Input
                    key={`video-${day}`}
                    type="number"
                    min="0"
                    step="0.1"
                    className="h-9 text-center"
                    placeholder="0"
                    data-testid={`input-videos-${idx}`}
                  />
                ))}
                <Input
                  type="number"
                  value={goals.videos}
                  onChange={(e) => updateGoal("videos", e.target.value)}
                  className="h-9 text-center font-mono font-semibold"
                  placeholder="0"
                  data-testid="input-videos-total"
                />
              </div>

              {/* Hours Prospected */}
              <div className="grid grid-cols-8 gap-2 items-center mb-4">
                <Label className="text-sm font-semibold">Hours Prospected</Label>
                {days.map((day, idx) => (
                  <Input
                    key={`hours-${day}`}
                    type="number"
                    min="0"
                    step="0.5"
                    className="h-9 text-center"
                    placeholder="0"
                    data-testid={`input-hours-${idx}`}
                  />
                ))}
                <Input
                  type="number"
                  value={goals.hoursProspected}
                  onChange={(e) => updateGoal("hoursProspected", e.target.value)}
                  className="h-9 text-center font-mono font-semibold"
                  placeholder="0"
                  data-testid="input-hours-total"
                />
              </div>

              {/* Thank You Cards/Gifts */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-semibold">Thank You Cards/Gifts</Label>
                {[1, 2].map((num) => (
                  <div key={num} className="grid grid-cols-8 gap-2 items-center">
                    <div className="text-sm text-muted-foreground">{num}</div>
                    {days.map((day, idx) => (
                      <Input
                        key={`ty-${num}-${day}`}
                        type="number"
                        min="0"
                        step="0.1"
                        className="h-9 text-center"
                        placeholder="0"
                        data-testid={`input-thankyou-${num}-${idx}`}
                      />
                    ))}
                    <Input
                      type="number"
                      value={goals[`thankYouCards${num}` as keyof WeeklyGoals]}
                      onChange={(e) => updateGoal(`thankYouCards${num}` as keyof WeeklyGoals, e.target.value)}
                      className="h-9 text-center font-mono font-semibold"
                      placeholder="0"
                      data-testid={`input-thankyou-total-${num}`}
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Max 2 per week</p>
              </div>

              {/* Leads Received */}
              <div className="grid grid-cols-8 gap-2 items-center mb-4">
                <Label className="text-sm font-semibold">Leads Received</Label>
                {days.map((day, idx) => (
                  <Input
                    key={`leads-${day}`}
                    type="number"
                    min="0"
                    step="1"
                    className="h-9 text-center"
                    placeholder="0"
                    data-testid={`input-leads-${idx}`}
                  />
                ))}
                <Input
                  type="number"
                  value={goals.leadsReceived}
                  onChange={(e) => updateGoal("leadsReceived", e.target.value)}
                  className="h-9 text-center font-mono font-semibold"
                  placeholder="0"
                  data-testid="input-leads-total"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" data-testid="button-save-goals">
              Save Weekly Goals
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
