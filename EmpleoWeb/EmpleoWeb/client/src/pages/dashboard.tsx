import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, FileText, Plus, Upload, Users } from "lucide-react";
import Header from "@/components/header";
import JobCard from "@/components/job-card";
import JobPostingModal from "@/components/job-posting-modal";
import { authService } from "@/lib/auth";
import { User as UserType, ApplicationWithJob, JobWithCompany } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [showJobPostModal, setShowJobPostModal] = useState(false);
  const token = authService.getToken();

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  // Fetch user's applications (for job seekers)
  const { data: applications = [] } = useQuery({
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

  // Fetch employer's jobs (for employers)
  const { data: employerJobs = [] } = useQuery({
    queryKey: ['/api/employer/jobs'],
    enabled: !!token && user?.userType === 'employer',
    queryFn: async () => {
      const response = await fetch('/api/employer/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch employer jobs');
      return response.json() as Promise<JobWithCompany[]>;
    },
  });

  // Fetch applications to employer's jobs
  const { data: employerApplications = [] } = useQuery({
    queryKey: ['/api/employer/applications'],
    enabled: !!token && user?.userType === 'employer',
    queryFn: async () => {
      const response = await fetch('/api/employer/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch employer applications');
      return response.json() as Promise<ApplicationWithJob[]>;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'reviewing': 'En revisión',
      'interview': 'Entrevista',
      'accepted': 'Aceptado',
      'rejected': 'Rechazado',
    };
    return labels[status] || status;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Mi Dashboard
          </h1>
          <p className="text-muted-foreground">
            {user.userType === 'job_seeker' 
              ? 'Gestiona tus aplicaciones y perfil' 
              : 'Gestiona tus ofertas de trabajo y candidatos'
            }
          </p>
        </div>

        {user.userType === 'job_seeker' ? (
          // Job Seeker Dashboard
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <Card data-testid="profile-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Mi Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-primary text-2xl" />
                  </div>
                  <h3 className="font-semibold text-foreground" data-testid="user-name">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4" data-testid="user-email">
                    {user.email}
                  </p>
                  <Button className="w-full" data-testid="button-edit-profile">
                    <FileText className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </Button>
                  <Button variant="outline" className="w-full mt-2" data-testid="button-upload-resume">
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Currículum
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <Card data-testid="stats-applications">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground" data-testid="stats-applications-count">
                    {applications.length}
                  </div>
                  <div className="text-muted-foreground text-sm">Aplicaciones enviadas</div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stats-interviews">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent" data-testid="stats-interviews-count">
                    {applications.filter(app => app.status === 'interview').length}
                  </div>
                  <div className="text-muted-foreground text-sm">Entrevistas programadas</div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Employer Dashboard
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="stats-posted-jobs">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground" data-testid="stats-jobs-count">
                    {employerJobs.length}
                  </div>
                  <div className="text-muted-foreground text-sm">Empleos publicados</div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stats-total-applications">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary" data-testid="stats-total-applications-count">
                    {employerApplications.length}
                  </div>
                  <div className="text-muted-foreground text-sm">Aplicaciones recibidas</div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stats-pending-applications">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent" data-testid="stats-pending-count">
                    {employerApplications.filter(app => app.status === 'pending').length}
                  </div>
                  <div className="text-muted-foreground text-sm">Por revisar</div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stats-interviews">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600" data-testid="stats-interview-count">
                    {employerApplications.filter(app => app.status === 'interview').length}
                  </div>
                  <div className="text-muted-foreground text-sm">En entrevista</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue={user.userType === 'job_seeker' ? 'applications' : 'jobs'} className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            {user.userType === 'job_seeker' ? (
              <>
                <TabsTrigger value="applications" data-testid="tab-applications">Mis Aplicaciones</TabsTrigger>
                <TabsTrigger value="saved" data-testid="tab-saved">Empleos Guardados</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="jobs" data-testid="tab-jobs">Mis Empleos</TabsTrigger>
                <TabsTrigger value="candidates" data-testid="tab-candidates">Candidatos</TabsTrigger>
              </>
            )}
          </TabsList>

          {user.userType === 'job_seeker' ? (
            <>
              <TabsContent value="applications" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Aplicaciones Recientes</h2>
                </div>
                
                {applications.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No has aplicado a ningún empleo</h3>
                      <p className="text-muted-foreground mb-4">
                        Explora nuestras ofertas de trabajo y comienza a aplicar.
                      </p>
                      <Button onClick={() => navigate("/")} data-testid="button-browse-jobs">
                        Explorar Empleos
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application.id} data-testid={`application-card-${application.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground" data-testid={`application-job-title-${application.id}`}>
                                {application.job.title}
                              </h3>
                              <p className="text-muted-foreground" data-testid={`application-company-${application.id}`}>
                                {application.job.company.name}
                              </p>
                              <p className="text-sm text-muted-foreground" data-testid={`application-date-${application.id}`}>
                                Aplicado {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true, locale: es })}
                              </p>
                            </div>
                            <Badge className={getStatusColor(application.status)} data-testid={`application-status-${application.id}`}>
                              {getStatusLabel(application.status)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No tienes empleos guardados</h3>
                    <p className="text-muted-foreground">
                      Guarda empleos que te interesen para revisarlos más tarde.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="jobs" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Mis Ofertas de Trabajo</h2>
                  <Button onClick={() => setShowJobPostModal(true)} data-testid="button-post-job">
                    <Plus className="mr-2 h-4 w-4" />
                    Publicar Empleo
                  </Button>
                </div>
                
                {employerJobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No has publicado empleos</h3>
                      <p className="text-muted-foreground mb-4">
                        Comienza a atraer talento publicando tu primera oferta de trabajo.
                      </p>
                      <Button onClick={() => setShowJobPostModal(true)} data-testid="button-post-first-job">
                        <Plus className="mr-2 h-4 w-4" />
                        Publicar Primer Empleo
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {employerJobs.map((job) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        showApplyButton={false}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="candidates" className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Candidatos</h2>
                </div>
                
                {employerApplications.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No hay aplicaciones</h3>
                      <p className="text-muted-foreground">
                        Cuando publiques empleos, las aplicaciones aparecerán aquí.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {employerApplications.map((application) => (
                      <Card key={application.id} data-testid={`candidate-card-${application.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground" data-testid={`candidate-job-title-${application.id}`}>
                                {application.job.title}
                              </h3>
                              <p className="text-muted-foreground" data-testid={`candidate-applied-date-${application.id}`}>
                                Aplicación recibida {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true, locale: es })}
                              </p>
                              {application.coverLetter && (
                                <p className="text-sm text-muted-foreground mt-2" data-testid={`candidate-cover-letter-${application.id}`}>
                                  "{application.coverLetter}"
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(application.status)} data-testid={`candidate-status-${application.id}`}>
                                {getStatusLabel(application.status)}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Floating Action Button for Employers */}
      {user.userType === 'employer' && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowJobPostModal(true)}
          data-testid="fab-post-job"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <JobPostingModal 
        open={showJobPostModal} 
        onOpenChange={setShowJobPostModal} 
      />
    </div>
  );
}
