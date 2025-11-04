import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Calendar, FileText, CreditCard, Users, MessageSquare, Plus, Save } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { DailyActivity } from "@shared/schema";

export default function DailyActivityLog() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ activity: DailyActivity | null }>({
    queryKey: [`/api/employee/daily-activities/${selectedDate}`],
  });

  const activity = data?.activity;

  const [formData, setFormData] = useState({
    callsMade: 0,
    appointmentsScheduled: 0,
    appointmentsCompleted: 0,
    applicationsSubmitted: 0,
    preQualsCompleted: 0,
    creditPulls: 0,
    followUps: 0,
    realtorMeetings: 0,
    notes: "",
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        callsMade: activity.callsMade || 0,
        appointmentsScheduled: activity.appointmentsScheduled || 0,
        appointmentsCompleted: activity.appointmentsCompleted || 0,
        applicationsSubmitted: activity.applicationsSubmitted || 0,
        preQualsCompleted: activity.preQualsCompleted || 0,
        creditPulls: activity.creditPulls || 0,
        followUps: activity.followUps || 0,
        realtorMeetings: activity.realtorMeetings || 0,
        notes: activity.notes || "",
      });
    } else {
      setFormData({
        callsMade: 0,
        appointmentsScheduled: 0,
        appointmentsCompleted: 0,
        applicationsSubmitted: 0,
        preQualsCompleted: 0,
        creditPulls: 0,
        followUps: 0,
        realtorMeetings: 0,
        notes: "",
      });
    }
  }, [activity]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (activity?.id) {
        return await apiRequest("PUT", `/api/employee/daily-activities/${activity.id}`, formData);
      } else {
        return await apiRequest("POST", "/api/employee/daily-activities", {
          ...formData,
          activityDate: selectedDate,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/employee/daily-activities/${selectedDate}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/employee/daily-activities"] });
      toast({
        title: "Success",
        description: "Daily activity saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save daily activity",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "notes" ? value : parseInt(value as string) || 0,
    }));
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const activityFields = [
    { key: "callsMade", label: "Calls Made", icon: Phone, color: "text-blue-600" },
    { key: "appointmentsScheduled", label: "Appointments Scheduled", icon: Calendar, color: "text-purple-600" },
    { key: "appointmentsCompleted", label: "Appointments Completed", icon: Calendar, color: "text-green-600" },
    { key: "applicationsSubmitted", label: "Applications Submitted", icon: FileText, color: "text-orange-600" },
    { key: "preQualsCompleted", label: "Pre-Qualifications", icon: FileText, color: "text-teal-600" },
    { key: "creditPulls", label: "Credit Pulls", icon: CreditCard, color: "text-red-600" },
    { key: "followUps", label: "Follow-Ups", icon: MessageSquare, color: "text-indigo-600" },
    { key: "realtorMeetings", label: "Realtor Meetings", icon: Users, color: "text-pink-600" },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Daily Activity Log
        </CardTitle>
        <CardDescription>Track your daily mortgage activities and interactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={format(new Date(), "yyyy-MM-dd")}
            data-testid="input-activity-date"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activityFields.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                {label}
              </Label>
              <Input
                id={key}
                type="number"
                min="0"
                value={formData[key as keyof typeof formData]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                data-testid={`input-${key}`}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any important notes or highlights from today..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={4}
            data-testid="input-notes"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="w-full"
          data-testid="button-save-activity"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Activity"}
        </Button>
      </CardContent>
    </Card>
  );
}
