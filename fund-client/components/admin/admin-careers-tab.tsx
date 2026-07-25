"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Globe,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  careersAPI,
  type JobPosting,
  type JobPostingStatus,
  type JobApplication,
  type JobApplicationStatus,
  type CareerInquiry,
  type CareerInquiryStatus,
} from "@/lib/careers-api";
import websocketService from "@/lib/websocket";

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Marketing",
  "Design",
  "Operations",
  "Sales",
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const emptyForm = {
  title: "",
  department: "Engineering",
  location: "Remote",
  jobType: "Full-time",
  description: "",
  requirements: "",
  status: "draft" as JobPostingStatus,
};

export function AdminCareersTab() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("jobs");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [inquiries, setInquiries] = useState<CareerInquiry[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [appsTotal, setAppsTotal] = useState(0);
  const [inquiriesTotal, setInquiriesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [viewApplication, setViewApplication] = useState<JobApplication | null>(
    null
  );
  const [viewInquiry, setViewInquiry] = useState<CareerInquiry | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const params: {
        search?: string;
        status?: JobPostingStatus;
        limit?: number;
      } = { limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter as JobPostingStatus;

      const data = await careersAPI.getAllAdmin(params);
      setJobs(data.jobs);
      setJobsTotal(data.total);
    } catch {
      toast({
        title: "Failed to load job postings",
        description: "Ensure the backend is running and careers migration is applied.",
        variant: "destructive",
      });
    }
  }, [search, statusFilter, toast]);

  const loadApplications = useCallback(async () => {
    try {
      const data = await careersAPI.getApplications({ limit: 100 });
      setApplications(data.applications);
      setAppsTotal(data.total);
    } catch {
      toast({ title: "Failed to load applications", variant: "destructive" });
    }
  }, [toast]);

  const loadInquiries = useCallback(async () => {
    try {
      const data = await careersAPI.getInquiries({ limit: 100 });
      setInquiries(data.inquiries);
      setInquiriesTotal(data.total);
    } catch {
      toast({ title: "Failed to load inquiries", variant: "destructive" });
    }
  }, [toast]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadJobs(), loadApplications(), loadInquiries()]);
    setLoading(false);
  }, [loadJobs, loadApplications, loadInquiries]);

  useEffect(() => {
    const t = setTimeout(loadAll, 300);
    return () => clearTimeout(t);
  }, [loadAll]);

  useEffect(() => {
    websocketService.connect();
    websocketService.joinCareersFeed();

    const handleUpdate = () => {
      loadAll();
    };

    websocketService.onCareersUpdate(handleUpdate);
    websocketService.onCareersFeedChanged(handleUpdate);

    return () => {
      websocketService.off("careers-updated", handleUpdate);
      websocketService.off("careers-feed-changed", handleUpdate);
      websocketService.leaveCareersFeed();
    };
  }, [loadAll]);

  const openCreate = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (job: JobPosting) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      department: job.department,
      location: job.location,
      jobType: job.jobType,
      description: job.description,
      requirements: job.requirements.join("\n"),
      status: job.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async (publishNow = false) => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({
        title: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        department: form.department,
        location: form.location,
        jobType: form.jobType,
        description: form.description.trim(),
        requirements: form.requirements
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
        status: publishNow ? ("published" as JobPostingStatus) : form.status,
      };

      if (editingJob) {
        await careersAPI.update(editingJob.id, payload);
        if (publishNow && editingJob.status !== "published") {
          await careersAPI.publish(editingJob.id, true);
        } else if (
          !publishNow &&
          editingJob.status === "published" &&
          form.status === "draft"
        ) {
          await careersAPI.publish(editingJob.id, false);
        }
        toast({ title: "Job posting updated" });
      } else {
        const created = await careersAPI.create(payload);
        if (publishNow && created.status !== "published") {
          await careersAPI.publish(created.id, true);
        }
        toast({
          title: publishNow ? "Job published" : "Draft saved",
        });
      }

      setDialogOpen(false);
      await loadAll();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string, publish: boolean) => {
    setActionId(id);
    try {
      await careersAPI.publish(id, publish);
      toast({ title: publish ? "Published" : "Unpublished" });
      await loadAll();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const handleClose = async (id: string) => {
    setActionId(id);
    try {
      await careersAPI.close(id);
      toast({ title: "Position closed" });
      await loadAll();
    } catch {
      toast({ title: "Close failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting permanently?")) return;
    setActionId(id);
    try {
      await careersAPI.delete(id);
      toast({ title: "Job posting deleted" });
      await loadAll();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const handleApplicationStatus = async (
    id: string,
    status: JobApplicationStatus
  ) => {
    setActionId(id);
    try {
      await careersAPI.updateApplicationStatus(id, status);
      toast({ title: "Application status updated" });
      await loadApplications();
      setViewApplication(null);
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const handleInquiryStatus = async (
    id: string,
    status: CareerInquiryStatus
  ) => {
    setActionId(id);
    try {
      await careersAPI.updateInquiryStatus(id, status);
      toast({ title: "Inquiry status updated" });
      await loadInquiries();
      setViewInquiry(null);
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const statusColor = (status: JobPostingStatus) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "closed":
        return "outline";
    }
  };

  const appStatusColor = (status: JobApplicationStatus) => {
    switch (status) {
      case "new":
        return "default";
      case "shortlisted":
        return "default";
      case "reviewed":
        return "secondary";
      case "rejected":
        return "destructive";
      case "hired":
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Careers Management</h2>
          <p className="text-muted-foreground">
            Publish job openings, review applications, and manage inquiries in
            real time
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Job Posting
        </Button>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList>
          <TabsTrigger value="jobs">
            <Briefcase className="w-4 h-4 mr-1" />
            Jobs ({jobsTotal})
          </TabsTrigger>
          <TabsTrigger value="applications">
            <User className="w-4 h-4 mr-1" />
            Applications ({appsTotal})
          </TabsTrigger>
          <TabsTrigger value="inquiries">
            <Mail className="w-4 h-4 mr-1" />
            Inquiries ({inquiriesTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job postings..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No job postings yet. Create your first opening.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{job.title}</h3>
                          <Badge variant={statusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{job.department}</span>
                          <span>{job.location}</span>
                          <span>{job.jobType}</span>
                          <span>{job.applicationCount} applications</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.status === "published" && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href="/careers"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(job)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {job.status === "draft" && (
                          <Button
                            size="sm"
                            disabled={actionId === job.id}
                            onClick={() => handlePublish(job.id, true)}
                          >
                            {actionId === job.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Globe className="w-4 h-4 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                        )}
                        {job.status === "published" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionId === job.id}
                              onClick={() => handlePublish(job.id, false)}
                            >
                              Unpublish
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionId === job.id}
                              onClick={() => handleClose(job.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Close
                            </Button>
                          </>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={actionId === job.id}
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>
                Review and manage candidate applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No applications received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setViewApplication(app)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{app.fullName}</span>
                          <Badge variant={appStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.jobTitle} · {app.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Inquiries</CardTitle>
              <CardDescription>
                Messages from the &quot;Don&apos;t See Your Role?&quot; form
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inquiries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No inquiries received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setViewInquiry(inquiry)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{inquiry.fullName}</span>
                          <Badge variant="secondary">{inquiry.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {inquiry.interestedRole} · {inquiry.email}
                        </p>
                        <p className="text-sm line-clamp-1 mt-1">
                          {inquiry.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Edit Job Posting" : "Create Job Posting"}
            </DialogTitle>
            <DialogDescription>
              Define the role details. Publish to make it live on the careers
              page instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="job-title">Title</Label>
              <Input
                id="job-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Senior Blockchain Developer"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="Remote"
                />
              </div>
              <div>
                <Label>Job Type</Label>
                <Select
                  value={form.jobType}
                  onValueChange={(v) => setForm({ ...form, jobType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the role and responsibilities..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="requirements">
                Requirements (one per line)
              </Label>
              <Textarea
                id="requirements"
                value={form.requirements}
                onChange={(e) =>
                  setForm({ ...form, requirements: e.target.value })
                }
                placeholder={"5+ years experience\nSolidity expertise\nDeFi knowledge"}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => handleSave(false)}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Draft"
              )}
            </Button>
            <Button disabled={saving} onClick={() => handleSave(true)}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog
        open={!!viewApplication}
        onOpenChange={() => setViewApplication(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {viewApplication && (
            <>
              <DialogHeader>
                <DialogTitle>{viewApplication.fullName}</DialogTitle>
                <DialogDescription>
                  Application for {viewApplication.jobTitle}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Email:</strong> {viewApplication.email}
                </p>
                {viewApplication.phone && (
                  <p>
                    <strong>Phone:</strong> {viewApplication.phone}
                  </p>
                )}
                {viewApplication.linkedin && (
                  <p>
                    <strong>LinkedIn:</strong>{" "}
                    <a
                      href={viewApplication.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      Profile
                    </a>
                  </p>
                )}
                {viewApplication.github && (
                  <p>
                    <strong>GitHub:</strong>{" "}
                    <a
                      href={viewApplication.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      Profile
                    </a>
                  </p>
                )}
                {viewApplication.portfolio && (
                  <p>
                    <strong>Portfolio:</strong>{" "}
                    <a
                      href={viewApplication.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      Website
                    </a>
                  </p>
                )}
                <p>
                  <strong>Resume:</strong>{" "}
                  <a
                    href={viewApplication.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    View Resume
                  </a>
                </p>
                <div>
                  <strong>Cover Letter:</strong>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                    {viewApplication.coverLetter}
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <Select
                  value={viewApplication.status}
                  onValueChange={(v) =>
                    handleApplicationStatus(
                      viewApplication.id,
                      v as JobApplicationStatus
                    )
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!viewInquiry} onOpenChange={() => setViewInquiry(null)}>
        <DialogContent className="max-w-lg">
          {viewInquiry && (
            <>
              <DialogHeader>
                <DialogTitle>{viewInquiry.fullName}</DialogTitle>
                <DialogDescription>
                  Interested in: {viewInquiry.interestedRole}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Email:</strong> {viewInquiry.email}
                </p>
                <div>
                  <strong>Message:</strong>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                    {viewInquiry.message}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Select
                  value={viewInquiry.status}
                  onValueChange={(v) =>
                    handleInquiryStatus(
                      viewInquiry.id,
                      v as CareerInquiryStatus
                    )
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
