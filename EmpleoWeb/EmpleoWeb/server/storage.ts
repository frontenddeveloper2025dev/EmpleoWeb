import { type User, type InsertUser, type Company, type InsertCompany, type Job, type InsertJob, type Application, type InsertApplication, type JobWithCompany, type ApplicationWithJob } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  getCompaniesByEmployer(employerId: string): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined>;

  // Job operations
  getJob(id: string): Promise<Job | undefined>;
  getJobWithCompany(id: string): Promise<JobWithCompany | undefined>;
  getJobs(filters?: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    minSalary?: number;
    maxSalary?: number;
    skills?: string[];
  }): Promise<JobWithCompany[]>;
  getJobsByEmployer(employerId: string): Promise<JobWithCompany[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;

  // Application operations
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByApplicant(applicantId: string): Promise<ApplicationWithJob[]>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  getApplicationsByEmployer(employerId: string): Promise<ApplicationWithJob[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined>;
  getApplicationByJobAndApplicant(jobId: string, applicantId: string): Promise<Application | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companies: Map<string, Company>;
  private jobs: Map<string, Job>;
  private applications: Map<string, Application>;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.jobs = new Map();
    this.applications = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Company operations
  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompaniesByEmployer(employerId: string): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(company => company.employerId === employerId);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = {
      ...insertCompany,
      id,
      createdAt: new Date(),
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...updates };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  // Job operations
  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobWithCompany(id: string): Promise<JobWithCompany | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const company = this.companies.get(job.companyId);
    if (!company) return undefined;
    
    return { ...job, company };
  }

  async getJobs(filters?: {
    search?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    minSalary?: number;
    maxSalary?: number;
    skills?: string[];
  }): Promise<JobWithCompany[]> {
    let jobs = Array.from(this.jobs.values()).filter(job => job.isActive);
    
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.location) {
        jobs = jobs.filter(job => 
          job.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      if (filters.jobType) {
        jobs = jobs.filter(job => job.jobType === filters.jobType);
      }
      
      if (filters.experienceLevel) {
        jobs = jobs.filter(job => job.experienceLevel === filters.experienceLevel);
      }
      
      if (filters.minSalary) {
        jobs = jobs.filter(job => job.minSalary && job.minSalary >= filters.minSalary!);
      }
      
      if (filters.maxSalary) {
        jobs = jobs.filter(job => job.maxSalary && job.maxSalary <= filters.maxSalary!);
      }
      
      if (filters.skills && filters.skills.length > 0) {
        jobs = jobs.filter(job => 
          job.skills && filters.skills!.some(skill => 
            job.skills!.some(jobSkill => 
              jobSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }
    }
    
    const jobsWithCompany: JobWithCompany[] = [];
    for (const job of jobs) {
      const company = this.companies.get(job.companyId);
      if (company) {
        jobsWithCompany.push({ ...job, company });
      }
    }
    
    return jobsWithCompany.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJobsByEmployer(employerId: string): Promise<JobWithCompany[]> {
    const jobs = Array.from(this.jobs.values()).filter(job => job.employerId === employerId);
    const jobsWithCompany: JobWithCompany[] = [];
    
    for (const job of jobs) {
      const company = this.companies.get(job.companyId);
      if (company) {
        jobsWithCompany.push({ ...job, company });
      }
    }
    
    return jobsWithCompany.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Application operations
  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByApplicant(applicantId: string): Promise<ApplicationWithJob[]> {
    const applications = Array.from(this.applications.values())
      .filter(app => app.applicantId === applicantId);
    
    const applicationsWithJob: ApplicationWithJob[] = [];
    for (const app of applications) {
      const jobWithCompany = await this.getJobWithCompany(app.jobId);
      if (jobWithCompany) {
        applicationsWithJob.push({ ...app, job: jobWithCompany });
      }
    }
    
    return applicationsWithJob.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.jobId === jobId)
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async getApplicationsByEmployer(employerId: string): Promise<ApplicationWithJob[]> {
    const employerJobs = Array.from(this.jobs.values())
      .filter(job => job.employerId === employerId);
    
    const jobIds = new Set(employerJobs.map(job => job.id));
    const applications = Array.from(this.applications.values())
      .filter(app => jobIds.has(app.jobId));
    
    const applicationsWithJob: ApplicationWithJob[] = [];
    for (const app of applications) {
      const jobWithCompany = await this.getJobWithCompany(app.jobId);
      if (jobWithCompany) {
        applicationsWithJob.push({ ...app, job: jobWithCompany });
      }
    }
    
    return applicationsWithJob.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const application: Application = {
      ...insertApplication,
      id,
      status: "pending",
      appliedAt: new Date(),
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async getApplicationByJobAndApplicant(jobId: string, applicantId: string): Promise<Application | undefined> {
    return Array.from(this.applications.values())
      .find(app => app.jobId === jobId && app.applicantId === applicantId);
  }
}

export const storage = new MemStorage();
