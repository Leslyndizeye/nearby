import { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X, User, Clock, Phone, Heart, Settings, LogOut } from 'lucide-react';

// Mock data for pharmacies
const pharmaciesData = [
  {
    id: 1,
    name: "MedExpress Pharmacy",
    address: "123 Health Street",
    distance: "0.5 miles",
    rating: 4.8,
    openUntil: "9:00 PM",
    phone: "(555) 123-4567"
  },
  {
    id: 2,
    name: "Wellness Drugs",
    address: "456 Care Avenue",
    distance: "1.2 miles",
    rating: 4.5,
    openUntil: "10:00 PM",
    phone: "(555) 987-6543"
  },
  {
    id: 3,
    name: "City Health Pharmacy",
    address: "789 Medical Boulevard",
    distance: "1.8 miles",
    rating: 4.7,
    openUntil: "8:00 PM",
    phone: "(555) 456-7890"
  },
  {
    id: 4,
    name: "QuickScript Pharmacy",
    address: "101 Remedy Road",
    distance: "2.3 miles",
    rating: 4.3,
    openUntil: "11:00 PM",
    phone: "(555) 234-5678"
  }
];

// Mock data for user favorites
const initialFavorites = [1, 3];

export default function PharmacyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pharmacies, setPharmacies] = useState(pharmaciesData);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [activeTab, setActiveTab] = useState('all');

  // Filter pharmacies based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setPharmacies(pharmaciesData);
    } else {
      const filteredPharmacies = pharmaciesData.filter(pharmacy => 
        pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPharmacies(filteredPharmacies);
    }
  }, [searchTerm]);

  // Filter pharmacies based on active tab
  useEffect(() => {
    if (activeTab === 'all') {
      setPharmacies(pharmaciesData);
    } else if (activeTab === 'favorites') {
      const favPharmacies = pharmaciesData.filter(pharmacy => favorites.includes(pharmacy.id));
      setPharmacies(favPharmacies);
    }
  }, [activeTab, favorites]);

  // Toggle favorite status
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const selectPharmacy = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  // Star rating component
  const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-sm ${
            i < fullStars 
              ? 'text-yellow-500' 
              : (i === fullStars && hasHalfStar) 
                ? 'text-yellow-500' 
                : 'text-gray-300'
          }`}>
            ★
          </span>
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b">
          {sidebarOpen && <h2 className="font-bold text-lg text-blue-600">PharmaScan</h2>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <div className="flex-1 py-4">
          <div className="px-4 mb-8">
            <div className={`flex items-center p-3 rounded-lg bg-blue-50 text-blue-700 ${sidebarOpen ? '' : 'justify-center'}`}>
              <User size={20} />
              {sidebarOpen && <span className="ml-3 font-medium">Profile</span>}
            </div>
          </div>
          
          <div className="px-4 mb-8">
            <div className={`flex items-center mb-2 ${sidebarOpen ? '' : 'justify-center'}`}>
              {sidebarOpen && <h3 className="uppercase text-xs font-semibold text-gray-500">Discover</h3>}
            </div>
            <ul>
              <li>
                <button 
                  className={`flex items-center w-full p-3 rounded-lg ${activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${sidebarOpen ? '' : 'justify-center'}`}
                  onClick={() => setActiveTab('all')}
                >
                  <MapPin size={20} />
                  {sidebarOpen && <span className="ml-3">All Pharmacies</span>}
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-3 rounded-lg ${activeTab === 'favorites' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${sidebarOpen ? '' : 'justify-center'}`}
                  onClick={() => setActiveTab('favorites')}
                >
                  <Heart size={20} />
                  {sidebarOpen && <span className="ml-3">Favorites</span>}
                </button>
              </li>
            </ul>
          </div>
          
          {sidebarOpen && (
            <div className="px-4">
              <div className="flex items-center mb-2">
                <h3 className="uppercase text-xs font-semibold text-gray-500">Account</h3>
              </div>
              <ul>
                <li>
                  <button className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                    <Settings size={20} />
                    <span className="ml-3">Settings</span>
                  </button>
                </li>
                <li>
                  <button className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                    <LogOut size={20} />
                    <span className="ml-3">Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for pharmacies by name or address..."
                className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center ml-4">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                JD
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Pharmacy List */}
          <div className="w-1/3 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {activeTab === 'all' ? 'Nearby Pharmacies' : 'Favorite Pharmacies'}
              </h2>
              <span className="text-sm text-gray-500">{pharmacies.length} found</span>
            </div>
            
            {pharmacies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-gray-400 mb-2">
                  <Search size={48} />
                </div>
                <h3 className="text-lg font-medium text-gray-700">No pharmacies found</h3>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pharmacies.map((pharmacy) => (
                  <div 
                    key={pharmacy.id} 
                    className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${selectedPharmacy?.id === pharmacy.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => selectPharmacy(pharmacy)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{pharmacy.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
                        <StarRating rating={pharmacy.rating} />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(pharmacy.id);
                        }}
                        className={`p-1 rounded-full ${favorites.includes(pharmacy.id) ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        <Heart size={18} fill={favorites.includes(pharmacy.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="flex items-center mt-3 text-xs text-gray-500">
                      <MapPin size={14} className="mr-1" />
                      <span>{pharmacy.distance}</span>
                      <span className="mx-2">•</span>
                      <Clock size={14} className="mr-1" />
                      <span>Open until {pharmacy.openUntil}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Map Area */}
          <div className="w-2/3 bg-gray-200 relative">
            {/* Google Map would be integrated here in a production environment */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="mb-4 text-gray-500">
                <MapPin size={48} />
              </div>
              <h3 className="text-lg font-medium text-gray-700">Google Maps Integration</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                In a production environment, this area would display an interactive Google Map showing pharmacy locations
              </p>
              
              {selectedPharmacy && (
                <div className="mt-8 bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
                  <h4 className="font-medium text-lg">{selectedPharmacy.name}</h4>
                  <p className="text-gray-600 mt-1">{selectedPharmacy.address}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Phone className="mr-2 text-blue-600" size={16} />
                      <span className="text-sm">{selectedPharmacy.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 text-blue-600" size={16} />
                      <span className="text-sm">Open until {selectedPharmacy.openUntil}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 text-blue-600" size={16} />
                      <span className="text-sm">{selectedPharmacy.distance} away</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 text-blue-600">★</div>
                      <span className="text-sm">{selectedPharmacy.rating} rating</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Get Directions
                    </button>
                    <button 
                      className={`flex items-center justify-center w-10 h-10 rounded-md border ${favorites.includes(selectedPharmacy.id) ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 text-gray-400 hover:bg-gray-50'}`}
                      onClick={() => toggleFavorite(selectedPharmacy.id)}
                    >
                      <Heart size={20} fill={favorites.includes(selectedPharmacy.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}