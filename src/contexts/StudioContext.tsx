import { createContext, useState, ReactNode, useContext } from 'react';
import { StudioJob } from '../types';

interface StudioContextType {
  // State
  jobs: StudioJob[];
  selectedJob: StudioJob | null;
  isAuthenticated: boolean;

  // Actions
  setJobs: (jobs: StudioJob[]) => void;
  selectJob: (job: StudioJob | null) => void;
  updateJobStatus: (jobId: string, status: StudioJob['status']) => void;
  authenticate: (password: string) => boolean;
  logout: () => void;
}

export const StudioContext = createContext<StudioContextType | undefined>(undefined);

interface StudioProviderProps {
  children: ReactNode;
}

// Mock studio password - in production, this would be proper auth
const STUDIO_PASSWORD = 'studio123';

export function StudioProvider({ children }: StudioProviderProps) {
  const [jobs, setJobs] = useState<StudioJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<StudioJob | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const selectJob = (job: StudioJob | null) => {
    setSelectedJob(job);
  };

  const updateJobStatus = (jobId: string, status: StudioJob['status']) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.jobId === jobId ? { ...job, status } : job
      )
    );

    if (selectedJob?.jobId === jobId) {
      setSelectedJob({ ...selectedJob, status });
    }
  };

  const authenticate = (password: string): boolean => {
    const isValid = password === STUDIO_PASSWORD;
    setIsAuthenticated(isValid);
    return isValid;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSelectedJob(null);
  };

  const value: StudioContextType = {
    jobs,
    selectedJob,
    isAuthenticated,
    setJobs,
    selectJob,
    updateJobStatus,
    authenticate,
    logout,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const context = useContext(StudioContext);

  if (!context) {
    throw new Error('useStudio must be used within StudioProvider');
  }

  return context;
}
