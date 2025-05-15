import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Menu, X, User, Pill, Heart, Settings, LogOut, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function PharmacyFinder() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [distanceFilter, setDistanceFilter] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(50);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState(null);

const navigate = useNavigate();

// redirect user to login page if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(localStorage.getItem('user-data')) || localStorage.getItem('user-data'));

  }, []);


const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user-data');
  navigate('/');
};

  
  // Refs for search optimization
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Distance options for dropdown
  const distanceOptions = [1, 2, 5, 10, 20, 50];

  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default location if geolocation fails
          setUserLocation({ lat: 51.5074, lng: -0.1278 }); // London
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York
    }
  }, []);

  // Load Google Maps API - Use your own API key
  useEffect(() => {
    if (!window.google && userLocation) {
      const script = document.createElement("script");
      // Replace with your own API key (with proper restrictions)
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBwHmGMsxU6BM4JUA4d75Fj0PfOFo3NTNU&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, [userLocation]);

  // Initialize map and search for pharmacies
  useEffect(() => {
    if (mapLoaded && userLocation && !map) {
      try {
        const mapElement = document.getElementById("map");
        if (!mapElement) {
          console.error("Map element not found");
          return;
        }
        
        const mapInstance = new window.google.maps.Map(mapElement, {
          center: userLocation,
          zoom: 14,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Add user marker
        const userMarker = new window.google.maps.Marker({
          position: userLocation,
          map: mapInstance,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
          },
          title: "Your Location"
        });

        setMap(mapInstance);
        
        // Search for nearby pharmacies
        searchPharmacies(userLocation, mapInstance, selectedDistance * 1000);
      } catch (error) {
        console.error("Error initializing map:", error);
        setLoading(false);
      }
    }
  }, [mapLoaded, userLocation]);

  // Function to search pharmacies with given radius
  const searchPharmacies = (location, mapInstance, radius = 50000) => {
    setLoading(true);
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    
    const service = new window.google.maps.places.PlacesService(mapInstance);
    const request = {
      location: location,
      radius: radius,
      type: 'pharmacy',
      keyword: 'pharmacy drugstore'
    };
    
    service.nearbySearch(request, (results, status) => {
      console.log("API Call Status:", status);
      console.log("Raw Results:", results);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        if (!results || results.length === 0) {
          console.warn("API returned OK status but no results");
          setPharmacies([]);
          setFilteredPharmacies([]);
        } else {
          // Process results and get detailed place information including photos
          const processedPharmacies = [];
          const newMarkers = [];
          
          results.forEach((place, index) => {
            // Create a basic pharmacy object
            const distanceInKm = calculateDistance(
              location.lat, location.lng,
              place.geometry?.location?.lat() || location.lat,
              place.geometry?.location?.lng() || location.lng
            );
            
            const pharmacy = {
              id: place.place_id,
              name: place.name || "Pharmacy",
              address: place.vicinity || "Address not available",
              location: place.geometry?.location?.toJSON() || location,
              rating: place.rating || 0,
              distanceValue: distanceInKm, // Store raw distance value for filtering
              distance: distanceInKm.toFixed(1) + " km",
              photos: place.photos ? place.photos.map(photo => photo.getUrl({ maxWidth: 400, maxHeight: 400 })) : []
            };
            
            processedPharmacies.push(pharmacy);
            
            // Create marker
            const marker = new window.google.maps.Marker({
              position: pharmacy.location,
              map: mapInstance,
              title: pharmacy.name,
              pharmacyId: pharmacy.id,
              animation: window.google.maps.Animation.DROP
            });
            
            // Add click event to marker
            marker.addListener("click", () => {
              selectPharmacy(pharmacy);
            });
            
            newMarkers.push(marker);
          });
          
          setPharmacies(processedPharmacies);
          setFilteredPharmacies(processedPharmacies);
          setMarkers(newMarkers);
        }
      } else {
        console.error("Places API Error:", {
          status,
          message: getPlacesError(status),
          request
        });
      }
      setLoading(false);
    });
  };
  
  // Helper function for Places API errors
  function getPlacesError(status) {
    const errors = {
      "ZERO_RESULTS": "No pharmacies found in this area",
      "OVER_QUERY_LIMIT": "API quota exceeded",
      "REQUEST_DENIED": "API key invalid or missing required permissions",
      "INVALID_REQUEST": "Invalid request parameters",
      "UNKNOWN_ERROR": "Unknown server error"
    };
    return errors[status] || `Google Places API error: ${status}`;
  }

  // Effect to update search when distance dropdown changes
  useEffect(() => {
    if (map && userLocation) {
      searchPharmacies(userLocation, map, selectedDistance * 1000);
      // Clear the manual distance filter when search radius changes
      setDistanceFilter('');
    }
  }, [selectedDistance]);

  // Real-time search suggestion generation
  useEffect(() => {
    if (searchTerm.length > 0 && pharmacies.length > 0) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set a small delay to avoid excessive filtering on each keystroke
      searchTimeoutRef.current = setTimeout(() => {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Get pharmacy suggestions based on search term
        const newSuggestions = pharmacies
          .filter(pharmacy => 
            pharmacy.name.toLowerCase().includes(searchTermLower) ||
            pharmacy.address.toLowerCase().includes(searchTermLower)
          )
          .slice(0, 5); // Limit to top 5 suggestions
        
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
        
        // Also update filtered pharmacies in real-time
        updateFilteredPharmacies(searchTerm);
      }, 100); // 100ms delay for smooth typing experience
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      
      // If search is cleared, run the full filter again
      if (searchTerm === '') {
        updateFilteredPharmacies('');
      }
    }
    
    // Cleanup function to clear timeout
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, pharmacies]);

  // Function to update filtered pharmacies with all filters applied
  const updateFilteredPharmacies = (currentSearchTerm) => {
    if (pharmacies.length > 0) {
      // First filter by search term
      let filtered = currentSearchTerm ? 
        pharmacies.filter(pharmacy => 
          pharmacy.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
          pharmacy.address.toLowerCase().includes(currentSearchTerm.toLowerCase())
        ) : 
        [...pharmacies];
      
      // Then filter by distance if a manual filter is specified
      if (distanceFilter && distanceFilter !== '') {
        const maxDistance = parseFloat(distanceFilter);
        if (!isNaN(maxDistance)) {
          filtered = filtered.filter(pharmacy => 
            pharmacy.distanceValue <= maxDistance
          );
        }
      }
      
      // Finally filter by favorites if on favorites tab
      if (activeTab === 'favorites') {
        filtered = filtered.filter(pharmacy => favorites.includes(pharmacy.id));
      }
      
      // Update filtered pharmacies
      setFilteredPharmacies(filtered);
      
      // Update marker visibility
      markers.forEach(marker => {
        const isVisible = filtered.some(p => p.id === marker.pharmacyId);
        marker.setVisible(isVisible);
      });
    }
  };
  
  // Apply filters when activeTab, favorites, or distanceFilter changes
  useEffect(() => {
    updateFilteredPharmacies(searchTerm);
  }, [activeTab, favorites, distanceFilter, pharmacies]);

  // Handle selecting a suggestion
  const handleSuggestionClick = (pharmacy) => {
    setSearchTerm(pharmacy.name);
    setShowSuggestions(false);
    selectPharmacy(pharmacy);
  };

  // Click outside handler for suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    if (map && pharmacy.location) {
      map.panTo(pharmacy.location);
      map.setZoom(16);
    }
  };

  // Helper function to calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Handle distance input change with real-time filtering
  const handleDistanceFilterChange = (e) => {
    const value = e.target.value;
    setDistanceFilter(value);
    
    // Immediately update filtered pharmacies when distance changes
    if (pharmacies.length > 0) {
      const maxDistance = parseFloat(value);
      if (!isNaN(maxDistance) || value === '') {
        // Re-run the full filter operation
        // First filter by search term
        let filtered = searchTerm ? 
          pharmacies.filter(pharmacy => 
            pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
          ) : 
          [...pharmacies];
        
        // Then filter by distance if specified
        if (value !== '') {
          filtered = filtered.filter(pharmacy => 
            pharmacy.distanceValue <= maxDistance
          );
        }
        
        // Apply favorites filter if on favorites tab
        if (activeTab === 'favorites') {
          filtered = filtered.filter(pharmacy => favorites.includes(pharmacy.id));
        }
        
        // Update filtered pharmacies
        setFilteredPharmacies(filtered);
        
        // Update marker visibility
        markers.forEach(marker => {
          const isVisible = filtered.some(p => p.id === marker.pharmacyId);
          marker.setVisible(isVisible);
        });
      }
    }
  };

  // Handle distance dropdown change
  const handleDistanceDropdownChange = (e) => {
    setSelectedDistance(parseInt(e.target.value));
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

  // Highlight matching text in suggestions
  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <span key={index} className="font-bold text-blue-600">{part}</span> : part
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
                  {sidebarOpen && <span className="ml-3">Nearby Pharmacies</span>}
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-3 rounded-lg ${activeTab === 'medicines' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${sidebarOpen ? '' : 'justify-center'}`}
                  onClick={() => navigate('/medicines')}
                >
                  <Pill size={20} />
                  {sidebarOpen && <span className="ml-3">All Medecines</span>}
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
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100">
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
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="relative w-full max-w-xl mb-4 md:mb-0" ref={searchInputRef}>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for pharmacies by name or address..."
                className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              
              {/* Real-time search suggestions */}
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((pharmacy) => (
                    <div 
                      key={pharmacy.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSuggestionClick(pharmacy)}
                    >
                      <div className="font-medium">{highlightMatch(pharmacy.name, searchTerm)}</div>
                      <div className="text-sm text-gray-600">{highlightMatch(pharmacy.address, searchTerm)}</div>
                      <div className="text-xs text-gray-500 mt-1">{pharmacy.distance} • Rating: {pharmacy.rating.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex w-full md:w-auto space-x-4 items-center">
              {/* Distance filter input with real-time results */}
              <div className="relative w-32">
                <input
                  type="number"
                  placeholder="Max km"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={distanceFilter}
                  onChange={handleDistanceFilterChange}
                  min="0"
                  step="0.1"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">km</span>
              </div>
              
              {/* Distance dropdown */}
              <div className="relative w-40">
                <select
                  className="w-full appearance-none px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedDistance}
                  onChange={handleDistanceDropdownChange}
                >
                  {distanceOptions.map(option => (
                    <option key={option} value={option}>{option} km radius</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                JD
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Pharmacy List with Flip Cards */}
          <div className="w-1/3 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {activeTab === 'all' ? 'Nearby Pharmacies' : activeTab === 'favorites' ? 'Favorites Medicines' : 'Available Medicines'}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredPharmacies.length} found
              </span>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="mt-4 text-gray-600">Finding nearby pharmacies...</p>
              </div>
            ) : filteredPharmacies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-gray-400 mb-2">
                  <Search size={48} />
                </div>
                <h3 className="text-lg font-medium text-gray-700">No pharmacies found</h3>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or location</p>
              </div>
            ) : (
              <div className="cols">
                {filteredPharmacies.map((pharmacy) => (
                  <div 
                    key={pharmacy.id} 
                    className="col"
                    onClick={() => selectPharmacy(pharmacy)}
                  >
                    <div className="container">
                      <div 
                        className="front" 
                        style={{
                          backgroundImage: pharmacy.photos && pharmacy.photos.length > 0 
                            ? `url(${pharmacy.photos[0]})` 
                            : "url(/api/placeholder/300/300)"
                        }}
                      >
                        <div className="inner">
                          <p>{pharmacy.name}</p>
                          <span>{pharmacy.distance}</span>
                        </div>
                      </div>
                      <div className="back">
                        <div className="inner">
                          <p>{pharmacy.address}</p>
                          <div className="mt-2">
                            <StarRating rating={pharmacy.rating} />
                          </div>
                          <div className="flex justify-center mt-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(pharmacy.id);
                              }}
                              className={`p-2 rounded-full ${favorites.includes(pharmacy.id) ? 'text-red-500' : 'text-white'}`}
                            >
                              <Heart size={20} fill={favorites.includes(pharmacy.id) ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Map Area */}
          <div className="w-2/3 bg-gray-200 relative">
            <div id="map" className="w-full h-full"></div>
            
            {selectedPharmacy && (
              <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-lg">{selectedPharmacy.name}</h4>
                    <p className="text-gray-600 mt-1">{selectedPharmacy.address}</p>
                  </div>
                  <button 
                    className={`p-2 rounded-full ${favorites.includes(selectedPharmacy.id) ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => toggleFavorite(selectedPharmacy.id)}
                  >
                    <Heart size={24} fill={favorites.includes(selectedPharmacy.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <MapPin className="mr-2 text-blue-600" size={16} />
                    <span className="text-sm">{selectedPharmacy.distance} away</span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 text-blue-600">★</div>
                    <span className="text-sm">{selectedPharmacy.rating.toFixed(1)} rating</span>
                  </div>
                </div>
                
                {selectedPharmacy.photos && selectedPharmacy.photos.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <div className="flex space-x-2">
                      {selectedPharmacy.photos.slice(0, 3).map((photo, index) => (
                        <img 
                          key={index} 
                          src={photo} 
                          alt={`${selectedPharmacy.name} photo ${index + 1}`} 
                          className="h-16 w-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <button 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      if (selectedPharmacy.location) {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.location.lat},${selectedPharmacy.location.lng}`, '_blank');
                      }
                    }}
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* CSS for Flip Cards */}
      <style jsx>{`
        .cols {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin: 0 -0.5rem;
        }
        
        .col {
          width: calc(50% - 1rem);
          margin: 0.5rem;
          cursor: pointer;
          perspective: 1000px;
          height: 200px;
        }
        
        .container {
          transform-style: preserve-3d;
          width: 100%;
          height: 100%;
          transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        
        .col:hover .container {
          transform: rotateY(180deg);
        }
        
        .front, .back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .front {
          background-size: cover;
          background-position: center;
          color: white;
          z-index: 2;
        }
        
        .front:after {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          content: '';
          display: block;
          opacity: 0.6;
          background-color: #000;
          backface-visibility: hidden;
          border-radius: 10px;
        }
        
        .back {
          background: linear-gradient(45deg, #cedce7 0%, #596a72 100%);
          transform: rotateY(180deg);
          color: white;
        }
        
        .inner {
          position: relative;
          z-index: 2;
          padding: 1rem;
        }
        
        .front .inner p {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          position: relative;
          font-weight: bold;
        }
        
        .front .inner p:after {
          content: '';
          width: 4rem;
          height: 2px;
          position: absolute;
          background: #fff;
          display: block;
          left: 0;
          right: 0;
          margin: 0 auto;
          bottom: -0.5rem;
        }
        
        .front .inner span {
          color: rgba(255,255,255,0.8);
          font-weight: 300;
        }
        
        @media screen and (max-width: 64rem) {
          .col {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}