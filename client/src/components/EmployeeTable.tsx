import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus, Target } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  username: string;
  role: string;
  volumeProgress: number;
  unitsProgress: number;
  status: "behind" | "at-risk" | "on-track" | "exceeded";
}

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSetTargets?: (id: string) => void;
}

export default function EmployeeTable({ employees, onEdit, onDelete, onAdd, onSetTargets }: EmployeeTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "behind":
        return "bg-destructive text-destructive-foreground";
      case "at-risk":
        return "bg-yellow-500 text-white";
      case "on-track":
        return "bg-green-600 text-white";
      case "exceeded":
        return "bg-blue-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "behind":
        return "Behind";
      case "at-risk":
        return "At Risk";
      case "on-track":
        return "On Track";
      case "exceeded":
        return "Exceeded";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Employees</CardTitle>
        <Button onClick={onAdd} data-testid="button-add-employee">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Volume Progress</TableHead>
                <TableHead className="text-right">Units Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="text-muted-foreground">{employee.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{employee.volumeProgress}%</TableCell>
                  <TableCell className="text-right font-mono">{employee.unitsProgress}%</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(employee.status)}>
                      {getStatusLabel(employee.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onSetTargets && employee.role === "employee" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSetTargets(employee.id)}
                          data-testid={`button-targets-${employee.id}`}
                          title="Set KPI Targets"
                        >
                          <Target className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(employee.id)}
                        data-testid={`button-edit-${employee.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(employee.id)}
                        data-testid={`button-delete-${employee.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
