import React, { useState, useEffect } from 'react';
import { Users, Ban, CheckCircle, XCircle, BarChart3, Download } from 'lucide-react';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  isBanned: boolean;
  createdAt: string;
  completedSwaps: number;
  rating: {
    average: number;
    count: number;
  };
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalSwaps: number;
  completedSwaps: number;
  pendingSwaps: number;
  totalRatings: number;
}

function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSwaps: 0,
    completedSwaps: 0,
    pendingSwaps: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  type AdminTab = 'stats' | 'users' | 'swaps' | 'messages' | 'skills';
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [swaps, setSwaps] = useState<any[]>([]);
  const [swapStatus, setSwapStatus] = useState('pending');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [platformMessages, setPlatformMessages] = useState<{title:string,content:string,date:string}[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [skillType, setSkillType] = useState<'skillsOffered' | 'skillsWanted'>('skillsOffered');
  const [skillIndex, setSkillIndex] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);

      setUsers(usersResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBan = async (userId: string, isBanned: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/ban`, { isBanned: !isBanned });
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Failed to update user ban status:', error);
      alert('Failed to update user status');
    }
  };


  // Fetch swaps by status
  const fetchSwapsByStatus = async (status: string) => {
    setSwapStatus(status);
    try {
      const res = await api.get(`/admin/swaps/${status}`);
      setSwaps(res.data);
    } catch (error) {
      setSwaps([]);
    }
  };

  // Export report
  const exportReport = async (type: string) => {
    setReportLoading(true);
    try {
      const res = await api.get(`/admin/report/${type}`);
      setReportData(res.data);
      // Download as JSON
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download report');
    } finally {
      setReportLoading(false);
    }
  };

  // Send platform-wide message
  const sendPlatformMessage = async () => {
    try {
      await api.post('/admin/message', { title: messageTitle, content: messageContent });
      alert('Message sent!');
      setMessageTitle('');
      setMessageContent('');
      fetchPlatformMessages();
    } catch (error) {
      alert('Failed to send message');
    }
  };

  // Fetch platform-wide messages
  const fetchPlatformMessages = async () => {
    try {
      const res = await api.get('/admin/messages');
      setPlatformMessages(res.data.messages || []);
    } catch (error) {
      setPlatformMessages([]);
    }
  };

  // Reject skill
  const rejectSkill = async () => {
    if (!selectedUser) return;
    try {
      await api.patch(`/admin/skills/${selectedUser._id}/reject`, {
        skillType,
        skillIndex,
        reason: rejectionReason
      });
      alert('Skill rejected!');
      setSelectedUser(null);
      setRejectionReason('');
      fetchAdminData();
    } catch (error) {
      alert('Failed to reject skill');
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') fetchPlatformMessages();
    if (activeTab === 'swaps') fetchSwapsByStatus(swapStatus);
    // eslint-disable-next-line
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Admin Dashboard</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
                <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('stats')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Statistics</button>
            <button onClick={() => setActiveTab('users')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>User Management</button>
            <button onClick={() => { setActiveTab('swaps'); fetchSwapsByStatus('pending'); }} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'swaps' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Monitor Swaps</button>
            <button onClick={() => setActiveTab('messages')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'messages' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Platform Messages</button>
            <button onClick={() => setActiveTab('skills')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'skills' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Reject Skills</button>
          </nav>
        </div>
      </div>

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Each stats card with dark mode */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Swaps</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSwaps}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed Swaps</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completedSwaps}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Swaps</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingSwaps}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-red-600 dark:text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Ratings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalRatings}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button disabled={reportLoading} onClick={() => exportReport('user-activity')} className="flex items-center justify-center px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
                <Download className="w-5 h-5 mr-2" />
                Export User Report
              </button>
              <button disabled={reportLoading} onClick={() => exportReport('swap-stats')} className="flex items-center justify-center px-4 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors">
                <Download className="w-5 h-5 mr-2" />
                Export Swap Report
              </button>
              <button disabled={reportLoading} onClick={() => exportReport('feedback-logs')} className="flex items-center justify-center px-4 py-3 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors">
                <Download className="w-5 h-5 mr-2" />
                Export Feedback Report
              </button>
            </div>
          </div>
      {/* Monitor Swaps Tab */}
      {activeTab === 'swaps' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitor Swaps</h3>
          <div className="mb-4 flex gap-2">
            {['pending','accepted','rejected','completed','cancelled'].map((status) => (
              <button key={status} onClick={() => fetchSwapsByStatus(status)} className={`px-3 py-1 rounded ${swapStatus===status?'bg-purple-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{status.charAt(0).toUpperCase()+status.slice(1)}</button>
            ))}
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Admin Dashboard</h1>
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('stats')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Statistics</button>
            <button onClick={() => setActiveTab('users')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>User Management</button>
            <button onClick={() => { setActiveTab('swaps'); fetchSwapsByStatus('pending'); }} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'swaps' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Monitor Swaps</button>
            <button onClick={() => setActiveTab('messages')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'messages' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Platform Messages</button>
            <button onClick={() => setActiveTab('skills')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'skills' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Reject Skills</button>
          </nav>
        </div>
      </div>

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <>
          {/* ...existing code for stats tab... */}
        </>
      )}
      {/* Monitor Swaps Tab */}
      {activeTab === 'swaps' && (
        <>
          {/* ...existing code for swaps tab... */}
        </>
      )}
      {/* Platform Messages Tab */}
      {activeTab === 'messages' && (
        <>
          {/* ...existing code for messages tab... */}
        </>
      )}
      {/* Reject Skills Tab */}
      {activeTab === 'skills' && (
        <>
          {/* ...existing code for skills tab... */}
        </>
      )}
      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {/* ...existing code for users tab... */}
        </>
      )}
    </div>
  );
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-orange-500"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500"></div>
          </div>
          {selectedUser && (
            <div className="mb-4">
              <label className="block mb-2">Skill Type:</label>
              <select value={skillType} onChange={e=>setSkillType(e.target.value as any)} className="border px-3 py-2 rounded w-full mb-2">
                <option value="skillsOffered">Skills Offered</option>
                <option value="skillsWanted">Skills Wanted</option>
              </select>
              <label className="block mb-2">Select Skill:</label>
              <select value={skillIndex} onChange={e=>setSkillIndex(Number(e.target.value))} className="border px-3 py-2 rounded w-full mb-2">
                {selectedUser[skillType]?.map((skill:any, idx:number)=>(<option key={idx} value={idx}>{skill.name}: {skill.description}</option>))}
              </select>
              <label className="block mb-2">Rejection Reason:</label>
              <input type="text" value={rejectionReason} onChange={e=>setRejectionReason(e.target.value)} placeholder="Reason" className="border px-3 py-2 rounded w-full mb-2" />
              <button onClick={rejectSkill} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject Skill</button>
            </div>
          )}
        </div>
      )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Swaps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className={user.isBanned ? 'bg-red-50 dark:bg-red-900' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{user.completedSwaps}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {user.rating.count > 0 
                          ? `${user.rating.average.toFixed(1)} (${user.rating.count})`
                          : 'No ratings'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isBanned 
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' 
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleUserBan(user._id, user.isBanned)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                          user.isBanned
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                        } transition-colors`}
                      >
                        <Ban className="w-3 h-3 mr-1" />
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default AdminDashboard;