import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Employee {
  id?: string;
  username: string;
  employeeName: string;
  role: string;
  password?: string;
}

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (employee: Employee) => Promise<void>;
  employee?: Employee | null;
}

export default function EmployeeFormDialog({ open, onClose, onSubmit, employee }: EmployeeFormDialogProps) {
  const [formData, setFormData] = useState<Employee>({
    username: employee?.username || "",
    employeeName: employee?.employeeName || "",
    role: employee?.role || "employee",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSubmit = employee?.id
        ? { id: employee.id, ...formData }
        : formData;

      if (employee?.id && !formData.password) {
        delete dataToSubmit.password;
      }

      await onSubmit(dataToSubmit);
      onClose();
      setFormData({
        username: "",
        employeeName: "",
        role: "employee",
        password: "",
      });
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {employee
              ? "Update employee information below."
              : "Enter the details for the new employee."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Full Name</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="Enter full name"
                required
                data-testid="input-employee-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {employee && "(leave blank to keep current)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required={!employee}
                minLength={6}
                data-testid="input-password"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role" data-testid="select-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="button-save">
              {isSubmitting ? "Saving..." : employee ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
