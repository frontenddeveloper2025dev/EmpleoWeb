import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/header";
import Footer from "@/components/footer";
import JobCard from "@/components/job-card";
import JobFilters from "@/components/job-filters";
import { JobWithCompany } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";

export default function Home() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("relevant");
  const [filters, setFilters] = useState({
    jobType: [] as string[],
    experienceLevel: [] as string[],
    salaryRange: [] as string[],
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (location) params.append('location', location);
    if (filters.jobType.length > 0) {
      filters.jobType.forEach(type => params.append('jobType', type));
    }
    if (filters.experienceLevel.length > 0) {
      filters.experienceLevel.forEach(level => params.append('experienceLevel', level));
    }
    if (filters.salaryRange.length > 0) {
      const minSalary = Math.min(...filters.salaryRange.map(Number));
      params.append('minSalary', minSalary.toString());
    }
    return params.toString();
  };

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['/api/jobs', buildQueryParams()],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const url = queryString ? `/api/jobs?${queryString}` : '/api/jobs';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json() as Promise<JobWithCompany[]>;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch due to dependency on searchQuery and location
  };

  const handleApply = (jobId: string) => {
    const user = authService.getUser();
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para aplicar a empleos",
        variant: "destructive",
      });
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

    // TODO: Implement application logic
    toast({
      title: "Funcionalidad próximamente",
      description: "La funcionalidad de aplicación se implementará pronto",
    });
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'salary_high':
        return (b.maxSalary || 0) - (a.maxSalary || 0);
      case 'salary_low':
        return (a.minSalary || 0) - (b.minSalary || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Encuentra el trabajo de tus sueños
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Descubre miles de oportunidades laborales en las mejores empresas
          </p>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Título del puesto, palabras clave o empresa"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-query"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Ciudad, provincia o código postal"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                    data-testid="input-location"
                  />
                </div>
                <Button type="submit" className="flex items-center" data-testid="button-search">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar empleos
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <JobFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Job Listings */}
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Empleos disponibles</h2>
                  <p className="text-muted-foreground" data-testid="text-job-count">
                    {jobs.length} empleos encontrados
                  </p>
                </div>
                <Select value={sortBy} onValueChange={setSortBy} data-testid="select-sort">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">Más relevantes</SelectItem>
                    <SelectItem value="recent">Más recientes</SelectItem>
                    <SelectItem value="salary_high">Salario: mayor a menor</SelectItem>
                    <SelectItem value="salary_low">Salario: menor a mayor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron empleos</h3>
                    <p className="text-muted-foreground">
                      Intenta ajustar tus filtros de búsqueda o términos de búsqueda.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onApply={handleApply}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Companies Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Empresas destacadas</h2>
            <p className="text-muted-foreground">Descubre oportunidades en las mejores empresas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "TechCorp", industry: "Tecnología", jobs: 12, icon: "🏢" },
              { name: "HealthPlus", industry: "Salud", jobs: 8, icon: "🏥" },
              { name: "EduFuture", industry: "Educación", jobs: 15, icon: "🎓" },
              { name: "FinanceMax", industry: "Finanzas", jobs: 6, icon: "📊" },
            ].map((company, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid={`company-card-${index}`}>
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{company.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{company.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{company.industry}</p>
                  <div className="text-sm text-accent font-medium">
                    {company.jobs} empleos disponibles
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
