import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Heart, Clock } from "lucide-react";
import { JobWithCompany } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";

interface JobCardProps {
  job: JobWithCompany;
  onApply?: (jobId: string) => void;
  showApplyButton?: boolean;
}

export default function JobCard({ job, onApply, showApplyButton = true }: JobCardProps) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `€${min.toLocaleString()}+`;
    if (max) return `Hasta €${max.toLocaleString()}`;
    return null;
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

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`job-card-${job.id}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="text-primary" />
            </div>
            <div>
              <Link href={`/jobs/${job.id}`}>
                <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors" data-testid={`job-title-${job.id}`}>
                  {job.title}
                </h3>
              </Link>
              <p className="text-muted-foreground" data-testid={`job-company-${job.id}`}>{job.company.name}</p>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="mr-1 h-4 w-4" />
                <span data-testid={`job-location-${job.id}`}>{job.location}</span>
                <span className="mx-2">•</span>
                <Clock className="mr-1 h-4 w-4" />
                <span data-testid={`job-posted-${job.id}`}>
                  {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: es })}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" data-testid={`button-favorite-${job.id}`}>
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`job-description-${job.id}`}>
          {job.description}
        </p>
        
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
            <Badge variant="secondary" data-testid={`badge-job-type-${job.id}`}>
              {getJobTypeLabel(job.jobType)}
            </Badge>
            <Badge variant="outline" data-testid={`badge-experience-${job.id}`}>
              {getExperienceLabel(job.experienceLevel)}
            </Badge>
            {job.skills && job.skills.slice(0, 2).map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-primary/10 text-primary" data-testid={`badge-skill-${job.id}-${index}`}>
                {skill}
              </Badge>
            ))}
            {job.skills && job.skills.length > 2 && (
              <Badge variant="outline" className="bg-muted" data-testid={`badge-more-skills-${job.id}`}>
                +{job.skills.length - 2} más
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {formatSalary(job.minSalary, job.maxSalary) && (
              <span className="text-sm font-medium text-foreground" data-testid={`job-salary-${job.id}`}>
                {formatSalary(job.minSalary, job.maxSalary)}
              </span>
            )}
            {showApplyButton && (
              <Button 
                onClick={() => onApply?.(job.id)}
                data-testid={`button-apply-${job.id}`}
              >
                Aplicar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
