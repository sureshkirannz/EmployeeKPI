import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, CoachingNote } from "@shared/schema";

export default function CoachingFeedback() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const { toast } = useToast();

  const { data: employeesData } = useQuery<{ employees: User[] }>({
    queryKey: ["/api/admin/employees"],
  });

  const employees = employeesData?.employees || [];

  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    noteType: "feedback",
    actionItems: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/coaching-notes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/coaching-notes"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Coaching note created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create coaching note",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      subject: "",
      content: "",
      noteType: "feedback",
      actionItems: "",
    });
    setSelectedEmployee("");
  };

  const handleSave = () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      ...formData,
      employeeId: selectedEmployee,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Coaching & Feedback
            </CardTitle>
            <CardDescription>Provide feedback and coaching to your team</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-coaching-note" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Coaching Note</DialogTitle>
                <DialogDescription>Provide feedback or coaching to an employee</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger data-testid="select-employee">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.employeeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noteType">Note Type</Label>
                  <Select
                    value={formData.noteType}
                    onValueChange={(value) => setFormData({ ...formData, noteType: value })}
                  >
                    <SelectTrigger data-testid="select-note-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="coaching">Coaching</SelectItem>
                      <SelectItem value="praise">Praise</SelectItem>
                      <SelectItem value="improvement">Improvement Area</SelectItem>
                      <SelectItem value="goal-setting">Goal Setting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Great week with applications"
                    data-testid="input-subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Feedback / Notes</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Detailed feedback or coaching notes..."
                    rows={6}
                    data-testid="input-content"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionItems">Action Items (Optional)</Label>
                  <Textarea
                    id="actionItems"
                    value={formData.actionItems}
                    onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                    placeholder="Specific actions or next steps..."
                    rows={3}
                    data-testid="input-action-items"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={createMutation.isPending} data-testid="button-save-note">
                  {createMutation.isPending ? "Saving..." : "Save Note"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Click "Add Note" to create coaching feedback for your team members
        </div>
      </CardContent>
    </Card>
  );
}
