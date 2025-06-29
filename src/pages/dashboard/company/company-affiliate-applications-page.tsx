import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    AffiliateApplication,
    bulkReviewApplications,
    getAffiliateApplications,
    GetApplicationsParams,
    reviewAffiliateApplication,
} from "@/services/affiliate-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Check,
    CheckCheck,
    Clock,
    Eye,
    MoreHorizontal,
    Search,
    User, X,
    XCircle
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function CompanyAffiliateApplicationsPage() {
  const { toast } = useToast();
  const company = useSelector((state: RootState) => state.company.company);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<AffiliateApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);

  const queryParams: GetApplicationsParams = {
    page: currentPage,
    limit: 20,
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["affiliate-applications", company?.ID, queryParams],
    queryFn: () => getAffiliateApplications(company!.ID, queryParams),
    refetchOnWindowFocus: false,
    enabled: !!company?.ID,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ applicationId, action, notes }: { applicationId: number; action: 'approve' | 'reject'; notes?: string }) =>
      reviewAffiliateApplication(company!.ID, applicationId, { action, reviewer_notes: notes }),
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Application ${variables.action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["affiliate-applications"] });
      setReviewDialogOpen(false);
      setCurrentApplication(null);
      setReviewNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review application",
        variant: "destructive",
      });
    },
  });

  const bulkReviewMutation = useMutation({
    mutationFn: ({ applicationIds, action, notes }: { applicationIds: number[]; action: 'approve' | 'reject'; notes?: string }) =>
      bulkReviewApplications(company!.ID, applicationIds, action, notes),
    onSuccess: (result, variables) => {
      toast({
        title: "Success",
        description: `${result?.data?.processed} applications ${variables.action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["affiliate-applications"] });
      setBulkDialogOpen(false);
      setSelectedApplications([]);
      setReviewNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process bulk review",
        variant: "destructive",
      });
    },
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch applications",
      variant: "destructive",
    });
  }

  const applications = applicationsData?.data?.applications || [];
  const pagination = applicationsData?.data?.pagination;
  const pendingCount = applications.filter(app => app.application_status === 'pending').length;

  const handleSingleReview = (application: AffiliateApplication, action: 'approve' | 'reject') => {
    setCurrentApplication(application);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const handleBulkReview = (action: 'approve' | 'reject') => {
    if (selectedApplications.length === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select applications to review",
        variant: "destructive",
      });
      return;
    }
    setBulkAction(action);
    setBulkDialogOpen(true);
  };

  const confirmReview = () => {
    if (!currentApplication || !reviewAction) return;
    reviewMutation.mutate({
      applicationId: currentApplication.ID,
      action: reviewAction,
      notes: reviewNotes,
    });
  };

  const confirmBulkReview = () => {
    if (!bulkAction) return;
    bulkReviewMutation.mutate({
      applicationIds: selectedApplications,
      action: bulkAction,
      notes: reviewNotes,
    });
  };

  const toggleApplicationSelection = (applicationId: number) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const toggleSelectAll = () => {
    const pendingApplicationIds = applications
      .filter(app => app.application_status === 'pending')
      .map(app => app.ID);
    
    setSelectedApplications(prev => 
      prev.length === pendingApplicationIds.length ? [] : pendingApplicationIds
    );
  };

  if (!company) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center text-xl">
            <AppBarBackButton destination="Affiliates" />
            {company.company_name} &gt; Affiliate Applications
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              Refresh
            </Button>
            {selectedApplications.length > 0 && (
              <>
                <Button 
                  onClick={() => handleBulkReview('approve')}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Approve Selected ({selectedApplications.length})
                </Button>
                <Button 
                  onClick={() => handleBulkReview('reject')}
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Selected ({selectedApplications.length})
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? `Approve ${currentApplication?.full_name}'s affiliate application?`
                : `Reject ${currentApplication?.full_name}'s affiliate application?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add review notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              disabled={reviewMutation.isPending}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
            >
              {reviewMutation.isPending ? 'Processing...' : `${reviewAction === 'approve' ? 'Approve' : 'Reject'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Review Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bulk {bulkAction === 'approve' ? 'Approve' : 'Reject'} Applications
            </DialogTitle>
            <DialogDescription>
              {bulkAction === 'approve' 
                ? `Approve ${selectedApplications.length} selected applications?`
                : `Reject ${selectedApplications.length} selected applications?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add review notes for all selected applications..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmBulkReview}
              disabled={bulkReviewMutation.isPending}
              variant={bulkAction === 'approve' ? 'default' : 'destructive'}
            >
              {bulkReviewMutation.isPending ? 'Processing...' : `${bulkAction === 'approve' ? 'Approve' : 'Reject'} ${selectedApplications.length} Applications`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(app => app.application_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Applications</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(app => app.application_status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Applications</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(app => app.application_status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div>Loading applications...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedApplications.length === applications.filter(app => app.application_status === 'pending').length && applications.filter(app => app.application_status === 'pending').length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <TableRow key={application.ID}>
                      <TableCell>
                        <Checkbox
                          checked={selectedApplications.includes(application.ID)}
                          onCheckedChange={() => toggleApplicationSelection(application.ID)}
                          disabled={application.application_status !== 'pending'}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {application.full_name}
                      </TableCell>
                      <TableCell className="lowercase">
                        {application.email}
                      </TableCell>
                      <TableCell>{application.phone}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {application.city && application.state
                            ? `${application.city}, ${application.state}`
                            : application.city || application.state || "Not provided"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            application.application_status === 'approved' 
                              ? 'default' 
                              : application.application_status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {application.application_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(application.applied_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {application.application_status === 'pending' ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleSingleReview(application, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSingleReview(application, 'reject')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                View as Affiliate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= pagination.total_pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 