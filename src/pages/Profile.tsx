import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, User, MapPin, Clock, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

interface Skill {
  name: string;
  description: string;
  level: string;
}

interface Profile {
  name: string;
  email: string;
  location: string;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
    mornings: boolean;
  };
  isPublic: boolean;
  profilePhoto?: string;
}

function Profile() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: {
      weekdays: false,
      weekends: false,
      evenings: false,
      mornings: false
    },
    isPublic: true,
    profilePhoto: ''
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  // Handle profile photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profilePhoto: reader.result as string }));
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await api.put('/users/profile', profile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (type: 'offered' | 'wanted') => {
    const newSkill = { name: '', description: '', level: 'Intermediate' };
    if (type === 'offered') {
      setProfile(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkill]
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkill]
      }));
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', index: number) => {
    if (type === 'offered') {
      setProfile(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter((_, i) => i !== index)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSkill = (type: 'offered' | 'wanted', index: number, field: string, value: string) => {
    if (type === 'offered') {
      setProfile(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.map((skill, i) =>
          i === index ? { ...skill, [field]: value } : skill
        )
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.map((skill, i) =>
          i === index ? { ...skill, [field]: value } : skill
        )
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-6 h-6 mr-2 text-gray-900 dark:text-gray-100" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <img
                src={photoPreview || profile.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.name)}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border border-gray-300 dark:border-gray-700"
              />
              <label htmlFor="profilePhoto" className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-1 cursor-pointer hover:bg-purple-700">
                <Plus className="w-4 h-4" />
              </label>
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-md ${
              message.includes('success') 
                ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <MapPin className="w-4 h-4 inline mr-1 text-gray-700 dark:text-gray-200" />
                Location (Optional)
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-black-50 p-4 rounded-lg">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Privacy Settings</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={profile.isPublic}
                  onChange={(e) => setProfile(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 border-gray-300 dark:border-gray-700 rounded focus:ring-purple-500"
                />
                <label htmlFor="isPublic" className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-200">
                  {profile.isPublic ? <Eye className="w-4 h-4 mr-1 text-gray-700 dark:text-gray-200" /> : <EyeOff className="w-4 h-4 mr-1 text-gray-700 dark:text-gray-200" />}
                  Make my profile public (others can find and contact me)
                </label>
              </div>
            </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-900 dark:text-gray-100" />
              Availability
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(profile.availability).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      availability: { ...prev.availability, [key]: e.target.checked }
                    }))}
                    className="h-4 w-4 text-purple-600 border-gray-300 dark:border-gray-700 rounded focus:ring-purple-500"
                  />
                  <label htmlFor={key} className="ml-2 text-sm text-gray-700 dark:text-gray-200 capitalize">
                    {key}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Offered */}
          <div>
            <div className="flex justify-between items-center mb-4 mt-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Skills I Offer</h3>
              <button
                onClick={() => addSkill('offered')}
                className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>
            <div className="space-y-4">
              {profile.skillsOffered.map((skill, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black-200 mb-1">
                        Skill Name
                      </label>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill('offered', index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="e.g., Web Development"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-1">
                        Level
                      </label>
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkill('offered', index, 'level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeSkill('offered', index)}
                        className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-900 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-black-200 mb-1">
                      Description
                    </label>
                    <textarea
                      value={skill.description}
                      onChange={(e) => updateSkill('offered', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 dark:placeholder-gray-500"
                      rows={2}
                      placeholder="Describe your experience and what you can teach..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div>
            <div className="flex justify-between items-center mb-4 mt-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Skills I Want to Learn</h3>
              <button
                onClick={() => addSkill('wanted')}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>
            <div className="space-y-4">
              {profile.skillsWanted.map((skill, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-1">
                        Skill Name
                      </label>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill('wanted', index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="e.g., Graphic Design"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black-200 mb-1">
                        Desired Level
                      </label>
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkill('wanted', index, 'level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeSkill('wanted', index)}
                        className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-900 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-black dark:text-white mb-1">
                      What you want to learn
                    </label>
                    <textarea
                      value={skill.description}
                      onChange={(e) => updateSkill('wanted', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 dark:placeholder-gray-500"
                      rows={2}
                      placeholder="Describe what aspects you want to learn..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Profile;






