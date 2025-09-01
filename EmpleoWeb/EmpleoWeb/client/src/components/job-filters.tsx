import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface JobFiltersProps {
  filters: {
    jobType: string[];
    experienceLevel: string[];
    salaryRange: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export default function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const jobTypes = [
    { value: 'full_time', label: 'Tiempo completo' },
    { value: 'part_time', label: 'Medio tiempo' },
    { value: 'remote', label: 'Remoto' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Sin experiencia' },
    { value: 'junior', label: 'Junior (1-3 años)' },
    { value: 'mid', label: 'Mid (3-5 años)' },
    { value: 'senior', label: 'Senior (5+ años)' },
  ];

  const salaryRanges = [
    { value: '30000', label: '€30.000+' },
    { value: '50000', label: '€50.000+' },
    { value: '70000', label: '€70.000+' },
    { value: '100000', label: '€100.000+' },
  ];

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    const currentValues = filters[filterType as keyof typeof filters] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    onFiltersChange({
      ...filters,
      [filterType]: newValues,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      jobType: [],
      experienceLevel: [],
      salaryRange: [],
    });
  };

  return (
    <Card className="sticky top-24" data-testid="job-filters">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Salary Filter */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Salario</h4>
          <div className="space-y-2">
            {salaryRanges.map((range) => (
              <div key={range.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`salary-${range.value}`}
                  checked={filters.salaryRange.includes(range.value)}
                  onCheckedChange={(checked) => 
                    handleFilterChange('salaryRange', range.value, checked as boolean)
                  }
                  data-testid={`filter-salary-${range.value}`}
                />
                <Label htmlFor={`salary-${range.value}`} className="text-sm">
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Job Type Filter */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Tipo de empleo</h4>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`jobtype-${type.value}`}
                  checked={filters.jobType.includes(type.value)}
                  onCheckedChange={(checked) => 
                    handleFilterChange('jobType', type.value, checked as boolean)
                  }
                  data-testid={`filter-jobtype-${type.value}`}
                />
                <Label htmlFor={`jobtype-${type.value}`} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level Filter */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Nivel de experiencia</h4>
          <div className="space-y-2">
            {experienceLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`experience-${level.value}`}
                  checked={filters.experienceLevel.includes(level.value)}
                  onCheckedChange={(checked) => 
                    handleFilterChange('experienceLevel', level.value, checked as boolean)
                  }
                  data-testid={`filter-experience-${level.value}`}
                />
                <Label htmlFor={`experience-${level.value}`} className="text-sm">
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={clearAllFilters} 
          className="w-full"
          data-testid="button-clear-filters"
        >
          Limpiar filtros
        </Button>
      </CardContent>
    </Card>
  );
}
