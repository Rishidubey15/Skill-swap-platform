import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, Users, Star, MessageSquare, TrendingUp } from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  pendingRequests: number;
  completedSwaps: number;
  rating: number;
  totalSkills: number;
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    completedSwaps: 0,
    rating: 0,
    totalSkills: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileResponse, swapsResponse] = await Promise.all([
          api.get('/users/profile'),
          api.get('/swaps/my-requests')
        ]);

        const profile = profileResponse.data;
        const swaps = swapsResponse.data;

        const pendingRequests = swaps.filter((swap: any) => swap.status === 'pending').length;
        const completedSwaps = swaps.filter((swap: any) => swap.status === 'completed').length;
        const totalSkills = profile.skillsOffered.length + profile.skillsWanted.length;

        setStats({
          pendingRequests,
          completedSwaps,
          rating: profile.rating.average,
          totalSkills
        });

        setRecentActivity(swaps.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Here's what's happening with your skill swaps today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">Completed Swaps</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedSwaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.rating ? stats.rating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-white">Total Skills</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSkills}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/profile"
              className="flex items-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
            >
              <PlusCircle className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Update Your Skills</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Add or modify your offered and wanted skills</p>
              </div>
            </a>
            <a
              href="/browse"
              className="flex items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Browse Skills</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Find people with skills you want to learn</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Swap request {activity.status}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              No recent activity. Start by browsing skills or updating your profile!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;