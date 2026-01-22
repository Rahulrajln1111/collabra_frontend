import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Plus, Code, Folder, Calendar, X, ArrowRight, Zap, Users, Star, LogOut } from 'lucide-react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../config/firebase';

const CollabraLogo = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
        <Code className={`${sizeClasses[size]} text-white`} />
      </div>
      <span className={`${sizeClasses[size]} font-bold text-white`}>Collabra AI</span>
    </div>
  );
};

const Home = () => {
  const { user, logout, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isProjectsLoading , setIsProjectsLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Function to format relative time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');

      const response = await axios.post(
        '/projects/create',
        {
          name: projectName,
          description: projectDescription
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(response);

      const mongoProjectId = response.data.project?._id;
    
      const result = await createProject(mongoProjectId, {
        name: projectName,
        description: projectDescription,
        template: 'empty', // This will create an empty file tree
        isPublic: false,
        tags: ['web', 'development']
      });

      console.log("Project added to Firebse" , result);
      
      // Clear form
      setProjectName('');
      setProjectDescription('');
      setShowModal(false);
      
      // Refresh projects list
      fetchProjects();
      
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProjectName('');
    setProjectDescription('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Effect to handle clicks outside the profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/projects/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProjects(response.data.projects);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      if (err.response?.status === 401) {
        // The token is invalid or expired, log the user out.
        logout();
      }
    } finally {
      setIsProjectsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // This effect correctly handles auth state changes.
    if (userLoading) {
      return; // Wait until the user context has finished loading.
    }
    const token = localStorage.getItem('authToken');

    if (user) {
      fetchProjects();
    } else if (!token) {
      // Only redirect if there is no user AND no token.
      // This prevents the redirect during the small window after login.
      navigate('/login');
    }
  }, [user, userLoading, navigate, fetchProjects]);

  if (userLoading || isProjectsLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>

      {/* Header */}
      <header className="relative z-20 p-6 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <CollabraLogo size="md" />
          
          <div className="flex items-center space-x-4">
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setShowProfileDropdown(prev => !prev)} 
                className="flex items-center space-x-3 text-slate-300 p-1 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                </div>
                <span className="hidden sm:inline font-medium">Welcome, {user?.name?.split(' ')[0]}</span>
              </button>

              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-slate-800/50 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-20 text-white">
                  <div className="p-4 border-b border-white/10">
                    <p className="font-semibold truncate">{user?.name}</p>
                    <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Your <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Projects</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Manage your collaborative coding projects with AI-powered assistance
            </p>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 flex items-center space-x-2 mx-auto group"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  navigate(`/project/${project._id}`, {
                    state: { project }
                  })
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <Folder className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">{project.users.length}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {project.name}
                </h3>
                
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {getRelativeTime(project.updatedAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Users className="w-4 h-4 m-2" /> 
                    <span>{project.users.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{projects.length}</h3>
                  <p className="text-slate-400">Active Projects</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {projects.reduce((acc, p) => acc + p.users.length, 0)}
                  </h3>
                  <p className="text-slate-400">Collaborators</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-teal-500/20 rounded-lg">
                  <Code className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">24/7</h3>
                  <p className="text-slate-400">AI Assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Project</h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Description (Optional)
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm resize-none"
                  placeholder="Enter project description"
                  rows="3"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !projectName.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 