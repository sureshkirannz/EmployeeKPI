import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WeeklyActivity {
  id?: string;
  employeeId: string;
  weekStartDate: string;
  weekEndDate: string;
  faceToFaceMeetings: number;
  events: number;
  videos: number;
  hoursProspected: string;
  thankyouCards: number;
  leadsReceived: number;
  dailyBreakdown?: {
    faceToFaceMeetings: number[][];
    events: number[];
    videos: number[];
    hoursProspected: number[];
    thankyouCards: number[][];
    leadsReceived: number[];
  };
}

export default function WeeklyGoalTracker() {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [goals, setGoals] = useState({
    faceToFaceMeetings: 0,
    events: 0,
    videos: 0,
    hoursProspected: 0,
    thankyouCards: 0,
    leadsReceived: 0,
  });
  
  // Track daily values for breakdown
  const [dailyValues, setDailyValues] = useState({
    faceToFaceMeetings: Array(6).fill(0).map(() => Array(3).fill(0)),
    events: Array(6).fill(0),
    videos: Array(6).fill(0),
    hoursProspected: Array(6).fill(0),
    thankyouCards: Array(6).fill(0).map(() => Array(2).fill(0)),
    leadsReceived: Array(6).fill(0),
  });
  
  const { toast } = useToast();

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const { data: activitiesData } = useQuery<{ activities: WeeklyActivity[] }>({
    queryKey: ["/api/employee/weekly-activities"],
  });

  const saveActivityMutation = useMutation({
    mutationFn: async (activity: Partial<WeeklyActivity>) => {
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");

      // Check if activity exists for this week
      const existingActivity = activitiesData?.activities?.find(
        (a) => a.weekStartDate === weekStartStr
      );

      if (existingActivity) {
        // Update existing
        const response = await apiRequest("PUT", `/api/employee/weekly-activities/${existingActivity.id}`, activity);
        return await response.json();
      } else {
        // Create new
        const response = await apiRequest("POST", "/api/employee/weekly-activities", {
          ...activity,
          weekStartDate: weekStartStr,
          weekEndDate: weekEndStr,
        });
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/weekly-activities"] });
      toast({ title: "Success", description: "Weekly activity saved" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save activity",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate constraints
    if (goals.faceToFaceMeetings > 3) {
      toast({
        title: "Validation Error",
        description: "Maximum 3 face-to-face meetings per week",
        variant: "destructive",
      });
      return;
    }

    if (goals.thankyouCards > 2) {
      toast({
        title: "Validation Error",
        description: "Maximum 2 thank you cards per week",
        variant: "destructive",
      });
      return;
    }

    saveActivityMutation.mutate({
      faceToFaceMeetings: goals.faceToFaceMeetings,
      events: goals.events,
      videos: goals.videos,
      hoursProspected: goals.hoursProspected.toString(),
      thankyouCards: goals.thankyouCards,
      leadsReceived: goals.leadsReceived,
      dailyBreakdown: dailyValues,
    });
  };

  const updateGoal = (field: keyof typeof goals, value: string) => {
    setGoals({ ...goals, [field]: parseFloat(value) || 0 });
  };
  
  // Update daily value and recalculate total
  const updateDailyValue = (field: string, dayIndex: number, value: string, rowIndex?: number) => {
    const numValue = parseFloat(value) || 0;
    
    if (field === 'faceToFaceMeetings' && rowIndex !== undefined) {
      const newValues = dailyValues.faceToFaceMeetings.map((day, dIdx) => 
        dIdx === dayIndex ? day.map((v, rIdx) => rIdx === rowIndex ? numValue : v) : day
      );
      setDailyValues({ ...dailyValues, faceToFaceMeetings: newValues });
      const total = newValues.flat().reduce((sum, v) => sum + v, 0);
      setGoals({ ...goals, faceToFaceMeetings: total });
    } else if (field === 'thankyouCards' && rowIndex !== undefined) {
      const newValues = dailyValues.thankyouCards.map((day, dIdx) =>
        dIdx === dayIndex ? day.map((v, rIdx) => rIdx === rowIndex ? numValue : v) : day
      );
      setDailyValues({ ...dailyValues, thankyouCards: newValues });
      const total = newValues.flat().reduce((sum, v) => sum + v, 0);
      setGoals({ ...goals, thankyouCards: total });
    } else {
      const newValues = [...(dailyValues[field as keyof typeof dailyValues] as number[])];
      newValues[dayIndex] = numValue;
      setDailyValues({ ...dailyValues, [field]: newValues });
      const total = newValues.reduce((sum, v) => sum + v, 0);
      setGoals({ ...goals, [field]: total });
    }
  };

  const days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Weekend"];

  // Load existing activity for selected week when data or week changes
  useEffect(() => {
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const currentActivity = activitiesData?.activities?.find(
      (a) => a.weekStartDate === weekStartStr
    );

    if (currentActivity) {
      // Load daily values from saved activity if available
      if (currentActivity.dailyBreakdown) {
        const breakdown = currentActivity.dailyBreakdown;
        setDailyValues(breakdown);
        
        // Recalculate totals from daily breakdown
        const ftfTotal = breakdown.faceToFaceMeetings.flat().reduce((sum, v) => sum + v, 0);
        const eventsTotal = breakdown.events.reduce((sum, v) => sum + v, 0);
        const videosTotal = breakdown.videos.reduce((sum, v) => sum + v, 0);
        const hoursTotal = breakdown.hoursProspected.reduce((sum, v) => sum + v, 0);
        const thankyouTotal = breakdown.thankyouCards.flat().reduce((sum, v) => sum + v, 0);
        const leadsTotal = breakdown.leadsReceived.reduce((sum, v) => sum + v, 0);
        
        setGoals({
          faceToFaceMeetings: ftfTotal,
          events: eventsTotal,
          videos: videosTotal,
          hoursProspected: hoursTotal,
          thankyouCards: thankyouTotal,
          leadsReceived: leadsTotal,
        });
      } else {
        // No daily breakdown, use database totals
        setGoals({
          faceToFaceMeetings: currentActivity.faceToFaceMeetings,
          events: currentActivity.events,
          videos: currentActivity.videos,
          hoursProspected: parseFloat(currentActivity.hoursProspected),
          thankyouCards: currentActivity.thankyouCards,
          leadsReceived: currentActivity.leadsReceived,
        });
        setDailyValues({
          faceToFaceMeetings: Array(6).fill(0).map(() => Array(3).fill(0)),
          events: Array(6).fill(0),
          videos: Array(6).fill(0),
          hoursProspected: Array(6).fill(0),
          thankyouCards: Array(6).fill(0).map(() => Array(2).fill(0)),
          leadsReceived: Array(6).fill(0),
        });
      }
    } else {
      // Reset to empty state for new week
      setGoals({
        faceToFaceMeetings: 0,
        events: 0,
        videos: 0,
        hoursProspected: 0,
        thankyouCards: 0,
        leadsReceived: 0,
      });
      setDailyValues({
        faceToFaceMeetings: Array(6).fill(0).map(() => Array(3).fill(0)),
        events: Array(6).fill(0),
        videos: Array(6).fill(0),
        hoursProspected: Array(6).fill(0),
        thankyouCards: Array(6).fill(0).map(() => Array(2).fill(0)),
        leadsReceived: Array(6).fill(0),
      });
    }
  }, [activitiesData, selectedWeek]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl">Weekly Goal Tracker</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" data-testid="button-select-week">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedWeek}
                onSelect={(date) => {
                  if (date) {
                    setSelectedWeek(date);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
                {[0, 1, 2].map((rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-8 gap-2 items-center">
                    <div className="text-sm text-muted-foreground">{rowIndex + 1}</div>
                    {days.map((day, dayIndex) => (
                      <Input
                        key={`ftf-${rowIndex}-${day}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={dailyValues.faceToFaceMeetings[dayIndex][rowIndex] || ''}
                        onChange={(e) => updateDailyValue('faceToFaceMeetings', dayIndex, e.target.value, rowIndex)}
                        className="h-9 text-center"
                        placeholder="0"
                        data-testid={`input-ftf-${rowIndex + 1}-${dayIndex}`}
                      />
                    ))}
                    <Input
                      type="number"
                      className="h-9 text-center font-mono font-semibold bg-muted"
                      value={dailyValues.faceToFaceMeetings.reduce((sum, day) => sum + day[rowIndex], 0) || ''}
                      placeholder="0"
                      disabled
                      data-testid={`input-ftf-total-${rowIndex + 1}`}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-sm font-semibold">Total</div>
                  <div className="col-span-6"></div>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={goals.faceToFaceMeetings}
                    onChange={(e) => updateGoal("faceToFaceMeetings", e.target.value)}
                    className="h-9 text-center font-mono font-semibold"
                    placeholder="0"
                    data-testid="input-ftf-total"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Max 3 per week</p>
              </div>

              {/* Events */}
              <div className="grid grid-cols-8 gap-2 items-center mb-4">
                <Label className="text-sm font-semibold">Events</Label>
                {days.map((day, dayIndex) => (
                  <Input
                    key={`event-${day}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={dailyValues.events[dayIndex] || ''}
                    onChange={(e) => updateDailyValue('events', dayIndex, e.target.value)}
                    className="h-9 text-center"
                    placeholder="0"
                    data-testid={`input-events-${dayIndex}`}
                  />
                ))}
                <Input
                  type="number"
                  value={goals.events || ''}
                  className="h-9 text-center font-mono font-semibold bg-muted"
                  placeholder="0"
                  disabled
                  data-testid="input-events-total"
                />
              </div>

              {/* Videos */}
              <div className="grid grid-cols-8 gap-2 items-center mb-4">
                <Label className="text-sm font-semibold">Videos</Label>
                {days.map((day, dayIndex) => (
                  <Input
                    key={`video-${day}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={dailyValues.videos[dayIndex] || ''}
                    onChange={(e) => updateDailyValue('videos', dayIndex, e.target.value)}
                    className="h-9 text-center"
                    placeholder="0"
                    data-testid={`input-videos-${dayIndex}`}
                  />
                ))}
                <Input
                  type="number"
                  value={goals.videos || ''}
                  className="h-9 text-center font-mono font-semibold bg-muted"
                  placeholder="0"
                  disabled
                  data-testid="input-videos-total"
                />
              </div>

              {/* Hours Prospected */}
              <div className="grid grid-cols-8 gap-2 items-center mb-4">
                <Label className="text-sm font-semibold">Hours Prospected</Label>
                {days.map((day, dayIndex) => (
                  <Input
                    key={`hours-${day}`}
                    type="number"
                    min="0"
                    step="0.5"
                    value={dailyValues.hoursProspected[dayIndex] || ''}
                    onChange={(e) => updateDailyValue('hoursProspected', dayIndex, e.target.value)}
                    className="h-9 text-center"
                    placeholder="0"
                    data-testid={`input-hours-${dayIndex}`}
                  />
                ))}
                <Input
                  type="number"
                  value={goals.hoursProspected || ''}
                  step="0.5"
                  className="h-9 text-center font-mono font-semibold bg-muted"
                  placeholder="0"
                  disabled
                  data-testid="input-hours-total"
                />
              </div>

              {/* Thank You Cards/Gifts */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-semibold">Thank You Cards/Gifts</Label>
                {[0, 1].map((rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-8 gap-2 items-center">
                    <div className="text-sm text-muted-foreground">{rowIndex + 1}</div>
                    {days.map((day, dayIndex) => (
                      <Input
                        key={`ty-${rowIndex}-${day}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={dailyValues.thankyouCards[dayIndex][rowIndex] || ''}
                        onChange={(e) => updateDailyValue('thankyouCards', dayIndex, e.target.value, rowIndex)}
                        className="h-9 text-center"
                        placeholder="0"
                        data-testid={`input-thankyou-${rowIndex + 1}-${dayIndex}`}
                      />
                    ))}
                    <Input
                      type="number"
                      className="h-9 text-center font-mono font-semibold bg-muted"
                      value={dailyValues.thankyouCards.reduce((sum, day) => sum + day[rowIndex], 0) || ''}
                      placeholder="0"
                      disabled
                      data-testid={`input-thankyou-total-${rowIndex + 1}`}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-sm font-semibold">Total</div>
                  <div className="col-span-6"></div>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    value={goals.thankyouCards}
                    onChange={(e) => updateGoal("thankyouCards", e.target.value)}
                    className="h-9 text-center font-mono font-semibold"
                    placeholder="0"
                    data-testid="input-thankyou-total"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Max 2 per week</p>
              </div>

              {/* Leads Received */}
              <div className="grid grid-cols-8 gap-2 items-center mb-4">
                <Label className="text-sm font-semibold">Leads Received</Label>
                {days.map((day, dayIndex) => (
                  <Input
                    key={`leads-${day}`}
                    type="number"
                    min="0"
                    step="1"
                    value={dailyValues.leadsReceived[dayIndex] || ''}
                    onChange={(e) => updateDailyValue('leadsReceived', dayIndex, e.target.value)}
                    className="h-9 text-center"
                    placeholder="0"
                    data-testid={`input-leads-${dayIndex}`}
                  />
                ))}
                <Input
                  type="number"
                  value={goals.leadsReceived || ''}
                  className="h-9 text-center font-mono font-semibold bg-muted"
                  placeholder="0"
                  disabled
                  data-testid="input-leads-total"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={saveActivityMutation.isPending}
              data-testid="button-save-goals"
            >
              {saveActivityMutation.isPending ? "Saving..." : "Save Weekly Goals"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
