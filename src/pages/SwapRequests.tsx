import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, Star, Trash2 } from 'lucide-react';
import api from '../services/api';

interface SwapRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
  };
  recipient: {
    _id: string;
    name: string;
    email: string;
  };
  requesterSkill: {
    name: string;
    description: string;
  };
  recipientSkill: {
    name: string;
    description: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
}

function SwapRequests() {
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<SwapRequest | null>(null);

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      const response = await api.get('/swaps/my-requests');
      setSwaps(response.data);
    } catch (error) {
      console.error('Failed to fetch swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSwapStatus = async (swapId: string, status: string) => {
    try {
      await api.put(`/swaps/${swapId}/status`, { status });
      fetchSwaps(); // Refresh the list
    } catch (error) {
      console.error('Failed to update swap status:', error);
      alert('Failed to update swap status');
    }
  };

  const getCurrentUserId = () => {
    // This would typically come from your auth context
    // For now, we'll get it from the first swap request
    return swaps.length > 0 ? swaps[0].requester._id : '';
  };

  const getFilteredSwaps = () => {
    const currentUserId = getCurrentUserId();
    if (activeTab === 'received') {
      return swaps.filter(swap => swap.recipient._id === currentUserId);
    } else {
      return swaps.filter(swap => swap.requester._id === currentUserId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const canRate = (swap: SwapRequest) => {
    return swap.status === 'completed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const filteredSwaps = getFilteredSwaps();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Swap Requests</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Received Requests
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sent Requests
            </button>
          </nav>
        </div>
      </div>

      {/* Swap Requests List */}
      <div className="space-y-6">
        {filteredSwaps.map((swap) => (
          <div key={swap._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {activeTab === 'received' ? swap.requester.name : swap.recipient.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(swap.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                  {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {activeTab === 'received' ? 'They want to learn:' : 'You want to learn:'}
                </h4>
                <p className="text-purple-700 dark:text-purple-300 font-medium">{swap.recipientSkill.name}</p>
                {swap.recipientSkill.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{swap.recipientSkill.description}</p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {activeTab === 'received' ? 'They offer:' : 'You offer:'}
                </h4>
                <p className="text-blue-700 dark:text-blue-300 font-medium">{swap.requesterSkill.name}</p>
                {swap.requesterSkill.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{swap.requesterSkill.description}</p>
                )}
              </div>
            </div>

            {swap.message && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Message:</h4>
                <p className="text-gray-700 dark:text-gray-300">{swap.message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              {activeTab === 'received' && swap.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateSwapStatus(swap._id, 'rejected')}
                    className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => updateSwapStatus(swap._id, 'accepted')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </button>
                </>
              )}

              {activeTab === 'sent' && swap.status === 'pending' && (
                <button
                  onClick={() => updateSwapStatus(swap._id, 'cancelled')}
                  className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              )}

              {swap.status === 'accepted' && (
                <button
                  onClick={() => updateSwapStatus(swap._id, 'completed')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Completed
                </button>
              )}

              {canRate(swap) && (
                <button
                  onClick={() => {
                    setSelectedSwap(swap);
                    setShowRatingModal(true);
                  }}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Rate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSwaps.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No {activeTab} requests
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {activeTab === 'received' 
              ? "You haven't received any swap requests yet."
              : "You haven't sent any swap requests yet. Start browsing skills!"
            }
          </p>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedSwap && (
        <RatingModal
          swap={selectedSwap}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedSwap(null);
          }}
          onSubmit={() => {
            setShowRatingModal(false);
            setSelectedSwap(null);
            fetchSwaps();
          }}
        />
      )}
    </div>
  );
}

// Rating Modal Component
function RatingModal({ 
  swap, 
  onClose, 
  onSubmit 
}: { 
  swap: SwapRequest; 
  onClose: () => void; 
  onSubmit: () => void; 
}) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/swaps/${swap._id}/rating`, {
        rating,
        feedback
      });
      alert('Rating submitted successfully!');
      onSubmit();
    } catch (error) {
      alert('Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rate your experience
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (1-5 stars):
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback (optional):
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              rows={4}
              placeholder="Share your experience with this skill swap..."
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
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SwapRequests;