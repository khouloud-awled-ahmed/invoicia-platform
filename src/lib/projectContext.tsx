import { createContext, useContext, useState, ReactNode } from "react";

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "en-cours" | "termine" | "en-attente" | "annule";
  priority: "haute" | "moyenne" | "basse";
  startDate: Date;
  endDate: Date;
  budget: number;
  consumed: number;
  progress: number;
  manager: string;
  team: string[];
  description: string;
  tasksTotal: number;
  tasksCompleted: number;
  hoursEstimated: number;
  hoursSpent: number;
  code: string;
  color: string;
}

export interface CRAEntry {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  client: string;
  activityType: string;
  hours: number;
  status: "draft" | "submitted" | "validated" | "rejected";
  description: string;
  validatedBy?: string;
  rejectionReason?: string;
  userId: string;
  userName: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: "todo" | "en-cours" | "termine" | "bloque";
  priority: "haute" | "moyenne" | "basse";
  assignee: string;
  dueDate: Date;
  estimatedHours: number;
  spentHours: number;
  progress: number;
}

interface ProjectContextType {
  projects: Project[];
  craEntries: CRAEntry[];
  tasks: Task[];
  addCRAEntry: (entry: Omit<CRAEntry, "id">) => void;
  updateCRAEntry: (id: string, entry: Partial<CRAEntry>) => void;
  deleteCRAEntry: (id: string) => void;
  getProjectHours: (projectId: string) => number;
  updateProjectHoursSpent: (projectId: string, hours: number) => void;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const INITIAL_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Refonte Site Web ClientABC",
    client: "ClientABC SARL",
    status: "en-cours",
    priority: "haute",
    startDate: new Date(2025, 9, 1),
    endDate: new Date(2025, 11, 31),
    budget: 45000,
    consumed: 27500,
    progress: 65,
    manager: "Sophie Martin",
    team: ["Sophie Martin", "Pierre Dupont", "Marie Durand", "Thomas Bernard"],
    description: "Refonte complète du site web avec migration vers React et nouvelle identité visuelle",
    tasksTotal: 24,
    tasksCompleted: 16,
    hoursEstimated: 320,
    hoursSpent: 210,
    code: "ABC-001",
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "Application Mobile CRM",
    client: "TechCorp SAS",
    status: "en-cours",
    priority: "haute",
    startDate: new Date(2025, 8, 15),
    endDate: new Date(2026, 0, 15),
    budget: 85000,
    consumed: 38000,
    progress: 42,
    manager: "Pierre Dupont",
    team: ["Pierre Dupont", "Jean Moreau", "Laura Petit", "Alexandre Grand"],
    description: "Développement d'une application mobile CRM native iOS et Android",
    tasksTotal: 48,
    tasksCompleted: 18,
    hoursEstimated: 580,
    hoursSpent: 245,
    code: "TCH-002",
    color: "bg-green-500",
  },
  {
    id: "3",
    name: "Migration Cloud Azure",
    client: "DataServices Ltd",
    status: "en-attente",
    priority: "moyenne",
    startDate: new Date(2025, 11, 1),
    endDate: new Date(2026, 1, 28),
    budget: 65000,
    consumed: 0,
    progress: 0,
    manager: "Thomas Bernard",
    team: ["Thomas Bernard", "Sophie Martin"],
    description: "Migration de l'infrastructure on-premise vers Azure Cloud",
    tasksTotal: 32,
    tasksCompleted: 0,
    hoursEstimated: 450,
    hoursSpent: 0,
    code: "DAT-003",
    color: "bg-purple-500",
  },
  {
    id: "4",
    name: "Audit Sécurité Infrastructure",
    client: "SecureBank SA",
    status: "termine",
    priority: "haute",
    startDate: new Date(2025, 7, 1),
    endDate: new Date(2025, 9, 15),
    budget: 32000,
    consumed: 30500,
    progress: 100,
    manager: "Marie Durand",
    team: ["Marie Durand", "Alexandre Grand"],
    description: "Audit complet de sécurité avec tests d'intrusion et recommandations",
    tasksTotal: 18,
    tasksCompleted: 18,
    hoursEstimated: 210,
    hoursSpent: 205,
    code: "SEC-004",
    color: "bg-orange-500",
  },
  {
    id: "5",
    name: "Intégration ERP Odoo",
    client: "Manufacture XYZ",
    status: "en-cours",
    priority: "moyenne",
    startDate: new Date(2025, 10, 1),
    endDate: new Date(2026, 2, 31),
    budget: 52000,
    consumed: 8500,
    progress: 18,
    manager: "Jean Moreau",
    team: ["Jean Moreau", "Laura Petit", "Pierre Dupont"],
    description: "Déploiement et personnalisation d'Odoo pour la gestion de production",
    tasksTotal: 36,
    tasksCompleted: 6,
    hoursEstimated: 380,
    hoursSpent: 68,
    code: "MAN-005",
    color: "bg-indigo-500",
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    projectId: "1",
    name: "Design de la maquette homepage",
    description: "Créer les wireframes et maquettes haute fidélité",
    status: "termine",
    priority: "haute",
    assignee: "Marie Durand",
    dueDate: new Date(2025, 9, 15),
    estimatedHours: 16,
    spentHours: 14,
    progress: 100,
  },
  {
    id: "2",
    projectId: "1",
    name: "Développement frontend React",
    description: "Implémentation des composants React",
    status: "en-cours",
    priority: "haute",
    assignee: "Pierre Dupont",
    dueDate: new Date(2025, 10, 20),
    estimatedHours: 80,
    spentHours: 52,
    progress: 65,
  },
  {
    id: "3",
    projectId: "1",
    name: "Intégration API backend",
    description: "Connexion avec les APIs REST",
    status: "en-cours",
    priority: "moyenne",
    assignee: "Thomas Bernard",
    dueDate: new Date(2025, 10, 25),
    estimatedHours: 40,
    spentHours: 18,
    progress: 45,
  },
  {
    id: "4",
    projectId: "1",
    name: "Tests utilisateurs",
    description: "Organiser et conduire les tests utilisateurs",
    status: "todo",
    priority: "moyenne",
    assignee: "Sophie Martin",
    dueDate: new Date(2025, 11, 10),
    estimatedHours: 24,
    spentHours: 0,
    progress: 0,
  },
  {
    id: "5",
    projectId: "2",
    name: "Architecture technique mobile",
    description: "Définir l'architecture React Native",
    status: "termine",
    priority: "haute",
    assignee: "Pierre Dupont",
    dueDate: new Date(2025, 9, 1),
    estimatedHours: 32,
    spentHours: 28,
    progress: 100,
  },
  {
    id: "6",
    projectId: "2",
    name: "Développement module contacts",
    description: "CRUD des contacts avec synchronisation",
    status: "en-cours",
    priority: "haute",
    assignee: "Jean Moreau",
    dueDate: new Date(2025, 10, 30),
    estimatedHours: 60,
    spentHours: 35,
    progress: 58,
  },
];

const INITIAL_CRA_ENTRIES: CRAEntry[] = [
  {
    id: "1",
    date: "2025-11-18",
    projectId: "1",
    projectName: "Refonte Site Web ClientABC",
    client: "ClientABC SARL",
    activityType: "Production",
    hours: 7,
    status: "validated",
    description: "Développement des composants React pour la homepage",
    validatedBy: "Sophie Martin",
    userId: "user1",
    userName: "Pierre Dupont",
  },
  {
    id: "2",
    date: "2025-11-18",
    projectId: "2",
    projectName: "Application Mobile CRM",
    client: "TechCorp SAS",
    activityType: "Production",
    hours: 8,
    status: "validated",
    description: "Intégration de l'API REST pour le module contacts",
    validatedBy: "Pierre Dupont",
    userId: "user2",
    userName: "Jean Moreau",
  },
  {
    id: "3",
    date: "2025-11-19",
    projectId: "1",
    projectName: "Refonte Site Web ClientABC",
    client: "ClientABC SARL",
    activityType: "Réunion",
    hours: 2,
    status: "validated",
    description: "Point d'avancement avec le client",
    validatedBy: "Sophie Martin",
    userId: "user1",
    userName: "Pierre Dupont",
  },
  {
    id: "4",
    date: "2025-11-19",
    projectId: "2",
    projectName: "Application Mobile CRM",
    client: "TechCorp SAS",
    activityType: "Production",
    hours: 6,
    status: "submitted",
    description: "Tests unitaires du module de synchronisation",
    userId: "user2",
    userName: "Jean Moreau",
  },
  {
    id: "5",
    date: "2025-11-20",
    projectId: "5",
    projectName: "Intégration ERP Odoo",
    client: "Manufacture XYZ",
    activityType: "Production",
    hours: 7.5,
    status: "submitted",
    description: "Configuration des workflows de production",
    userId: "user3",
    userName: "Laura Petit",
  },
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [craEntries, setCraEntries] = useState<CRAEntry[]>(INITIAL_CRA_ENTRIES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addCRAEntry = (entry: Omit<CRAEntry, "id">) => {
    const newEntry: CRAEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setCraEntries((prev) => [...prev, newEntry]);

    // Synchroniser les heures avec le projet
    if (entry.status === "validated") {
      updateProjectHoursSpent(entry.projectId, entry.hours);
    }
  };

  const updateCRAEntry = (id: string, updates: Partial<CRAEntry>) => {
    setCraEntries((prev) => {
      const updated = prev.map((entry) => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, ...updates };
          
          // Si l'entrée passe de non-validée à validée, ajouter les heures au projet
          if (entry.status !== "validated" && updatedEntry.status === "validated") {
            updateProjectHoursSpent(entry.projectId, entry.hours);
          }
          // Si l'entrée passe de validée à non-validée, retirer les heures du projet
          else if (entry.status === "validated" && updatedEntry.status !== "validated") {
            updateProjectHoursSpent(entry.projectId, -entry.hours);
          }
          
          return updatedEntry;
        }
        return entry;
      });
      return updated;
    });
  };

  const deleteCRAEntry = (id: string) => {
    const entry = craEntries.find((e) => e.id === id);
    if (entry && entry.status === "validated") {
      // Retirer les heures du projet
      updateProjectHoursSpent(entry.projectId, -entry.hours);
    }
    setCraEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const getProjectHours = (projectId: string): number => {
    return craEntries
      .filter((entry) => entry.projectId === projectId && entry.status === "validated")
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const updateProjectHoursSpent = (projectId: string, hours: number) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          const newHoursSpent = Math.max(0, project.hoursSpent + hours);
          const newProgress = Math.min(100, Math.round((newHoursSpent / project.hoursEstimated) * 100));
          
          // Calculer le coût consommé basé sur les heures (environ 150€/heure)
          const hourlyRate = project.budget / project.hoursEstimated;
          const newConsumed = Math.min(project.budget, Math.round(newHoursSpent * hourlyRate));
          
          return {
            ...project,
            hoursSpent: newHoursSpent,
            progress: newProgress,
            consumed: newConsumed,
          };
        }
        return project;
      })
    );
  };

  const addProject = (project: Omit<Project, "id">) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === id ? { ...project, ...updates } : project))
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        craEntries,
        tasks,
        addCRAEntry,
        updateCRAEntry,
        deleteCRAEntry,
        getProjectHours,
        updateProjectHoursSpent,
        addProject,
        updateProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}