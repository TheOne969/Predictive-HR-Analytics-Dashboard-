import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Users, Activity } from 'lucide-react';
import Dashboard from './Dashboard';
import Predict from './Predict'; // <-- NEW IMPORT

function App() {
    return (
        <Router>
            <div className="min-h-screen">
                <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="text-blue-600" size={24} />
                            <h1 className="text-xl font-bold text-gray-800">HR Retention Suite</h1>
                        </div>

                        <div className="flex gap-6">
                            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                                <Users size={18} />
                                Dashboard
                            </Link>
                            <Link to="/predict" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm">
                                + New Prediction
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto p-6">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/predict" element={<Predict />} /> {/* <-- NEW PREDICT ROUTE */}
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;