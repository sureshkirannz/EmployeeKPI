import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, User, TrendingUp, Calendar } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Loan } from "@shared/schema";

const PIPELINE_STAGES = [
  { value: "lead", label: "Leads", color: "bg-slate-200 text-slate-800" },
  { value: "pre-qual", label: "Pre-Qualified", color: "bg-blue-200 text-blue-800" },
  { value: "application", label: "Application", color: "bg-purple-200 text-purple-800" },
  { value: "processing", label: "Processing", color: "bg-yellow-200 text-yellow-800" },
  { value: "locked", label: "Locked", color: "bg-orange-200 text-orange-800" },
  { value: "closed", label: "Closed", color: "bg-green-200 text-green-800" },
];

const LOAN_TYPES = ["purchase", "refinance", "heloc", "construction"];

export default function LoanPipelineBoard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();

  const { data, isLoading } = useQuery<{ loans: Loan[] }>({
    queryKey: ["/api/employee/loans", { year: currentYear }],
  });

  const loans = data?.loans || [];

  const [formData, setFormData] = useState({
    borrowerName: "",
    loanAmount: "",
    loanType: "purchase",
    status: "lead",
    expectedCloseDate: "",
    referralSource: "",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingLoan) {
        return await apiRequest("PUT", `/api/employee/loans/${editingLoan.id}`, data);
      } else {
        return await apiRequest("POST", "/api/employee/loans", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/loans"] });
      setIsDialogOpen(false);
      setEditingLoan(null);
      resetForm();
      toast({
        title: "Success",
        description: editingLoan ? "Loan updated successfully" : "Loan added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save loan",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ loanId, status }: { loanId: string; status: string }) => {
      const updateData: any = { status };
      if (status === "locked") {
        updateData.lockedDate = format(new Date(), "yyyy-MM-dd");
      }
      if (status === "closed") {
        updateData.closedDate = format(new Date(), "yyyy-MM-dd");
      }
      return await apiRequest("PUT", `/api/employee/loans/${loanId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/loans"] });
      toast({
        title: "Success",
        description: "Loan status updated",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      borrowerName: "",
      loanAmount: "",
      loanType: "purchase",
      status: "lead",
      expectedCloseDate: "",
      referralSource: "",
    });
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({
      borrowerName: loan.borrowerName || "",
      loanAmount: loan.loanAmount || "",
      loanType: loan.loanType || "purchase",
      status: loan.status || "lead",
      expectedCloseDate: loan.expectedCloseDate || "",
      referralSource: loan.referralSource || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const getLoansByStage = (stage: string) => {
    return loans.filter((loan) => loan.status === stage);
  };

  const calculateStageValue = (stage: string) => {
    const stageLoans = getLoansByStage(stage);
    return stageLoans.reduce((sum, loan) => sum + parseFloat(loan.loanAmount || "0"), 0);
  };

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Loan Pipeline
            </CardTitle>
            <CardDescription>Track loans through each stage of the process</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-loan" onClick={() => {
                setEditingLoan(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Loan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLoan ? "Edit Loan" : "Add New Loan"}</DialogTitle>
                <DialogDescription>Enter the loan details below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="borrowerName">Borrower Name</Label>
                  <Input
                    id="borrowerName"
                    value={formData.borrowerName}
                    onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                    data-testid="input-borrower-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                    data-testid="input-loan-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select value={formData.loanType} onValueChange={(value) => setFormData({ ...formData, loanType: value })}>
                    <SelectTrigger data-testid="select-loan-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                  <Input
                    id="expectedCloseDate"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                    data-testid="input-expected-close-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralSource">Referral Source</Label>
                  <Input
                    id="referralSource"
                    value={formData.referralSource}
                    onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    placeholder="e.g., Realtor name, website, etc."
                    data-testid="input-referral-source"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-loan">
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageLoans = getLoansByStage(stage.value);
            const stageValue = calculateStageValue(stage.value);

            return (
              <div key={stage.value} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={stage.color} data-testid={`badge-${stage.value}`}>
                    {stage.label} ({stageLoans.length})
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-muted-foreground">
                  ${stageValue.toLocaleString()}
                </div>
                <div className="space-y-2">
                  {stageLoans.map((loan) => (
                    <Card
                      key={loan.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleEdit(loan)}
                      data-testid={`card-loan-${loan.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-3 w-3" />
                          {loan.borrowerName || "Unnamed"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          ${parseFloat(loan.loanAmount).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {loan.loanType}
                        </div>
                        {loan.expectedCloseDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(loan.expectedCloseDate), "MMM d")}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
