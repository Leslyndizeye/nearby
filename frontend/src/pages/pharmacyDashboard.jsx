import { useState, useEffect } from 'react';
import { Search, PlusCircle, MapPin, Phone, Mail, Clipboard, X, Edit, LogOut, Trash2, Eye } from 'lucide-react';
import api from '../api/axios';

// Main App Component
export default function PharmacyPortal() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  
  
  // redirect user to login page if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(localStorage.getItem('user-data')) || localStorage.getItem('user-data'));

  }, []);



  // get user's medicine
  useEffect(() => {
    setLoading(true);
    api.get('/medicine')
      .then((response) => {
        setMedicines(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  // get pharmacy data from local storage
  const pharmacy = JSON.parse(localStorage.getItem('pharmacyData'));

  
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showEditMedicine, setShowEditMedicine] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('grid'); // 'grid' or 'list'
  const [viewMedicine, setViewMedicine] = useState(null);


  // handleLogout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user-data');
    window.location.href = '/';
  }
  
  // Filter medicines based on search term
  const filteredMedicines = medicines.filter(med => 
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    med.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Add new medicine
  const handleAddMedicine = async (medicine) => {
    setShowAddMedicine(false);

    setLoading(true);
    try {
      await api.post("/medicine", medicine)
        .then((response) => {
          setMedicines([...medicines, response.data.data]);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  
    
  };
  
  // Edit medicine
  const handleEditMedicine = async (medicine) => {
    setShowEditMedicine(false);
    setCurrentMedicine(null);

    setLoading(true);
    try {
      await api.put(`/medicine/${medicine._id}`, medicine)
        .then((response) => {
          setMedicines((prevMeds) =>
            prevMeds.map((med) =>
              med._id === response.data.data._id ? response.data.data : med
            )
          );
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    
  };
  
  // Delete medicine
  const handleDeleteMedicine = async (id) => {
    setLoading(true);
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/medicine/${id}`)
          .then((response) => {
            setMedicines((prevMeds) => prevMeds.filter((med) => med._id !== id));
          })
          .catch((error) => {
            console.error(error);
          });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Update pharmacy info
  const handleUpdateProfile = (info) => {

    const submitData = {
        name: info.name,
        address: info.address,
        location: {
            type: "Point",  
            coordinates: [
                parseFloat(info.longitude),  // make sure they're numbers
                parseFloat(info.latitude)
            ]
        },
        contact: info.phone 
    };


    try {
      api.post("/pharmacy/profile", submitData)
        .then((response) => {
          console.log(response.data);
          localStorage.setItem('pharmacyData', JSON.stringify(response.data.pharmacy));  // Storing pharmacy data in localStorage
          window.location.reload();
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white text-blue-600 p-2 rounded-full mr-3">
              <PlusCircle size={24} />
            </div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowEditProfile(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Edit size={16} className="mr-1" />
              Edit Profile
            </button>

            <button
              onClick={() => handleLogout(true)}
              className="bg-blue-800 hover:bg-gray-800 text-white p-3 ml-4 rounded-full transition-colors flex items-center justify-center cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Pharmacy Info */}
      <div className="bg-white shadow-md p-4 mb-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center mb-2 md:mb-0">
              <MapPin className="text-blue-600 mr-2" size={18} />
              <span>{pharmacy.address}</span>
            </div>
            <div className="flex items-center mb-2 md:mb-0">
              <Phone className="text-blue-600 mr-2" size={18} />
              <span>{pharmacy.contact}</span>
            </div>
            <div className="flex items-center">
              <Mail className="text-blue-600 mr-2" size={18} />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto flex-grow px-4 pb-8">
        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveView('grid')}
              className={`p-2 rounded-lg ${activeView === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
            >
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
              </div>
            </button>
            <button 
              onClick={() => setActiveView('list')}
              className={`p-2 rounded-lg ${activeView === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
            >
              <div className="flex flex-col space-y-1">
                <div className="w-6 h-1 bg-current rounded-sm"></div>
                <div className="w-6 h-1 bg-current rounded-sm"></div>
                <div className="w-6 h-1 bg-current rounded-sm"></div>
              </div>
            </button>
            <button 
              onClick={() => setShowAddMedicine(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <PlusCircle size={18} className="mr-1" />
              Add Medicine
            </button>
          </div>
        </div>
        
        {/* Medicines Display */}
        {loading ? (
            <div className="text-center py-12">
              <div className="loader border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-700">Loading medicines...</h3>
            </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 inline-block p-4 rounded-full mb-4">
              <Clipboard size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No medicines found</h3>
            <p className="text-gray-500">
              {medicines.length === 0 
                ? "Start by adding your first medicine." 
                : "Try adjusting your search term."}
            </p>
            {medicines.length === 0 && (
              <button 
                onClick={() => setShowAddMedicine(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Medicine
              </button>
            )}
          </div>
        ) : activeView === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((medicine) => (
              <div key={medicine.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 h-32 flex items-center justify-center">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <PlusCircle size={40} className="text-blue-600" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{medicine.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{medicine.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-blue-600 font-medium">${medicine.price}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewMedicine(medicine)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentMedicine(medicine);
                          setShowEditMedicine(true);
                        }}
                        className="p-1 text-gray-500 hover:text-green-600"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine._id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <PlusCircle size={20} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{medicine.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${medicine.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(medicine.dateAdded).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setViewMedicine(medicine)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentMedicine(medicine);
                            setShowEditMedicine(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      
      {/* Add Medicine Modal */}
      {showAddMedicine && (
        <MedicineForm 
          onSubmit={handleAddMedicine} 
          onCancel={() => setShowAddMedicine(false)}
          title="Add New Medicine"
        />
      )}
      
      {/* Edit Medicine Modal */}
      {showEditMedicine && (
        <MedicineForm 
          medicine={currentMedicine}
          onSubmit={handleEditMedicine} 
          onCancel={() => {
            setShowEditMedicine(false);
            setCurrentMedicine(null);
          }}
          title="Edit Medicine"
        />
      )}
      
      {/* View Medicine Modal */}
      {viewMedicine && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-90 overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Medicine Details</h2>
              <button
                onClick={() => setViewMedicine(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex justify-center">
                <div className="bg-blue-100 p-6 rounded-full">
                  <PlusCircle size={64} className="text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-center mb-4">{viewMedicine.name}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Price</span>
                  <div className="font-semibold">${viewMedicine.price}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Stock</span>
                  <div className="font-semibold">{viewMedicine.stock} units</div>
                </div>
              </div>
              
              <div className="mb-6">
                <span className="text-sm text-gray-500 block mb-1">Description</span>
                <p className="text-gray-700">{viewMedicine.description}</p>
              </div>
              
              <div className="mb-6">
                <span className="text-sm text-gray-500 block mb-1">Usage Instructions</span>
                <p className="text-gray-700">{viewMedicine.usage || "No usage instructions provided."}</p>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-500 block mb-1">Added on</span>
                <p className="text-gray-700">
                  {new Date(viewMedicine.dateAdded).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setViewMedicine(null);
                    setCurrentMedicine(viewMedicine);
                    setShowEditMedicine(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Edit Pharmacy Profile</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                handleUpdateProfile(data);
              }}
              className="p-6"
            >
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Pharmacy Name
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={user.name}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Address
                </label>
                <input
                  name="address"
                  type="text"
                  defaultValue={pharmacy.address}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Phone
                </label>
                <input
                  name="phone"
                  type="text"
                  defaultValue={pharmacy.contact}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Latitude
                </label>
                <input
                  name="latitude"
                  type="text"
                  defaultValue={pharmacy.location.coordinates[1]} // Index 1 for latitude
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Longitude
                </label>
                <input
                  name="longitude"
                  type="text"
                  defaultValue={pharmacy.location.coordinates[0]} // Index 0 for longitude
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Medicine Form Component
function MedicineForm({ medicine, onSubmit, onCancel, title }) {
  const isEditing = !!medicine;
  
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Convert price to number
            data.price = parseFloat(data.price);
            data.stock = parseInt(data.stock, 10);
            
            if (isEditing) {
              onSubmit({ ...medicine, ...data });
            } else {
              onSubmit(data);
            }
          }}
          className="p-6"
        >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Medicine Name
            </label>
            <input
              name="name"
              type="text"
              defaultValue={medicine?.name || ''}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Price ($)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={medicine?.price || ''}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={medicine?.stock || ''}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={medicine?.description || ''}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              required
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Usage Instructions
            </label>
            <textarea
              name="instructions"
              defaultValue={medicine?.instructions || ''}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}