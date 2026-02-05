import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

const ProviderDashboard = () => {
    const { logout, user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    
    // Forms State
    const [newService, setNewService] = useState({ name: '', price: '', durationMinutes: 30 });
    const [schedule, setSchedule] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });

    // 1. Fetch Data on Load
    useEffect(() => {
        fetchAppointments();
        fetchServices();
    }, []);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/provider/appointments');
            setAppointments(data);
        } catch (error) { toast.error("Failed to load appointments"); }
    };

    const fetchServices = async () => {
        try {
            const { data } = await api.get('/provider/services');
            setServices(data);
        } catch (error) { console.error(error); }
    };

    // 2. Action: Accept/Reject
    const handleStatus = async (id, status) => {
        try {
            await api.patch(`/provider/appointment/${id}/status?status=${status}`);
            toast.success(`Booking ${status}`);
            fetchAppointments(); // Refresh list
        } catch (error) { toast.error("Action failed"); }
    };

    // 3. Action: Add Service
    const addService = async (e) => {
        e.preventDefault();
        try {
            await api.post('/provider/services', newService);
            toast.success("Service Added!");
            fetchServices();
            setNewService({ name: '', price: '', durationMinutes: 30 });
        } catch (error) { toast.error("Failed to add service"); }
    };

    // 4. Action: Set Schedule
    const updateSchedule = async (e) => {
        e.preventDefault();
        // Wrap single day in array as backend expects List<Availability>
        const payload = [{
            dayOfWeek: parseInt(schedule.dayOfWeek),
            startTime: schedule.startTime + ":00", // Add seconds for LocalTime
            endTime: schedule.endTime + ":00"
        }];
        try {
            await api.post('/provider/availability', payload);
            toast.success("Schedule Updated!");
        } catch (error) { toast.error("Failed to update schedule"); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster />
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Provider Dashboard</h1>
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SECTION A: Incoming Bookings */}
                    <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Booking Requests</h2>
                        {appointments.length === 0 ? <p className="text-gray-500">No bookings yet.</p> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3">Client</th>
                                            <th className="p-3">Service</th>
                                            <th className="p-3">Date/Time</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(appt => (
                                            <tr key={appt.id} className="border-b">
                                                <td className="p-3">{appt.client?.fullName || appt.client?.email}</td>
                                                <td className="p-3">{appt.service?.name}</td>
                                                <td className="p-3">{appt.appointmentDate} at {appt.startTime}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                                                        appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {appt.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 space-x-2">
                                                    {appt.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleStatus(appt.id, 'CONFIRMED')} className="text-green-600 hover:underline">Accept</button>
                                                            <button onClick={() => handleStatus(appt.id, 'REJECTED')} className="text-red-600 hover:underline">Reject</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* SECTION B: Manage Services */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Add Service</h2>
                        <form onSubmit={addService} className="space-y-3">
                            <input placeholder="Service Name (e.g. Haircut)" className="w-full border p-2 rounded" 
                                value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
                            <div className="flex gap-2">
                                <input placeholder="Price ($)" type="number" className="w-full border p-2 rounded" 
                                    value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required />
                                <input placeholder="Mins" type="number" className="w-full border p-2 rounded" 
                                    value={newService.durationMinutes} onChange={e => setNewService({...newService, durationMinutes: e.target.value})} required />
                            </div>
                            <button className="w-full bg-blue-600 text-white py-2 rounded">Add Service</button>
                        </form>
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-700">Your Services:</h3>
                            <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                                {services.map(s => <li key={s.id}>{s.name} - ${s.price} ({s.durationMinutes} mins)</li>)}
                            </ul>
                        </div>
                    </div>

                    {/* SECTION C: Availability */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Set Availability</h2>
                        <form onSubmit={updateSchedule} className="space-y-3">
                            <label className="block text-sm text-gray-600">Day of Week</label>
                            <select className="w-full border p-2 rounded" 
                                value={schedule.dayOfWeek} onChange={e => setSchedule({...schedule, dayOfWeek: e.target.value})}>
                                <option value="1">Monday</option>
                                <option value="2">Tuesday</option>
                                <option value="3">Wednesday</option>
                                <option value="4">Thursday</option>
                                <option value="5">Friday</option>
                                <option value="6">Saturday</option>
                                <option value="0">Sunday</option>
                            </select>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="text-xs">Start Time</label>
                                    <input type="time" className="w-full border p-2 rounded" 
                                        value={schedule.startTime} onChange={e => setSchedule({...schedule, startTime: e.target.value})} required />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-xs">End Time</label>
                                    <input type="time" className="w-full border p-2 rounded" 
                                        value={schedule.endTime} onChange={e => setSchedule({...schedule, endTime: e.target.value})} required />
                                </div>
                            </div>
                            <button className="w-full bg-green-600 text-white py-2 rounded">Update Schedule</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;