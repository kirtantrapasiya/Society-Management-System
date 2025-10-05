import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Users, Home, Plus, Phone, Mail, Loader2, AlertCircle, Trash2, XCircle, CheckCircle} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import AddRenterModal from '../Oprations/AddRenterModal';
import OwnerCredentialsModal from '../Oprations/OwnerCredentialsModal';

const ResidentDashboard = () => {
  const { user, userDoc, loading: authLoading, refreshUserData } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddRenter, setShowAddRenter] = useState(false);

  const role = useMemo(() => userDoc?.role || "owner", [userDoc?.role]);

  const SkeletonCard = ({ width = "full", height = 20, className = "" }) => (
    <div
      className={`bg-gray-300 animate-pulse rounded-md ${className}`}
      style={{ width, height: `${height}px` }}
    />
  );

  const PersonCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start mb-4">
        <div className="flex items-center">
          <SkeletonCard width="48px" height={48} className="rounded-full" />
          <div className="ml-3 space-y-2">
            <SkeletonCard width="150px" height={20} />
            <SkeletonCard width="100px" height={16} />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center">
          <SkeletonCard width="16px" height={16} className="mr-3" />
          <SkeletonCard width="200px" height={14} />
        </div>
        <div className="flex items-center">
          <SkeletonCard width="16px" height={16} className="mr-3" />
          <SkeletonCard width="150px" height={14} />
        </div>
        <div className="flex items-center">
          <SkeletonCard width="16px" height={16} className="mr-3" />
          <SkeletonCard width="120px" height={14} />
        </div>
      </div>
    </div>
  );

  const FamilySectionSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <SkeletonCard width="24px" height={24} className="mr-2" />
        <SkeletonCard width="150px" height={24} />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <SkeletonCard width="32px" height={32} className="rounded-full mr-2" />
              <div className="space-y-1">
                <SkeletonCard width="100px" height={16} />
                <SkeletonCard width="80px" height={12} />
              </div>
            </div>
            <div className="space-y-1">
              <SkeletonCard width="120px" height={10} />
              <SkeletonCard width="100px" height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RenterSectionSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <SkeletonCard width="24px" height={24} className="mr-2" />
        <SkeletonCard width="180px" height={24} />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <SkeletonCard width="48px" height={48} className="rounded-full mr-3" />
            <div className="space-y-2">
              <SkeletonCard width="150px" height={20} />
              <SkeletonCard width="100px" height={16} />
            </div>
          </div>
          <SkeletonCard width="40px" height={40} className="rounded-lg" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <SkeletonCard width="16px" height={16} className="mr-3" />
            <SkeletonCard width="200px" height={14} />
          </div>
          <div className="flex items-center">
            <SkeletonCard width="16px" height={16} className="mr-3" />
            <SkeletonCard width="150px" height={14} />
          </div>
          <div className="flex items-center">
            <SkeletonCard width="16px" height={16} className="mr-3" />
            <SkeletonCard width="120px" height={14} />
          </div>
        </div>
      </div>
    </div>
  );

  const RoleBasedSkeleton = () => {
    switch(role) {
      case "owner":
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                <PersonCardSkeleton />
                <FamilySectionSkeleton title="Family Members" />
                <RenterSectionSkeleton />
              </div>
            </div>
          </div>
        );
      
      case "owner_family":
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                <PersonCardSkeleton />
                <FamilySectionSkeleton title="Family Members" />
              </div>
            </div>
          </div>
        );
      
      case "renter":
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                <PersonCardSkeleton />
                <FamilySectionSkeleton title="Renter Family" />
                <PersonCardSkeleton />
              </div>
            </div>
          </div>
        );
      
      case "renter_family":
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                <PersonCardSkeleton />
                <FamilySectionSkeleton title="Family Members" />
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                <PersonCardSkeleton />
                <FamilySectionSkeleton />
                <RenterSectionSkeleton />
              </div>
            </div>
          </div>
        );
    }
  };

  const fetchRoomData = useCallback(async (roomNumber) => {
    try {
      if (!roomNumber) return null;
      const roomRef = doc(db, 'rooms', roomNumber);
      const roomSnap = await getDoc(roomRef);
      return roomSnap.exists() ? roomSnap.data() : null;
    } catch (error) {
      console.error('Error fetching room data:', error);
      return null;
    }
  }, []);

  const fetchUserProfile = useCallback(async (uid) => {
    try {
      if (!uid) return null;
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user || !userDoc || authLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const roomData = await fetchRoomData(userDoc.roomNumber);
      if (!roomData) throw new Error('Room not found');

      let fetchedData = {
        room: roomData,
        family: roomData.familyMembers || [],
        renterFamily: roomData.renterFamilyMembers || []
      };

      switch(role) {
        case "owner":
          fetchedData.owner = userDoc;
          if (roomData.renterUid) {
            const renterProfile = await fetchUserProfile(roomData.renterUid);
            fetchedData.renter = renterProfile ? {
              ...renterProfile,
              renterName: roomData.renterName,
              renterContact: roomData.renterContact
            } : null;
          }
          break;
        
        case "owner_family":
          fetchedData.currentUser = userDoc;
          if (userDoc.ownerUid) {
            fetchedData.owner = await fetchUserProfile(userDoc.ownerUid);
          }
          break;
        
        case "renter":
          fetchedData.renter = userDoc;
          if (userDoc.ownerUid) {
            fetchedData.owner = await fetchUserProfile(userDoc.ownerUid);
          }
          break;
        
        case "renter_family":
          fetchedData.currentUser = userDoc;
          if (userDoc.renterUid) {
            fetchedData.renter = await fetchUserProfile(userDoc.renterUid);
          }
          break;
        
        default:
          fetchedData.owner = userDoc;
      }

      setData(fetchedData);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, userDoc, authLoading, role, fetchRoomData, fetchUserProfile]);

  useEffect(() => {
    if (!authLoading && userDoc) {
      fetchData();
    }
  }, [fetchData]);

  const PersonCard = React.memo(({ person, title, additionalInfo = {} }) => {
    if (!person) {
      return <PersonCardSkeleton />;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-start mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {(person.fullName || person.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {person.fullName || person.name || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-600">{title}</p>
              {person.relationship && (
                <p className="text-sm text-blue-600">{person.relationship}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Mail size={16} className="mr-3 text-gray-400" />
            <span>{person.email || 'No email available'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone size={16} className="mr-3 text-gray-400" />
            <span>{person.contactNo || person.phone || person.contact || 'No phone available'}</span>
          </div>
          
          {additionalInfo.roomNumber && (
            <div className="flex items-center text-sm text-gray-600">
              <Home size={16} className="mr-3 text-gray-400" />
              <span>Room {additionalInfo.roomNumber}</span>
            </div>
          )}
        </div>
      </div>
    );
  });

  const FamilySection = React.memo(({ person, title, relationship, members, uid }) => {
    const filteredMembers = useMemo(() => 
      (members || []).filter((member) => member && member.uid !== uid), 
      [members, uid]
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="mr-2 text-blue-600" />
          {title}
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {person && filteredMembers.length !== members?.length && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {(person.fullName || person.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="ml-2">
                  <h4 className="font-medium">{person.fullName || person.name || 'Unknown User'}</h4>
                  {relationship && (
                    <p className="text-sm text-blue-600">{relationship}</p>
                  )}
                </div>
              </div>
              {person?.email && (
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Mail size={10} className="mr-1" />
                    {person.email}
                  </div>
                </div>
              )}
            </div>
          )}

          {filteredMembers.map((member, index) => (
            member ? (
              <div key={member.uid || member.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {(member.name || member.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-2">
                    <h4 className="font-medium">{member.name || member.fullName}</h4>
                    {member.relationship && (
                      <p className="text-sm text-blue-600">{member.relationship}</p>
                    )}
                  </div>
                </div>
                {member.email && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Mail size={10} className="mr-1" />
                      {member.email}
                    </div>
                  </div>
                )}
              </div>
            ) : null
          ))}

          {filteredMembers.length === 0 && !person && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No family members found
            </div>
          )}
        </div>
      </div>
    );
  });

const RenterSection = React.memo(({ renter, room, onUpdate }) => {
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');

  const handleDeleteRenter = useCallback(() => {
    setShowModal(true);
    setError('');
    setSuccess('');
    setWarning('');
  }, []);

  const handleAdminCredentialsSubmit = async (adminEmail, adminPassword, renterPassword) => {
    setDeleting(true);
    setError('');
    setSuccess('');
    setWarning('');
    
    try {
      const renterUid = renter.uid || renter.id;
      const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      // Call backend API to delete renter
      const response = await fetch(`${BACKEND_URL}/api/renters/${renterUid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminEmail: adminEmail.trim(),
          adminPassword: adminPassword,
          renterPassword: renterPassword || ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.includes('Owner email or password is wrong')) {
          throw new Error('Owner email or password is wrong, please fill correct');
        } else if (data.error && data.error.includes('Renter password is wrong')) {
          throw new Error('Renter password is wrong, please fill correct');
        } else if (data.hasFamilyMembers) {
          throw new Error(data.error || 'Cannot delete renter with family members. Please contact secretary.');
        } else if (data.error && data.error.includes('Only owners can delete')) {
          throw new Error('Only owners can delete renters');
        } else {
          throw new Error(data.error || 'Failed to delete renter');
        }
      }

      setSuccess(data.message || 'Renter deleted successfully');
      
      if (data.warning) {
        setWarning(data.warning);
      }

      setTimeout(() => {
        setShowModal(false);
        setDeleting(false);
        
        if (onUpdate) {
          onUpdate();
        }
      }, 2500);

    } catch (error) {
      console.error('Deletion error:', error);
      setError(error.message || 'Failed to delete renter');
      setDeleting(false);
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <User className="mr-2 text-blue-600" />
        Renter Information
      </h2>
      
      {renter ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {(renter.fullName || renter.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {renter.fullName || renter.name || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-600">Current Renter</p>
              </div>
            </div>
            
            <div>
              <button 
                onClick={handleDeleteRenter}
                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Renter"
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 size={18} className="animate-spin text-red-500" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Mail size={16} className="mr-3 text-gray-400" />
              <span>{renter.email || 'No email available'}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={16} className="mr-3 text-gray-400" />
              <span>{renter.contactNo || renter.phone || renter.contact || 'No phone available'}</span>
            </div>
            
            {room?.roomNumber && (
              <div className="flex items-center text-sm text-gray-600">
                <Home size={16} className="mr-3 text-gray-400" />
                <span>Room {room.roomNumber}</span>
              </div>
            )}
          </div>

          {deleting && !success && (
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-center">
                <Loader2 size={16} className="animate-spin text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-700">Deleting renter... Please wait.</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <div className="flex items-center">
                <CheckCircle size={16} className="text-green-600 mr-2" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            </div>
          )}

          {warning && (
            <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
              <div className="flex items-center">
                <AlertCircle size={16} className="text-orange-600 mr-2" />
                <span className="text-sm text-orange-700">{warning}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
              <div className="flex items-center">
                <XCircle size={16} className="text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No renter assigned to this property</p>
          <button 
            onClick={() => setShowAddRenter(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center mx-auto hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Renter
          </button>
        </div>
      )}

      {/* Owner credentials modal */}
      <OwnerCredentialsModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setError('');
          setSuccess('');
          setWarning('');
        }}
        onSubmit={handleAdminCredentialsSubmit}
        renterName={renter?.fullName || renter?.name}
        renterEmail={renter?.email}
      />
    </div>
  );
});

  const ErrorDisplay = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const renderDashboard = useMemo(() => {
    if (!data) return null;
    
    switch(role) {
      case "owner":
        return (
          <div className="space-y-6">
            <PersonCard 
              person={data.owner} 
              title="Property Owner" 
              additionalInfo={{ roomNumber: data.room?.roomNumber }}
            />
            <FamilySection title="Family" members={data.family} />
            <RenterSection renter={data.renter} room={data.room} onUpdate={fetchData}/>
          </div>
        );
      
      case "owner_family":
        return (
          <div className="space-y-6">
            <PersonCard 
              person={data.currentUser} 
              title="My Info" 
              additionalInfo={{ roomNumber: data.room?.roomNumber }}
            />
            <FamilySection 
              person={data.owner}
              relationship="owner"
              title="Family Members" 
              members={data.family} 
              uid={data.currentUser?.uid}
            />
          </div>
        );
      
      case "renter":
        return (
          <div className="space-y-6">
            <PersonCard 
              person={data.renter} 
              title="Renter" 
              additionalInfo={{ roomNumber: data.room?.roomNumber }}
            />
            <FamilySection title="Renter Family" members={data.renterFamily} />
            {data.owner && (
              <PersonCard 
                person={data.owner} 
                title="Property Owner"
                additionalInfo={{ roomNumber: data.room?.roomNumber }}
              />
            )}
          </div>
        );
      
      case "renter_family":
        return (
          <div className="space-y-6">
            <PersonCard 
              person={data.currentUser} 
              title="My Info" 
              additionalInfo={{ roomNumber: data.room?.roomNumber }}
            />
            <FamilySection 
              person={data.renter}
              relationship="renter"
              title="Family Members" 
              members={data.renterFamily} 
              uid={data.currentUser?.uid}
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <PersonCard 
              person={data.owner} 
              title="Property Owner" 
              additionalInfo={{ roomNumber: data.room?.roomNumber }}
            />
            <FamilySection title="Family" members={data.family} />
            <RenterSection renter={data.renter} room={data.room} onUpdate={fetchData}/>
          </div>
        );
    }
  }, [data, role, fetchData]);

  if (authLoading || loading) return <RoleBasedSkeleton />;
  if (error) return <ErrorDisplay />;
  if (!user || !userDoc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard}
      </div>

      {showAddRenter && data?.room?.roomNumber && (
        <AddRenterModal 
          ownerRoomNumber={data.room?.roomNumber}
          onClose={() => setShowAddRenter(false)} 
          onSuccess={() => {
            setShowAddRenter(false);
            fetchData();
          }}
          ownerUid={data.owner?.uid}
        />
      )}
    </div>
  );
};

export default ResidentDashboard;