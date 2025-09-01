import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertJobSchema, insertApplicationSchema, insertCompanySchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      const token = jwt.sign({ userId: user.id, userType: user.userType }, JWT_SECRET);
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user.id, userType: user.userType }, JWT_SECRET);
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        location: req.query.location as string,
        jobType: req.query.jobType as string,
        experienceLevel: req.query.experienceLevel as string,
        minSalary: req.query.minSalary ? parseInt(req.query.minSalary as string) : undefined,
        maxSalary: req.query.maxSalary ? parseInt(req.query.maxSalary as string) : undefined,
        skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
      };
      
      const jobs = await storage.getJobs(filters);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJobWithCompany(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/jobs", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== 'employer') {
        return res.status(403).json({ message: "Only employers can create jobs" });
      }
      
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob({
        ...jobData,
        employerId: req.user.userId,
      });
      
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/employer/jobs", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== 'employer') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const jobs = await storage.getJobsByEmployer(req.user.userId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Application routes
  app.post("/api/jobs/:jobId/apply", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== 'job_seeker') {
        return res.status(403).json({ message: "Only job seekers can apply" });
      }
      
      const jobId = req.params.jobId;
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if already applied
      const existingApplication = await storage.getApplicationByJobAndApplicant(jobId, req.user.userId);
      if (existingApplication) {
        return res.status(409).json({ message: "Already applied to this job" });
      }
      
      const applicationData = insertApplicationSchema.parse({
        jobId,
        applicantId: req.user.userId,
        coverLetter: req.body.coverLetter,
      });
      
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/my-applications", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== 'job_seeker') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const applications = await storage.getApplicationsByApplicant(req.user.userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/employer/applications", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== 'employer') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const applications = await storage.getApplicationsByEmployer(req.user.userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.patch("/api/applications/:id", authenticateToken, async (req: any, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if user owns the job or is the applicant
      const job = await storage.getJob(application.jobId);
      if (!job || (job.employerId !== req.user.userId && application.applicantId !== req.user.userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedApplication = await storage.updateApplication(req.params.id, req.body);
      res.json(updatedApplication);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  // Company routes
  app.post("/api/companies", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== 'employer') {
        return res.status(403).json({ message: "Only employers can create companies" });
      }
      
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany({
        ...companyData,
        employerId: req.user.userId,
      });
      
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/my-companies", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.userType !== 'employer') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const companies = await storage.getCompaniesByEmployer(req.user.userId);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // User profile routes
  app.patch("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.updateUser(req.user.userId, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
