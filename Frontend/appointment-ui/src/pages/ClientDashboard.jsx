import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

const ClientDashboard = () => {
    const { logout, user } = useAuth();
    const [services, setServices] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    
    // Booking State
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        fetchServices();
        fetchMyBookings();
    }, []);

    const fetchServices = async () => {
        try {
            const { data } = await api.get('/client/services');
            setServices(data);
        } catch (error) { toast.error("Failed to load marketplace"); }
    };

    const fetchMyBookings = async () => {
        try {
            const { data } = await api.get('/client/my-appointments');
            setMyBookings(data);
        } catch (error) { console.error("Could not load bookings"); }
    };

    const handleDateChange = async (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (selectedService && date) {
            try {
                // Fetch slots for the provider of this service
                const providerId = selectedService.provider.id;
                const { data } = await api.get(`/client/slots?providerId=${providerId}&date=${date}`);
                setAvailableSlots(data);
            } catch (error) { toast.error("Could not find slots"); }
        }
    };

    const bookSlot = async (time) => {
        try {
            await api.post(`/client/book?serviceId=${selectedService.id}&date=${selectedDate}&time=${time}`);
            toast.success("Booking Request Sent!");
            fetchMyBookings();
            setSelectedService(null); // Close modal/view
            setAvailableSlots([]);
        } catch (error) { toast.error(error.response?.data?.message || "Booking Failed"); }
    };

    const cancelBooking = async (id) => {
        if(!confirm("Are you sure?")) return;
        try {
            await api.patch(`/client/appointment/${id}/cancel`);
            toast.success("Booking Cancelled");
            fetchMyBookings();
        } catch (error) { toast.error("Cancel failed"); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster />
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Marketplace</h1>
                        <p className="text-gray-500">Find services: Doctors, Rentals, Salons...</p>
                    </div>
                    <button onClick={logout} className="bg-gray-600 text-white px-4 py-2 rounded">Logout</button>
                </header>

                {/* 1. BOOKING WIZARD (If a service is selected) */}
                {selectedService && (
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-2 border-blue-100">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-blue-800">Book: {selectedService.name}</h2>
                            <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-red-500">Close</button>
                        </div>
                        <p className="text-gray-600 mb-4">{selectedService.description} - ${selectedService.price}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block font-semibold mb-2">Pick a Date:</label>
                                <input type="date" className="border p-2 rounded w-full" 
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={handleDateChange} />
                            </div>
                            
                            <div>
                                <label className="block font-semibold mb-2">Available Slots:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {availableSlots.length > 0 ? availableSlots.map((slot, idx) => (
                                        <button key={idx} 
                                            disabled={!slot.available}
                                            onClick={() => bookSlot(slot.time)}
                                            className={`p-2 rounded text-sm ${slot.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                            {slot.time}
                                        </button>
                                    )) : <p className="text-sm text-gray-400">Select a date to see slots.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SERVICE LIST (The Marketplace) */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4">Available Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {services.map(service => (
                            <div key={service.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition cursor-pointer border hover:border-blue-500"
                                onClick={() => setSelectedService(service)}>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg">{service.name}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${service.price}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Provided by: {service.provider?.fullName || 'Unknown'}</p>
                                <p className="text-xs text-gray-400 mt-1">Duration: {service.durationMinutes} mins</p>
                                <button className="mt-4 w-full bg-blue-600 text-white py-1.5 rounded text-sm">Book Now</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. MY BOOKINGS */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">My Appointments</h2>
                    {myBookings.length === 0 ? <p className="text-gray-500">No bookings found.</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-sm">
                                        <th className="p-3">Service</th>
                                        <th className="p-3">Provider</th>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myBookings.map(appt => (
                                        <tr key={appt.id} className="border-b">
                                            <td className="p-3 font-medium">{appt.service?.name}</td>
                                            <td className="p-3">{appt.provider?.fullName}</td>
                                            <td className="p-3">{appt.appointmentDate}</td>
                                            <td className="p-3">{appt.startTime}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                                                    appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {appt.status !== 'CANCELLED' && (
                                                    <button onClick={() => cancelBooking(appt.id)} className="text-red-500 hover:text-red-700 text-sm">Cancel</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;