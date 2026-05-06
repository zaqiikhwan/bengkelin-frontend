import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import PublicHeader from '../components/PublicHeader';
import { 
  BuildingStorefrontIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CogIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { BengkelDetailResponse } from '../types/api';

const BengkelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, mitra, logout } = useAuth();
  const [bengkel, setBengkel] = useState<BengkelDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testimonialsPage, setTestimonialsPage] = useState(1);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadBengkelDetail();
    }
  }, [id]);

  const loadBengkelDetail = async (page = 1) => {
    try {
      setLoading(page === 1);
      if (page > 1) setLoadingTestimonials(true);
      
      const response = await apiService.getBengkelDetail(id!, page, 10);
      
      if (response.success && response.data) {
        if (page === 1) {
          setBengkel(response.data);
        } else {
          // Append new testimonials for pagination
          setBengkel(prev => {
            if (!prev || !response.data) return prev;
            return {
              ...prev,
              testimonials: {
                ...response.data.testimonials,
                data: [...prev.testimonials.data, ...response.data.testimonials.data]
              }
            };
          });
        }
        setTestimonialsPage(page);
      } else {
        setError('Bengkel not found');
      }
    } catch (err: any) {
      console.error('Failed to load bengkel detail:', err);
      if (err.response?.status === 404) {
        setError('Bengkel not found');
      } else {
        setError('Failed to load bengkel details');
      }
    } finally {
      setLoading(false);
      setLoadingTestimonials(false);
    }
  };

  const handleBookService = async () => {
    if (bengkel.user_context?.can_book_service) {
      // Check if there are available services
      const availableServices = bengkel.services?.filter(service => service.is_available) || [];
      
      if (availableServices.length === 0) {
        alert('Sorry, no services are currently available for booking at this bengkel.');
        return;
      }
      
      setBookingLoading(true);
      
      // Add a small delay to show loading state
      setTimeout(() => {
        // Navigate to booking page with bengkel ID
        navigate(`/booking/${bengkel.bengkel_id}`);
        setBookingLoading(false);
      }, 500);
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  const ContactModal = () => {
    if (!showContactModal || !bengkel) return null;

    const phoneNumber = bengkel.bengkel_phone;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const whatsappNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    const handleStartChat = async () => {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login');
        return;
      }

      try {
        // Create or get existing chat room with this bengkel
        const response = await apiService.createChatRoom({
          bengkel_id: bengkel.bengkel_id
        });

        if (response.success && response.data) {
          // Navigate to chat page with the room selected
          navigate('/chat', { 
            state: { 
              selectedRoomId: response.data.id,
              bengkelName: bengkel.bengkel_name,
              newRoom: response.data // Pass the entire room data
            } 
          });
          setShowContactModal(false);
        } else {
          alert('Failed to start chat. Please try again.');
        }
      } catch (error: any) {
        console.error('Failed to create chat room:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          alert('Failed to start chat. Please try again.');
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact {bengkel.bengkel_name}</h3>
            <button
              onClick={() => setShowContactModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{phoneNumber}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Chat Button - Full width and prominent */}
              <button
                onClick={handleStartChat}
                className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{isAuthenticated ? 'Start Chat' : 'Login to Chat'}</span>
              </button>
              
              {/* Call and WhatsApp buttons in a row */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    window.open(`tel:${phoneNumber}`, '_self');
                    setShowContactModal(false);
                  }}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5" />
                  <span>Call Now</span>
                </button>
                
                <button
                  onClick={() => {
                    window.open(`https://wa.me/${whatsappNumber}?text=Hello, I'm interested in your services at ${bengkel.bengkel_name}`, '_blank');
                    setShowContactModal(false);
                  }}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>💬</span>
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
            
            <div className="text-center pt-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const loadMoreTestimonials = () => {
    if (bengkel && bengkel.testimonials?.total_pages && testimonialsPage < bengkel.testimonials.total_pages) {
      loadBengkelDetail(testimonialsPage + 1);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarSolidIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!bengkel) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthenticated && <PublicHeader />}
      
      {/* Contact Modal */}
      <ContactModal />
      
      {/* Authenticated Header */}
      {isAuthenticated && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <BuildingStorefrontIcon className="h-8 w-8 text-primary-600" />
                  <span className="text-xl font-bold text-gray-900">Bengkelin</span>
                </Link>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/bengkels" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Find Bengkels
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  My Orders
                </Link>
                <Link to="/chat" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Chat
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {user?.first_name || mitra?.first_name || 'User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {bengkel.avatar_url ? (
                <img
                  src={bengkel.avatar_url}
                  alt={bengkel.bengkel_name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <BuildingStorefrontIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{bengkel.bengkel_name}</h1>
                  {bengkel.user_context?.is_owner && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <CogIcon className="w-3 h-3 mr-1" />
                      Your Bengkel
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.round(bengkel.rating?.average_rating || 0))}
                    <span className="text-sm text-gray-600 ml-2">
                      {(bengkel.rating?.average_rating || 0).toFixed(1)} ({bengkel.rating?.total_reviews || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {bengkel.is_open ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="w-3 h-3 mr-1" />
                        Closed
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Authentication status indicator */}
                {!bengkel.user_context?.is_authenticated && (
                  <div className="mt-2 text-sm text-amber-600 flex items-center">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    Limited view - Login for full access
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {bengkel.user_context?.is_owner ? (
                <Link to="/bengkel" className="btn-primary">
                  <CogIcon className="w-4 h-4 mr-2" />
                  Manage Bengkel
                </Link>
              ) : bengkel.user_context?.can_book_service ? (
                <button 
                  onClick={handleBookService} 
                  disabled={bookingLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Book Service'
                  )}
                </button>
              ) : (
                <Link to="/login" className="btn-primary">
                  Login to Book
                </Link>
              )}
              <button onClick={handleContact} className="btn-secondary">
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Call to Action for Anonymous Users */}
        {bengkel.call_to_action && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{bengkel.call_to_action?.message || 'Join us for full access'}</h3>
                <p className="text-primary-100">Get full access to all services, photos, and reviews</p>
              </div>
              <div className="flex space-x-3">
                <Link to="/login" className="bg-white text-primary-600 px-4 py-2 rounded-md font-medium hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-500 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-400">
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Analytics for Authenticated Users */}
        {bengkel.analytics && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{bengkel.analytics?.total_services || 0}</div>
                <div className="text-sm text-gray-600">Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{bengkel.analytics?.total_photos || 0}</div>
                <div className="text-sm text-gray-600">Photos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{bengkel.analytics?.operational_days || 0}</div>
                <div className="text-sm text-gray-600">Open Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{bengkel.analytics?.total_addresses || 0}</div>
                <div className="text-sm text-gray-600">Locations</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photos */}
            {bengkel.photos && bengkel.photos.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhotoIcon className="w-5 h-5 mr-2 text-primary-600" />
                  Photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {bengkel.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.photo_url}
                      alt="Bengkel"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-primary-600" />
                Available Services
              </h2>
              {bengkel.services && bengkel.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bengkel.services.map((service) => (
                    <div 
                      key={service.id} 
                      className={`border border-gray-200 rounded-lg p-4 transition-all ${
                        service.is_available 
                          ? 'hover:shadow-md hover:border-primary-300 cursor-pointer' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (service.is_available && bengkel.user_context?.can_book_service) {
                          navigate(`/booking/${bengkel.bengkel_id}?service=${service.id}`);
                        } else if (service.is_available && !bengkel.user_context?.can_book_service) {
                          navigate('/login');
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{service.nama_service}</h3>
                            {service.is_available ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Unavailable
                              </span>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                          {service.is_available && bengkel.user_context?.can_book_service && (
                            <p className="text-xs text-primary-600 mt-2">Click to book this service</p>
                          )}
                        </div>
                        {service.price && service.price > 0 && (
                          <div className="ml-4 text-right">
                            <p className="font-semibold text-primary-600">{formatPrice(service.price)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No services available at the moment.</p>
              )}
            </div>

            {/* Testimonials */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-primary-600" />
                Customer Reviews ({bengkel.testimonials?.total_count || 0})
              </h2>
              {bengkel.testimonials?.data && bengkel.testimonials.data.length > 0 ? (
                <div className="space-y-4">
                  {bengkel.testimonials.data.map((testimonial) => (
                    <div key={testimonial.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{testimonial.user_name}</span>
                            {renderStars(testimonial.rating)}
                            <span className="text-xs text-gray-500">{formatDate(testimonial.created_at)}</span>
                          </div>
                          <p className="text-gray-700">{testimonial.testimoni}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More for Authenticated Users */}
                  {bengkel.testimonials?.total_pages && testimonialsPage < bengkel.testimonials.total_pages && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMoreTestimonials}
                        disabled={loadingTestimonials}
                        className="btn-secondary"
                      >
                        {loadingTestimonials ? 'Loading...' : 'Load More Reviews'}
                      </button>
                    </div>
                  )}
                  
                  {/* Limited View Message for Anonymous Users */}
                  {bengkel.testimonials?.message && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center">
                        <EyeIcon className="w-5 h-5 text-amber-600 mr-2" />
                        <div>
                          <p className="text-sm text-amber-800">{bengkel.testimonials.message}</p>
                          {bengkel.testimonials?.showing && (
                            <p className="text-xs text-amber-600 mt-1">
                              Showing {bengkel.testimonials.showing} of {bengkel.testimonials.total_count} reviews
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Link to="/login" className="text-sm text-amber-800 font-medium hover:text-amber-900 flex items-center">
                          Login to see all reviews
                          <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.open(`tel:${bengkel.bengkel_phone}`, '_self')}
                  className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 p-2 rounded-md transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 hover:text-primary-600">{bengkel.bengkel_phone}</span>
                </button>
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{bengkel.jumlah_montir} mechanics</span>
                </div>
                
                {/* Quick Contact Actions */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      key="call-button"
                      onClick={() => window.open(`tel:${bengkel.bengkel_phone}`, '_self')}
                      className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      <span>Call</span>
                    </button>
                    <button
                      key="whatsapp-button"
                      onClick={() => {
                        const cleanPhone = bengkel.bengkel_phone.replace(/\D/g, '');
                        const whatsappNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                        window.open(`https://wa.me/${whatsappNumber}?text=Hello, I'm interested in your services at ${bengkel.bengkel_name}`, '_blank');
                      }}
                      className="bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>💬</span>
                      <span>WA</span>
                    </button>
                    <button
                      key="chat-button"
                      onClick={async () => {
                        if (!isAuthenticated) {
                          navigate('/login');
                          return;
                        }
                        
                        try {
                          const response = await apiService.createChatRoom({
                            bengkel_id: bengkel.bengkel_id
                          });

                          if (response.success && response.data) {
                            navigate('/chat', { 
                              state: { 
                                selectedRoomId: response.data.id,
                                bengkelName: bengkel.bengkel_name,
                                newRoom: response.data // Pass the entire room data
                              } 
                            });
                          }
                        } catch (error) {
                          console.error('Failed to create chat room:', error);
                          if (!isAuthenticated) {
                            navigate('/login');
                          }
                        }
                      }}
                      className="bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Options */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Options</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {bengkel.home_service ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-gray-700">Home Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  {bengkel.store_service ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-gray-700">In-Store Service</span>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            {bengkel.operasionals && bengkel.operasionals.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-primary-600" />
                  Operating Hours
                </h3>
                <div className="space-y-2">
                  {bengkel.operasionals.map((operational) => (
                    <div key={operational.id} className="flex items-center justify-between">
                      <span className="text-gray-700">{operational.hari}</span>
                      <span className="text-gray-900 font-medium">
                        {operational.jam_buka} - {operational.jam_tutup}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addresses */}
            {bengkel.addresses && bengkel.addresses.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-primary-600" />
                  Locations
                </h3>
                <div className="space-y-3">
                  {bengkel.addresses.map((address) => (
                    <div key={address.id} className="border-l-4 border-primary-500 pl-3">
                      <h4 className="font-medium text-gray-900">{address.address_label}</h4>
                      <p className="text-sm text-gray-600">{address.full_address}</p>
                      {address.note && (
                        <p className="text-xs text-gray-500 mt-1">{address.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BengkelDetailPage;