import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { api } from '../services/api';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  setActiveProject: (project: Project | null) => void;
  selectProjectById: (id: number) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);

      // Keep active project or pick the first if none active
      if (data.length > 0) {
        if (!activeProject || !data.some((p) => p.id === activeProject.id)) {
          setActiveProject(data[0]);
        } else {
          const updated = data.find((p) => p.id === activeProject.id);
          if (updated) setActiveProject(updated);
        }
      } else {
        setActiveProject(null);
      }
    } catch {
      setProjects([]);
      setActiveProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProjectById = (id: number) => {
    const found = projects.find((p) => p.id === id);
    if (found) setActiveProject(found);
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        isLoading,
        setActiveProject,
        selectProjectById,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
