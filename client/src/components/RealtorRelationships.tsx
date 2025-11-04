import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Phone, Mail, Building, Calendar, Award } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { RealtorPartner } from "@shared/schema";

const RELATIONSHIP_STRENGTHS = [
  { value: "new", label: "New Contact", color: "bg-slate-200 text-slate-800" },
  { value: "developing", label: "Developing", color: "bg-blue-200 text-blue-800" },
  { value: "strong", label: "Strong", color: "bg-green-200 text-green-800" },
  { value: "champion", label: "Champion", color: "bg-purple-200 text-purple-800" },
];

export default function RealtorRelationships() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<RealtorPartner | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ partners: RealtorPartner[] }>({
    queryKey: ["/api/employee/realtor-partners"],
  });

  const partners = data?.partners || [];

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    lastContactDate: "",
    relationshipStrength: "new",
    loansReferred: "0",
    notes: "",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPartner) {
        return await apiRequest("PUT", `/api/employee/realtor-partners/${editingPartner.id}`, data);
      } else {
        return await apiRequest("POST", "/api/employee/realtor-partners", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/realtor-partners"] });
      setIsDialogOpen(false);
      setEditingPartner(null);
      resetForm();
      toast({
        title: "Success",
        description: editingPartner ? "Realtor updated successfully" : "Realtor added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save realtor",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/employee/realtor-partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/realtor-partners"] });
      toast({
        title: "Success",
        description: "Realtor deleted successfully",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
      lastContactDate: "",
      relationshipStrength: "new",
      loansReferred: "0",
      notes: "",
    });
  };

  const handleEdit = (partner: RealtorPartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || "",
      company: partner.company || "",
      phone: partner.phone || "",
      email: partner.email || "",
      lastContactDate: partner.lastContactDate || "",
      relationshipStrength: partner.relationshipStrength || "new",
      loansReferred: partner.loansReferred?.toString() || "0",
      notes: partner.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      ...formData,
      loansReferred: parseInt(formData.loansReferred) || 0,
    });
  };

  const getRelationshipBadge = (strength: string) => {
    const rel = RELATIONSHIP_STRENGTHS.find((r) => r.value === strength);
    return rel ? <Badge className={rel.color}>{rel.label}</Badge> : null;
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
              <Users className="h-5 w-5" />
              Realtor Relationships
            </CardTitle>
            <CardDescription>Manage your realtor partnerships and referral sources</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-realtor" onClick={() => {
                setEditingPartner(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Realtor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPartner ? "Edit Realtor" : "Add New Realtor"}</DialogTitle>
                <DialogDescription>Track your realtor partnerships</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-realtor-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      data-testid="input-company"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastContactDate">Last Contact</Label>
                    <Input
                      id="lastContactDate"
                      type="date"
                      value={formData.lastContactDate}
                      onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
                      data-testid="input-last-contact-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationshipStrength">Relationship</Label>
                    <Select
                      value={formData.relationshipStrength}
                      onValueChange={(value) => setFormData({ ...formData, relationshipStrength: value })}
                    >
                      <SelectTrigger data-testid="select-relationship-strength">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_STRENGTHS.map((rel) => (
                          <SelectItem key={rel.value} value={rel.value}>
                            {rel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loansReferred">Loans Referred</Label>
                    <Input
                      id="loansReferred"
                      type="number"
                      min="0"
                      value={formData.loansReferred}
                      onChange={(e) => setFormData({ ...formData, loansReferred: e.target.value })}
                      data-testid="input-loans-referred"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any important notes about this realtor..."
                    rows={3}
                    data-testid="input-realtor-notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-realtor">
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No realtor partners yet. Click "Add Realtor" to start tracking your relationships.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <Card
                key={partner.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleEdit(partner)}
                data-testid={`card-realtor-${partner.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      {partner.company && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          {partner.company}
                        </CardDescription>
                      )}
                    </div>
                    {getRelationshipBadge(partner.relationshipStrength)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {partner.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {partner.phone}
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {partner.email}
                    </div>
                  )}
                  {partner.lastContactDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Last contact: {format(new Date(partner.lastContactDate), "MMM d, yyyy")}
                    </div>
                  )}
                  {partner.loansReferred && partner.loansReferred > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                      <Award className="h-3 w-3" />
                      {partner.loansReferred} loans referred
                    </div>
                  )}
                  {partner.notes && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">{partner.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
