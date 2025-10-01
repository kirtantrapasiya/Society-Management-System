import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

const SecretaryDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const { role } = useAuth();

  const getRoomStatus = (room) => {
    if (!room.owner) {
      return {
        status: "Unactive",
        displayType: "empty",
        statusColor: "text-gray-500",
        bgColor: "bg-gray-50"
      };
    }

    if (room.self === true) {
      return {
        status: "Active",
        displayType: "owner",
        statusColor: "text-green-600",
        bgColor: "bg-green-50"
      };
    }

    if (room.rent && room.renterName) {
      return {
        status: "Active",
        displayType: "rented",
        statusColor: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    }

    if (room.owner && !room.self && !room.rent) {
      return {
        status: "Unactive",
        displayType: "owner_not_living",
        statusColor: "text-orange-500",
        bgColor: "bg-orange-50"
      };
    }

    return {
      status: "Unactive",
      displayType: "empty",
      statusColor: "text-gray-500",
      bgColor: "bg-gray-50"
    };
  };

  // Fetch rooms from Firestore
  const fetchRooms = async () => {
    try {
      const roomsSnap = await getDocs(collection(db, "rooms"));
      const roomsData = roomsSnap.docs.map(doc => {
        const data = doc.data();
        const statusInfo = getRoomStatus(data);
        return {
          id: doc.id,
          ...data,
          ...statusInfo
        };
      });

      // Sort rooms by room number
      roomsData.sort((a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber));
      setRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const updateRoom = async (roomId, updates) => {
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      fetchRooms(); 
      setEditingRoom(null);
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const renderRoomCard = (room) => {
    return (
      <div key={room.id} className={`p-4 rounded-lg border-2 ${room.bgColor} border-gray-200`}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800">Room {room.roomNumber}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${room.statusColor} bg-white`}>
            {room.status}
          </span>
        </div>

        {/* Empty Room */}
        {room.displayType === "empty" && (
          <div className="text-gray-600">
            <p className="text-sm">Available for registration</p>
            <p className="text-xs text-gray-500 mt-1">Floor: {room.floor || 'N/A'}</p>
          </div>
        )}

        {/* Owner Living */}
        {room.displayType === "owner" && (
          <div className="space-y-2">
            <div className="text-sm">
              <p className="font-medium text-gray-800">{room.ownerName}</p>
              <p className="text-gray-600">{room.ownerEmail}</p>
              <p className="text-gray-600">{room.ownerContact}</p>
            </div>
            
            {/* Family Members */}
            {room.familyMembers && room.familyMembers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Family Members ({room.familyMembers.length}):
                </p>
                <div className="space-y-1">
                  {room.familyMembers.map((member, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-gray-500"> ({member.relationship})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rented Room */}
        {room.displayType === "rented" && (
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-gray-800">Owner: {room.ownerName}</p>
              <p className="text-gray-600">{room.ownerContact}</p>
            </div>
            
            <div className="pt-2 border-t border-blue-200">
              <p className="text-sm font-medium text-blue-800">Renter: {room.renterName}</p>
              <p className="text-sm text-gray-600">{room.renterContact}</p>
              <p className="text-xs text-gray-500">Rent: ₹{room.rent}/month</p>
            </div>
          </div>
        )}

        {/* Owner Not Living */}
        {room.displayType === "owner_not_living" && (
          <div className="text-sm">
            <p className="font-medium text-gray-800">Owner: {room.ownerName}</p>
            <p className="text-gray-600">{room.ownerEmail}</p>
            <p className="text-gray-600">{room.ownerContact}</p>
            <p className="text-xs text-orange-600 mt-2">Owner not currently living here</p>
          </div>
        )}

        {(role === "secretary" || role === "admin") && (
          <button
            onClick={() => setEditingRoom(room)}
            className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
          >
            Edit Room
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Building Rooms</h1>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-200"></div>
            Active ({rooms.filter(r => r.status === "Active").length})
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            Unactive ({rooms.filter(r => r.status === "Unactive").length})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map(renderRoomCard)}
      </div>

      {editingRoom && (role === "secretary" || role === "admin") && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onUpdate={updateRoom}
        />
      )}
    </div>
  );
};

const EditRoomModal = ({ room, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    ownerName: room.ownerName || "",
    ownerEmail: room.ownerEmail || "",
    ownerContact: room.ownerContact || "",
    self: room.self || false,
    renterName: room.renterName || "",
    renterContact: room.renterContact || "",
    rent: room.rent || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updates = {
      ...formData,
      renterName: formData.self ? null : formData.renterName,
      renterContact: formData.self ? null : formData.renterContact,
      rent: formData.self ? null : formData.rent,
    };

    Object.keys(updates).forEach(key => {
      if (updates[key] === "" || updates[key] === null) {
        delete updates[key];
      }
    });

    onUpdate(room.id, updates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Room {room.roomNumber}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Owner Name</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData(prev => ({...prev, ownerName: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Owner Email</label>
            <input
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => setFormData(prev => ({...prev, ownerEmail: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Owner Contact</label>
            <input
              type="text"
              value={formData.ownerContact}
              onChange={(e) => setFormData(prev => ({...prev, ownerContact: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.self}
              onChange={(e) => setFormData(prev => ({...prev, self: e.target.checked}))}
              className="mr-2"
            />
            <label className="text-sm">Owner lives in this room</label>
          </div>

          {!formData.self && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Renter Name</label>
                <input
                  type="text"
                  value={formData.renterName}
                  onChange={(e) => setFormData(prev => ({...prev, renterName: e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Renter Contact</label>
                <input
                  type="text"
                  value={formData.renterContact}
                  onChange={(e) => setFormData(prev => ({...prev, renterContact: e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monthly Rent</label>
                <input
                  type="number"
                  value={formData.rent}
                  onChange={(e) => setFormData(prev => ({...prev, rent: e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Update Room
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecretaryDashboard;