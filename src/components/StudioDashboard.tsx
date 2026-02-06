import { useState, useEffect, FormEvent } from 'react';
import {
  LogOut,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { useStudio } from '../contexts/StudioContext';
import { StudioJob } from '../types';

interface StudioDashboardProps {
  onExit: () => void;
}

export default function StudioDashboard({ onExit }: StudioDashboardProps) {
  const { jobs, selectedJob, selectJob, updateJobStatus, isAuthenticated, authenticate, logout, setJobs } =
    useStudio();
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StudioJob['status'] | 'all'>('all');

  // Mock jobs for demonstration
  useEffect(() => {
    if (isAuthenticated && jobs.length === 0) {
      // Add mock jobs
      const mockJobs: StudioJob[] = [
        {
          jobId: 'job_1706737200000',
          customerName: 'John Doe',
          createdAt: new Date('2024-01-31T10:00:00'),
          status: 'pending',
          imageCount: 12,
        },
        {
          jobId: 'job_1706737300000',
          customerName: 'Jane Smith',
          createdAt: new Date('2024-01-31T11:30:00'),
          status: 'review',
          imageCount: 8,
        },
        {
          jobId: 'job_1706737400000',
          customerName: 'Bob Johnson',
          createdAt: new Date('2024-01-31T12:45:00'),
          status: 'completed',
          imageCount: 15,
        },
      ];
      // In a real app, this would fetch from the API
      setJobs(mockJobs);
    }
  }, [isAuthenticated, jobs.length, setJobs]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const success = authenticate(password);
    if (!success) {
      alert('Invalid password. Try: studio123');
    }
  };

  const handleLogout = () => {
    logout();
    onExit();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: StudioJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'review':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'completed':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="p-8 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl">
            <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text mb-6 text-center">
              Studio Login
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Enter studio password"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white hover:scale-102 transition-all"
              >
                Login
              </button>

              <button
                type="button"
                onClick={onExit}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </form>

            <p className="mt-4 text-xs text-center text-slate-500">
              Demo password: studio123
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text">
            Studio Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-slate-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job ID or customer name..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StudioJob['status'] | 'all')}
              className="flex-1 px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Job ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Images
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr
                      key={job.jobId}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer"
                      onClick={() => selectJob(job)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-300">{job.jobId}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {job.customerName || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{job.imageCount}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {job.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectJob(job);
                            }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                          </button>
                          {job.status === 'review' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateJobStatus(job.jobId, 'approved');
                                }}
                                className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateJobStatus(job.jobId, 'pending');
                                }}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Job Details Modal (if selected) */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-200">Job Details</h3>
                <button
                  onClick={() => selectJob(null)}
                  className="w-10 h-10 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Job ID</p>
                  <p className="font-mono text-slate-200">{selectedJob.jobId}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Customer</p>
                  <p className="text-slate-200">{selectedJob.customerName || 'Anonymous'}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Images</p>
                  <p className="text-slate-200">{selectedJob.imageCount} photos</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      selectedJob.status
                    )}`}
                  >
                    {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                  </span>
                </div>

                {selectedJob.selectedTheme && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Selected Theme</p>
                    <p className="text-slate-200">{selectedJob.selectedTheme.name}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {selectedJob.status === 'review' && (
                    <>
                      <button
                        onClick={() => {
                          updateJobStatus(selectedJob.jobId, 'approved');
                          selectJob(null);
                        }}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          updateJobStatus(selectedJob.jobId, 'pending');
                          selectJob(null);
                        }}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => selectJob(null)}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-slate-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
