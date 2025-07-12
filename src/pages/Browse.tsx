import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, MessageSquare, Filter } from 'lucide-react';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  location: string;
  skillsOffered: Array<{
    name: string;
    description: string;
    level: string;
  }>;
  skillsWanted: Array<{
    name: string;
    level: string;
  }>;
  availability: {
    [key: string]: boolean;
  };
  rating: {
    average: number;
    count: number;
  };
  completedSwaps: number;
}

function Browse() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [sentRequests, setSentRequests] = useState<{ [userId: string]: boolean }>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, locationFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/browse');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.skillsOffered.some(skill =>
          skill.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(user =>
        user.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const openSwapModal = (user: User) => {
    setSelectedUser(user);
    setShowSwapModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Skills</h1>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search skills or names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredUsers.length} users found
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  {user.location && (
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {user.location}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {user.rating.count > 0 && (
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{user.rating.average.toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">({user.rating.count} swaps)</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {user.completedSwaps} swaps completed
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered:</h4>
                <div className="flex flex-wrap gap-2">
                  {user.skillsOffered.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                  {user.skillsOffered.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{user.skillsOffered.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Looking for:</h4>
                <div className="flex flex-wrap gap-2">
                  {user.skillsWanted && user.skillsWanted.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available:</h4>
                <div className="flex flex-wrap gap-2">
                  {user.availability && Object.entries(user.availability).filter(([k, v]) => v).map(([key]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1"></div> {/* Spacer to push button to bottom */}

              <button
                onClick={() => openSwapModal(user)}
                className={`w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 ${sentRequests[user._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!!sentRequests[user._id]}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {sentRequests[user._id] ? 'Request Sent' : 'Request Swap'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or check back later for more users.
          </p>
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && selectedUser && (
        <SwapRequestModal
          user={selectedUser}
          onClose={() => {
            setShowSwapModal(false);
            setSelectedUser(null);
          }}
          setSentRequests={setSentRequests}
        />
      )}
    </div>
  );
}

// Swap Request Modal Component
function SwapRequestModal({ user, onClose, setSentRequests }: { user: User; onClose: () => void; setSentRequests: React.Dispatch<React.SetStateAction<{ [userId: string]: boolean }>> }) {
  const [formData, setFormData] = useState({
    recipientSkill: '',
    requesterSkill: '',
    message: ''
  });
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setMySkills(response.data.skillsOffered);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchMyProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedRecipientSkill = user.skillsOffered.find(skill => skill.name === formData.recipientSkill);
      const selectedRequesterSkill = mySkills.find((skill: any) => skill.name === formData.requesterSkill);

      await api.post('/swaps', {
        recipient: user._id,
        recipientSkill: {
          name: selectedRecipientSkill?.name,
          description: selectedRecipientSkill?.description
        },
        requesterSkill: {
          name: selectedRequesterSkill?.name,
          description: selectedRequesterSkill?.description
        },
        message: formData.message
      });
      alert('Swap request sent successfully!');
      setSentRequests((prev) => ({ ...prev, [user._id]: true }));
      onClose();
    } catch (error) {
      alert('Failed to send swap request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Request Skill Swap with {user.name}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill you want to learn from {user.name}:
            </label>
            <select
              value={formData.recipientSkill}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientSkill: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select a skill...</option>
              {user.skillsOffered.map((skill, index) => (
                <option key={index} value={skill.name}>
                  {skill.name} ({skill.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill you want to offer in return:
            </label>
            <select
              value={formData.requesterSkill}
              onChange={(e) => setFormData(prev => ({ ...prev, requesterSkill: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select a skill...</option>
              {mySkills.map((skill: any, index) => (
                <option key={index} value={skill.name}>
                  {skill.name} ({skill.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional):
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              placeholder="Tell them why you'd like to swap skills..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Browse;