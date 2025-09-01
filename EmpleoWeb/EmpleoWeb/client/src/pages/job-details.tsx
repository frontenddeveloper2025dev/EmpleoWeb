import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Heart,
  ArrowLeft,
  Send,
  Briefcase,
  Globe,
  Calendar
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import JobCard from "@/components/job-card";
import { JobWithCompany, ApplicationWithJob } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { authService } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

interface ApplicationFormData {
  coverLetter: string;
}

export default function JobDetails() {
  const [, params] = useRoute("/jobs/:id");
  const [, navigate] = useLocation();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { toast } = useToast();
  const token = authService.getToken();
  const user = authService.getUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    defaultValues: {
      coverLetter: "",
    },
  });

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['/api/jobs', params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${params?.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Job not found');
        }
        throw new Error('Failed to fetch job details');
      }
      return response.json() as Promise<JobWithCompany>;
    },
    enabled: !!params?.id,
  });

  // Fetch user's applications to check if already applied
  const { data: userApplications = [] } = useQuery({
    queryKey: ['/api/my-applications'],
    enabled: !!token && user?.userType === 'job_seeker',
    queryFn: async () => {
      const response = await fetch('/api/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json() as Promise<ApplicationWithJob[]>;
    },
  });

  // Fetch similar jobs
  const { data: similarJobs = [] } = useQuery({
    queryKey: ['/api/jobs', 'similar', job?.location, job?.jobType],
    queryFn: async () => {
      if (!job) return [];
      const params = new URLSearchParams();
      if (job.location) params.append('location', job.location);
      if (job.jobType) params.append('jobType', job.jobType);
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) return [];
      const jobs = await response.json() as JobWithCompany[];
      return jobs.filter(j => j.id !== job.id).slice(0, 3);
    },
    enabled: !!job,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const response = await apiRequest('POST', `/api/jobs/${params?.id}/apply`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "¡Aplicación enviada!",
        description: "Tu aplicación ha sido enviada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-applications'] });
      setShowApplicationModal(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al enviar la aplicación",
        variant: "destructive",
      });
    },
  });

  const hasApplied = userApplications.some(app => app.jobId === params?.id);

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Salario no especificado";
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `€${min.toLocaleString()}+`;
    if (max) return `Hasta €${max.toLocaleString()}`;
    return "Salario no especificado";
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'full_time': 'Tiempo completo',
      'part_time': 'Medio tiempo',
      'remote': 'Remoto',
      'freelance': 'Freelance'
    };
    return labels[type] || type;
  };

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      'entry': 'Sin experiencia',
      'junior': 'Junior (1-3 años)',
      'mid': 'Mid (3-5 años)',
      'senior': 'Senior (5+ años)'
    };
    return labels[level] || level;
  };

  const handleApply = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para aplicar a empleos",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user.userType !== 'job_seeker') {
      toast({
        title: "Acceso denegado",
        description: "Solo los candidatos pueden aplicar a empleos",
        variant: "destructive",
      });
      return;
    }

    if (hasApplied) {
      toast({
        title: "Ya aplicaste",
        description: "Ya has aplicado a este empleo anteriormente",
        variant: "destructive",
      });
      return;
    }

    setShowApplicationModal(true);
  };

  const onSubmitApplication = (data: ApplicationFormData) => {
    applyMutation.mutate(data);
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Empleo no encontrado</h1>
              <p className="text-muted-foreground mb-4">
                El empleo que buscas no existe o ha sido eliminado.
              </p>
              <Button onClick={() => navigate("/")} data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a empleos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header */}
            <Card data-testid="job-header">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building className="text-primary h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="job-title">
                        {job.title}
                      </h1>
                      <div className="flex items-center space-x-4 text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          <span data-testid="job-company">{job.company.name}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span data-testid="job-location">{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span data-testid="job-posted">
                            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" data-testid="badge-job-type">
                          {getJobTypeLabel(job.jobType)}
                        </Badge>
                        <Badge variant="outline" data-testid="badge-experience">
                          {getExperienceLabel(job.experienceLevel)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid="button-save-job">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-semibold text-foreground" data-testid="job-salary">
                      {formatSalary(job.minSalary, job.maxSalary)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {user?.userType === 'job_seeker' && (
                      <Button 
                        onClick={handleApply}
                        disabled={hasApplied}
                        size="lg"
                        data-testid="button-apply"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {hasApplied ? "Ya aplicaste" : "Aplicar ahora"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job description */}
            <Card data-testid="job-description">
              <CardHeader>
                <CardTitle>Descripción del puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-foreground">
                  <p className="whitespace-pre-wrap" data-testid="job-description-text">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Skills required */}
            {job.skills && job.skills.length > 0 && (
              <Card data-testid="job-skills">
                <CardHeader>
                  <CardTitle>Habilidades requeridas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-primary/10 text-primary"
                        data-testid={`skill-${index}`}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company info */}
            <Card data-testid="company-info">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Sobre la empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground" data-testid="company-name">
                    {job.company.name}
                  </h3>
                  {job.company.industry && (
                    <p className="text-sm text-muted-foreground" data-testid="company-industry">
                      {job.company.industry}
                    </p>
                  )}
                </div>
                
                {job.company.description && (
                  <p className="text-sm text-muted-foreground" data-testid="company-description">
                    {job.company.description}
                  </p>
                )}
                
                {job.company.website && (
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a 
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                      data-testid="company-website"
                    >
                      Sitio web
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job details */}
            <Card data-testid="job-details">
              <CardHeader>
                <CardTitle>Detalles del empleo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo de empleo</span>
                  <Badge variant="secondary" data-testid="detail-job-type">
                    {getJobTypeLabel(job.jobType)}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Experiencia</span>
                  <Badge variant="outline" data-testid="detail-experience">
                    {getExperienceLabel(job.experienceLevel)}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ubicación</span>
                  <span className="text-sm font-medium" data-testid="detail-location">
                    {job.location}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Publicado</span>
                  <span className="text-sm font-medium" data-testid="detail-posted">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar jobs */}
        {similarJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Empleos similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarJobs.map((similarJob) => (
                <JobCard 
                  key={similarJob.id} 
                  job={similarJob}
                  onApply={() => navigate(`/jobs/${similarJob.id}`)}
                  showApplyButton={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-md" data-testid="application-modal">
          <DialogHeader>
            <DialogTitle>Aplicar a {job.title}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmitApplication)} className="space-y-4">
            <div>
              <Label htmlFor="coverLetter">Carta de presentación (opcional)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Explica por qué eres el candidato ideal para este puesto..."
                rows={6}
                {...register("coverLetter")}
                data-testid="textarea-cover-letter"
              />
              {errors.coverLetter && (
                <p className="text-sm text-destructive mt-1">{errors.coverLetter.message}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowApplicationModal(false)}
                data-testid="button-cancel-application"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={applyMutation.isPending}
                data-testid="button-submit-application"
              >
                {applyMutation.isPending ? "Enviando..." : "Enviar aplicación"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
