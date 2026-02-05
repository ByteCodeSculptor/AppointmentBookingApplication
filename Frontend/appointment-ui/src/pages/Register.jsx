import { useState } from 'react';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'CLIENT' // Default role
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            toast.success("Registration Successful! Please Login.");
            setTimeout(() => navigate('/login'), 1500); // Redirect to login after 1.5s
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Toaster />
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input className="w-full p-2 border rounded mt-1" required
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" className="w-full p-2 border rounded mt-1" required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" className="w-full p-2 border rounded mt-1" required
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">I am a:</label>
                        <select className="w-full p-2 border rounded mt-1 bg-white"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="CLIENT">Client</option>
                            <option value="PROVIDER">Service Provider</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        Register
                    </button>
                </form>
                
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-blue-500 text-sm">Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;