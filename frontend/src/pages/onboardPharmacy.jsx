import { useEffect, useState } from "react";
import { MapPin, Phone, Check, AlertCircle } from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function PharmacyOnboarding() {
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
  });
  
  const navigate = useNavigate();

  // Check if pharmacy data exists in localStorage on component mount
  useEffect(() => {
    const pharmacyData = JSON.parse(localStorage.getItem("pharmacyData"));
    
    if (pharmacyData) {
      // If the data exists, redirect the user to the dashboard
      navigate('/pharmacy');
    }
  }, [navigate]);

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  

  // get logged in id
    useEffect(() => {
  const storedUser = localStorage.getItem("user-data");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    setFormData((prevFormData) => ({
      ...prevFormData,
      userId: user.id,
    }));
  }
}, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Pharmacy name is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
    } else if (currentStep === 2) {
      if (!formData.latitude.trim()) newErrors.latitude = "Latitude is required";
      if (!formData.longitude.trim()) newErrors.longitude = "Longitude is required";
      
      // Validate latitude and longitude format
      const latRegex = /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
      const lngRegex = /^-?((1?[0-7]?\d(\.\d+)?)|180(\.0+)?)$/;
      
      if (formData.latitude && !latRegex.test(formData.latitude)) 
        newErrors.latitude = "Invalid latitude format";
      if (formData.longitude && !lngRegex.test(formData.longitude)) 
        newErrors.longitude = "Invalid longitude format";
    } else if (currentStep === 3) {
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      
      // Simple phone validation
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (formData.phone && !phoneRegex.test(formData.phone)) 
        newErrors.phone = "Invalid phone number format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };
  
  const handlePrevious = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
        userId: formData.userId,
        name: formData.name,
        address: formData.address,
        location: {
            type: "Point",  
            coordinates: [
                parseFloat(formData.longitude),  // make sure they're numbers
                parseFloat(formData.latitude)
            ]
        },
        contact: formData.phone 
    };
    
    
    if (validateStep(step)) {
      setIsSubmitting(true);
      
      try {
        api.post("/pharmacy/onboardPharmacy", submitData)
          .then((response) => {
            console.log(response.data);
            setIsSubmitting(false);
            setIsComplete(true);

            // Save the pharmacy data into localStorage after successful onboarding
          localStorage.setItem('pharmacyData', JSON.stringify(response.data.pharmacy));  // Storing pharmacy data in localStorage
          })
          .catch((error) => {
            console.error("Error creating pharmacy:", error);
            setIsSubmitting(false);
          });
      } catch (error) {
        console.error("Error creating pharmacy:", error);
        setIsSubmitting(false);
      }
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Pharmacy Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter pharmacy name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Complete Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full pl-10 pr-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Street address, city, state, zip code"
                />
              </div>
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Location Coordinates
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                You can get your exact coordinates from Google Maps by right-clicking on your location and selecting "What's here?"
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.latitude ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g. 40.7128"
                />
                {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>}
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.longitude ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g. -74.0060"
                />
                {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>}
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center">
              <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                <MapPin className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  These coordinates will be used to place your pharmacy on maps and help customers find your location.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              
              <p className="mt-2 text-sm text-gray-500">
                This number will be displayed to customers looking for your pharmacy.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Complete!</h1>
            <p className="text-gray-600">Your pharmacy profile has been successfully created.</p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Thank you for registering your pharmacy
              </h2>
              
              <p className="text-gray-600 mb-8">
                Your profile is now visible to customers in your area. You can edit your information anytime from your dashboard.
              </p>
              
              <button 
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={() => navigate('/pharmacy')}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Profile Setup</h1>
          <p className="mt-2 text-gray-600">Enter your pharmacy details to complete registration</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {["Basic Info", "Location", "Details"].map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > index + 1 ? 'bg-green-500' : 
                  step === index + 1 ? 'bg-blue-600' : 'bg-gray-300'
                } text-white font-medium`}>
                  {step > index + 1 ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span className={`text-xs mt-1 ${
                  step > index + 1 ? 'text-green-600' : 
                  step === index + 1 ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-8">
              {renderStep()}
            </div>
            
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={step === 1}
                className={`px-4 py-2 rounded-lg font-medium ${
                  step === 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}