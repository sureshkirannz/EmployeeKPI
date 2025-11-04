import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface KPITarget {
  id?: string;
  employeeId: string;
  year: number;
  annualVolumeGoal: string;
  avgLoanAmount: string;
  requiredUnitsMonthly: number;
  lockPercentage: string;
  lockedLoansMonthly: number;
  newFileToLockedPercentage: string;
  newFilesMonthly: string;
}

interface SalesTarget {
  id?: string;
  employeeId: string;
  year: number;
  eventsTarget: number;
  meetingsTarget: number;
  thankyouTarget: number;
  prospectingTarget: number;
  videosTarget: number;
}

interface KPITargetDialogProps {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

export default function KPITargetDialog({ open, onClose, employeeId, employeeName }: KPITargetDialogProps) {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();

  const [kpiData, setKpiData] = useState<Partial<KPITarget>>({
    employeeId,
    year: currentYear,
    annualVolumeGoal: "",
    avgLoanAmount: "",
    requiredUnitsMonthly: 0,
    lockPercentage: "",
    lockedLoansMonthly: 0,
    newFileToLockedPercentage: "",
    newFilesMonthly: "",
  });

  const [salesData, setSalesData] = useState<Partial<SalesTarget>>({
    employeeId,
    year: currentYear,
    eventsTarget: 52,
    meetingsTarget: 240,
    thankyouTarget: 365,
    prospectingTarget: 365,
    videosTarget: 365,
  });

  const { data: existingKpiData } = useQuery<{ target: KPITarget | null }>({
    queryKey: ["/api/admin/kpi-targets", employeeId, currentYear],
    enabled: open,
  });

  const { data: existingSalesData } = useQuery<{ target: SalesTarget | null }>({
    queryKey: ["/api/admin/sales-targets", employeeId, currentYear],
    enabled: open,
  });

  useEffect(() => {
    if (existingKpiData?.target) {
      setKpiData(existingKpiData.target);
    }
  }, [existingKpiData]);

  useEffect(() => {
    if (existingSalesData?.target) {
      setSalesData(existingSalesData.target);
    }
  }, [existingSalesData]);

  const saveKpiMutation = useMutation({
    mutationFn: async (data: Partial<KPITarget>) => {
      if (existingKpiData?.target?.id) {
        const response = await apiRequest("PUT", `/api/admin/kpi-targets/${existingKpiData.target.id}`, data);
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/admin/kpi-targets", data);
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kpi-targets"] });
      toast({ title: "Success", description: "KPI targets saved successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save KPI targets",
        variant: "destructive",
      });
    },
  });

  const saveSalesMutation = useMutation({
    mutationFn: async (data: Partial<SalesTarget>) => {
      if (existingSalesData?.target?.id) {
        const response = await apiRequest("PUT", `/api/admin/sales-targets/${existingSalesData.target.id}`, data);
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/admin/sales-targets", data);
        return await response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sales-targets"] });
      toast({ title: "Success", description: "Sales targets saved successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save sales targets",
        variant: "destructive",
      });
    },
  });

  const handleSaveAll = async () => {
    // Validate KPI data
    const volumeGoal = parseFloat(kpiData.annualVolumeGoal || "0");
    const avgLoan = parseFloat(kpiData.avgLoanAmount || "0");
    const lockPct = parseFloat(kpiData.lockPercentage || "0");
    const newFilePct = parseFloat(kpiData.newFileToLockedPercentage || "0");
    const newFilesMonthly = parseFloat(kpiData.newFilesMonthly || "0");

    if (volumeGoal <= 0) {
      toast({
        title: "Validation Error",
        description: "Annual volume goal must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (avgLoan <= 0) {
      toast({
        title: "Validation Error",
        description: "Average loan amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!kpiData.requiredUnitsMonthly || kpiData.requiredUnitsMonthly <= 0) {
      toast({
        title: "Validation Error",
        description: "Required units monthly must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (lockPct < 0 || lockPct > 100) {
      toast({
        title: "Validation Error",
        description: "Lock percentage must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    if (!kpiData.lockedLoansMonthly || kpiData.lockedLoansMonthly <= 0) {
      toast({
        title: "Validation Error",
        description: "Locked loans monthly must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (newFilePct < 0 || newFilePct > 100) {
      toast({
        title: "Validation Error",
        description: "New file to locked percentage must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    if (newFilesMonthly < 0) {
      toast({
        title: "Validation Error",
        description: "New files monthly cannot be negative",
        variant: "destructive",
      });
      return;
    }

    // Validate sales targets (allow 0, reject negative)
    if (salesData.eventsTarget === undefined || salesData.eventsTarget === null || salesData.eventsTarget < 0) {
      toast({
        title: "Validation Error",
        description: "Events target must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    if (salesData.meetingsTarget === undefined || salesData.meetingsTarget === null || salesData.meetingsTarget < 0) {
      toast({
        title: "Validation Error",
        description: "Meetings target must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    if (salesData.thankyouTarget === undefined || salesData.thankyouTarget === null || salesData.thankyouTarget < 0) {
      toast({
        title: "Validation Error",
        description: "Thank you cards target must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    if (salesData.prospectingTarget === undefined || salesData.prospectingTarget === null || salesData.prospectingTarget < 0) {
      toast({
        title: "Validation Error",
        description: "Prospecting target must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    if (salesData.videosTarget === undefined || salesData.videosTarget === null || salesData.videosTarget < 0) {
      toast({
        title: "Validation Error",
        description: "Videos target must be 0 or greater",
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.all([
        saveKpiMutation.mutateAsync(kpiData),
        saveSalesMutation.mutateAsync(salesData),
      ]);
      onClose();
    } catch (error) {
      // Error already handled by mutations
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Targets for {employeeName}</DialogTitle>
          <DialogDescription>
            Configure KPI and sales targets for {currentYear}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="kpi" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kpi">KPI Targets</TabsTrigger>
            <TabsTrigger value="sales">Sales Targets</TabsTrigger>
          </TabsList>

          <TabsContent value="kpi" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualVolumeGoal">Annual Volume Goal ($)</Label>
                <Input
                  id="annualVolumeGoal"
                  type="number"
                  value={kpiData.annualVolumeGoal}
                  onChange={(e) => setKpiData({ ...kpiData, annualVolumeGoal: e.target.value })}
                  placeholder="100000000"
                  data-testid="input-annual-volume"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avgLoanAmount">Average Loan Amount ($)</Label>
                <Input
                  id="avgLoanAmount"
                  type="number"
                  value={kpiData.avgLoanAmount}
                  onChange={(e) => setKpiData({ ...kpiData, avgLoanAmount: e.target.value })}
                  placeholder="350000"
                  data-testid="input-avg-loan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredUnitsMonthly">Required Units Closed Monthly</Label>
                <Input
                  id="requiredUnitsMonthly"
                  type="number"
                  value={kpiData.requiredUnitsMonthly}
                  onChange={(e) => setKpiData({ ...kpiData, requiredUnitsMonthly: parseInt(e.target.value) || 0 })}
                  placeholder="24"
                  data-testid="input-required-units"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockPercentage">Lock % to Closing</Label>
                <Input
                  id="lockPercentage"
                  type="number"
                  step="0.01"
                  value={kpiData.lockPercentage}
                  onChange={(e) => setKpiData({ ...kpiData, lockPercentage: e.target.value })}
                  placeholder="90.00"
                  data-testid="input-lock-percentage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockedLoansMonthly">Number of Locked Loans Monthly</Label>
                <Input
                  id="lockedLoansMonthly"
                  type="number"
                  value={kpiData.lockedLoansMonthly}
                  onChange={(e) => setKpiData({ ...kpiData, lockedLoansMonthly: parseInt(e.target.value) || 0 })}
                  placeholder="26"
                  data-testid="input-locked-loans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newFileToLockedPercentage">New File to Locked Loan %</Label>
                <Input
                  id="newFileToLockedPercentage"
                  type="number"
                  step="0.01"
                  value={kpiData.newFileToLockedPercentage}
                  onChange={(e) => setKpiData({ ...kpiData, newFileToLockedPercentage: e.target.value })}
                  placeholder="55.00"
                  data-testid="input-new-file-percentage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newFilesMonthly">Number of New Files Created Monthly</Label>
                <Input
                  id="newFilesMonthly"
                  type="number"
                  step="0.01"
                  value={kpiData.newFilesMonthly}
                  onChange={(e) => setKpiData({ ...kpiData, newFilesMonthly: e.target.value })}
                  placeholder="48.10"
                  data-testid="input-new-files"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventsTarget">Events (Yearly)</Label>
                <Input
                  id="eventsTarget"
                  type="number"
                  value={salesData.eventsTarget}
                  onChange={(e) => setSalesData({ ...salesData, eventsTarget: parseInt(e.target.value) || 0 })}
                  placeholder="52"
                  data-testid="input-events-target"
                />
                <p className="text-xs text-muted-foreground">Recommended: 52 (1 per week)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingsTarget">1-to-1 Meetings (Yearly)</Label>
                <Input
                  id="meetingsTarget"
                  type="number"
                  value={salesData.meetingsTarget}
                  onChange={(e) => setSalesData({ ...salesData, meetingsTarget: parseInt(e.target.value) || 0 })}
                  placeholder="240"
                  data-testid="input-meetings-target"
                />
                <p className="text-xs text-muted-foreground">Recommended: 240</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thankyouTarget">Thank You Cards/Gifts (Yearly)</Label>
                <Input
                  id="thankyouTarget"
                  type="number"
                  value={salesData.thankyouTarget}
                  onChange={(e) => setSalesData({ ...salesData, thankyouTarget: parseInt(e.target.value) || 0 })}
                  placeholder="365"
                  data-testid="input-thankyou-target"
                />
                <p className="text-xs text-muted-foreground">Recommended: 365 (1 per day)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prospectingTarget">Prospecting Calls (Yearly)</Label>
                <Input
                  id="prospectingTarget"
                  type="number"
                  value={salesData.prospectingTarget}
                  onChange={(e) => setSalesData({ ...salesData, prospectingTarget: parseInt(e.target.value) || 0 })}
                  placeholder="365"
                  data-testid="input-prospecting-target"
                />
                <p className="text-xs text-muted-foreground">Recommended: 365 (1 per day)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videosTarget">Social Media Videos (Yearly)</Label>
                <Input
                  id="videosTarget"
                  type="number"
                  value={salesData.videosTarget}
                  onChange={(e) => setSalesData({ ...salesData, videosTarget: parseInt(e.target.value) || 0 })}
                  placeholder="365"
                  data-testid="input-videos-target"
                />
                <p className="text-xs text-muted-foreground">Recommended: 365 (1 per day)</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={saveKpiMutation.isPending || saveSalesMutation.isPending}
            data-testid="button-save-targets"
          >
            {(saveKpiMutation.isPending || saveSalesMutation.isPending) ? "Saving..." : "Save All Targets"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
