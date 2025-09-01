import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";

const jobFormSchema = insertJobSchema.extend({
  skills: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobPostingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobPostingModal({ open, onOpenChange }: JobPostingModalProps) {
  const { toast } = useToast();
  const token = authService.getToken();

  // Fetch user's companies
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/my-companies'],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch('/api/my-companies', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      jobType: "full_time",
      experienceLevel: "mid",
      minSalary: undefined,
      maxSalary: undefined,
      skills: "",
      companyId: "",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await apiRequest('POST', '/api/jobs', {
        ...data,
        skills: typeof data.skills === 'string' 
          ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
          : data.skills,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Oferta de trabajo publicada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al publicar la oferta",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    if (companies.length === 0) {
      toast({
        title: "Error",
        description: "Debes crear una empresa antes de publicar empleos",
        variant: "destructive",
      });
      return;
    }
    createJobMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="job-posting-modal">
        <DialogHeader>
          <DialogTitle>Publicar nueva oferta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Título del puesto</Label>
            <Input
              id="title"
              placeholder="ej. Desarrollador Frontend Senior"
              {...register("title")}
              data-testid="input-job-title"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Descripción del trabajo</Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="Describe las responsabilidades, requisitos y beneficios..."
              {...register("description")}
              data-testid="textarea-job-description"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="companyId">Empresa</Label>
            <Select onValueChange={(value) => setValue("companyId", value)} data-testid="select-company">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company: any) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companyId && (
              <p className="text-sm text-destructive mt-1">{errors.companyId.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                placeholder="Madrid, España"
                {...register("location")}
                data-testid="input-job-location"
              />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="jobType">Tipo de empleo</Label>
              <Select onValueChange={(value) => setValue("jobType", value)} data-testid="select-job-type">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Tiempo completo</SelectItem>
                  <SelectItem value="part_time">Medio tiempo</SelectItem>
                  <SelectItem value="remote">Remoto</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="experienceLevel">Nivel de experiencia</Label>
            <Select onValueChange={(value) => setValue("experienceLevel", value)} data-testid="select-experience-level">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Sin experiencia</SelectItem>
                <SelectItem value="junior">Junior (1-3 años)</SelectItem>
                <SelectItem value="mid">Mid (3-5 años)</SelectItem>
                <SelectItem value="senior">Senior (5+ años)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSalary">Salario mínimo (€)</Label>
              <Input
                id="minSalary"
                type="number"
                placeholder="30000"
                {...register("minSalary", { valueAsNumber: true })}
                data-testid="input-min-salary"
              />
              {errors.minSalary && (
                <p className="text-sm text-destructive mt-1">{errors.minSalary.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="maxSalary">Salario máximo (€)</Label>
              <Input
                id="maxSalary"
                type="number"
                placeholder="50000"
                {...register("maxSalary", { valueAsNumber: true })}
                data-testid="input-max-salary"
              />
              {errors.maxSalary && (
                <p className="text-sm text-destructive mt-1">{errors.maxSalary.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="skills">Habilidades requeridas</Label>
            <Input
              id="skills"
              placeholder="JavaScript, React, Node.js (separadas por comas)"
              {...register("skills")}
              data-testid="input-job-skills"
            />
            {errors.skills && (
              <p className="text-sm text-destructive mt-1">{errors.skills.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-job"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createJobMutation.isPending}
              data-testid="button-submit-job"
            >
              {createJobMutation.isPending ? "Publicando..." : "Publicar oferta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
