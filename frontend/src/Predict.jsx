import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BrainCircuit, Save, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const Predict = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if we were passed an employee to edit from the Dashboard
    const editModeEmployee = location.state?.editEmployee || null;

    // 1. State: Pre-fill ALL variables if in edit mode, otherwise use defaults
    const [formData, setFormData] = useState({
        name: editModeEmployee ? editModeEmployee.name : '',
        department: editModeEmployee ? editModeEmployee.department : 'Sales',
        job_role: editModeEmployee ? editModeEmployee.job_role : 'Sales Executive',

        
        Age: editModeEmployee ? editModeEmployee.Age : 35,
        MonthlyIncome: editModeEmployee ? editModeEmployee.MonthlyIncome : 5000,
        OverTime: editModeEmployee ? editModeEmployee.OverTime : 'No',
        StockOptionLevel: editModeEmployee ? editModeEmployee.StockOptionLevel : 0,
        JobLevel: editModeEmployee ? editModeEmployee.JobLevel : 2,
        TotalWorkingYears: editModeEmployee ? editModeEmployee.TotalWorkingYears : 10,
        MaritalStatus: editModeEmployee ? editModeEmployee.MaritalStatus : 'Married',
        YearsAtCompany: editModeEmployee ? editModeEmployee.YearsAtCompany : 3,
        YearsWithCurrManager: editModeEmployee ? editModeEmployee.YearsWithCurrManager : 3
    });

    const [prediction, setPrediction] = useState(null);
    const [featureData, setFeatureData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savedStatus, setSavedStatus] = useState('');

    const kaggleJobRoles = [
        'Sales Executive', 'Research Scientist', 'Laboratory Technician',
        'Manufacturing Director', 'Healthcare Representative', 'Manager',
        'Sales Representative', 'Research Director', 'Human Resources'
    ];

    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/features')
            .then(res => res.json())
            .then(data => {
                // 1. Normalize data format
                const sourceData = Array.isArray(data)
                    ? data.reduce((acc, curr) => ({ ...acc, [curr.feature]: curr.importance }), {})
                    : data;

                // 2. Aggregate One-Hot Encoded Features
                const aggregatedFeatures = {};
                Object.keys(sourceData).forEach(key => {
                    // Splits "OverTime_Yes" into "OverTime", or keeps "MonthlyIncome" as is
                    const baseFeature = key.split('_')[0];

                    // Add the mathematical weights together
                    aggregatedFeatures[baseFeature] = (aggregatedFeatures[baseFeature] || 0) + Number(sourceData[key] || 0);
                });

                // 3. Format, Sort, and Slice for Recharts
                const formattedData = Object.keys(aggregatedFeatures).map(key => ({
                    feature: key,
                    importance: aggregatedFeatures[key]
                }));

                const topFeatures = formattedData
                    .filter(item => item.feature && typeof item.importance === 'number')
                    .sort((a, b) => b.importance - a.importance)
                    .slice(0, 5); // Keep top 5 biggest factors

                setFeatureData(topFeatures);
            })
            .catch(err => console.error("Could not load features", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const isStringField = ['name', 'department', 'job_role', 'OverTime', 'MaritalStatus'].includes(name);

        setFormData({
            ...formData,
            [name]: isStringField ? value : Number(value)
        });
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSavedStatus('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error(`Server responded with a ${response.status} error`);
            const data = await response.json();
            setPrediction(data);
        } catch (err) {
            console.error("Prediction failed:", err);
            alert("Could not connect to the ML server. Is Flask running?");
        }
        setLoading(false);
    };

    // UPDATE: Sends the FULL payload to the database
    const handleSaveToWatchlist = async () => {
        try {
            // We use ...formData to include Age, MonthlyIncome, OverTime, etc.
            const payload = {
                ...formData,
                risk_score: prediction.probability,
                risk_level: prediction.risk_level
            };

            const url = editModeEmployee
                ? `${import.meta.env.VITE_API_URL}/employees/${editModeEmployee.id}`
                : `${import.meta.env.VITE_API_URL}/employees`;
                
            const method = editModeEmployee ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSavedStatus(editModeEmployee ? 'Record updated successfully!' : 'Successfully saved to dashboard registry!');
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            console.error("Failed to save", err);
        }
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* LEFT SIDE: The Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <BrainCircuit className="text-blue-600" />
                    {editModeEmployee ? `Updating: ${editModeEmployee.name}` : 'Predictive Analytics Form'}
                </h2>

                <form onSubmit={handlePredict} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">

                        {/* Identity Group */}
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Employee Identity</label>

                            {/* ---> NEW: Immutable System ID Badge <--- */}
                            {editModeEmployee && (
                                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between">
                                    <span className="text-sm text-gray-500 font-medium">System / Employee ID:</span>
                                    <span className="text-sm font-mono font-bold text-gray-800">#{editModeEmployee.id}</span>
                                </div>
                            )}

                            <input type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" disabled={editModeEmployee !== null} />
                            {editModeEmployee && <p className="text-xs text-gray-400 mt-1">Name cannot be changed during an update.</p>}
                        </div>
                        <div>
                            <select name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-500 text-sm">
                                <option value="Sales">Sales</option>
                                <option value="Research & Development">R&D</option>
                                <option value="Human Resources">HR</option>
                            </select>
                        </div>
                        <div>
                            <select name="job_role" value={formData.job_role} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-500 text-sm">
                                {kaggleJobRoles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2 border-t border-gray-100 my-2"></div>

                        {/* Demographics & Comp */}
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Demographics & Compensation</label>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Age</label>
                            <input type="number" name="Age" value={formData.Age} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Marital Status</label>
                            <select name="MaritalStatus" value={formData.MaritalStatus} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-500">
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Monthly Income ($)</label>
                            <input type="number" step="100" name="MonthlyIncome" value={formData.MonthlyIncome} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Stock Options (0-3)</label>
                            <select name="StockOptionLevel" value={formData.StockOptionLevel} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-500">
                                <option value="0">0 (None)</option>
                                <option value="1">1 (Standard)</option>
                                <option value="2">2 (High)</option>
                                <option value="3">3 (Executive)</option>
                            </select>
                        </div>

                        <div className="col-span-2 border-t border-gray-100 my-2"></div>

                        {/* Tenure & Workload */}
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tenure & Workload</label>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Overtime Worker?</label>
                            <select name="OverTime" value={formData.OverTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-500">
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Job Level (1-5)</label>
                            <select name="JobLevel" value={formData.JobLevel} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-500">
                                <option value="1">1 (Entry)</option>
                                <option value="2">2 (Junior)</option>
                                <option value="3">3 (Mid-Level)</option>
                                <option value="4">4 (Senior)</option>
                                <option value="5">5 (Lead/Exec)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Total Career Years</label>
                            <input type="number" name="TotalWorkingYears" value={formData.TotalWorkingYears} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Years At Company</label>
                            <input type="number" name="YearsAtCompany" value={formData.YearsAtCompany} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm text-gray-700 mb-1">Years With Current Manager</label>
                            <input type="number" name="YearsWithCurrManager" value={formData.YearsWithCurrManager} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors mt-4 shadow-sm">
                        {loading ? 'Analyzing...' : 'Run Prediction Model'}
                    </button>
                </form>
            </div>

            {/* RIGHT SIDE: The Results & Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h2>

                {!prediction ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                        {editModeEmployee ? "Run the prediction to recalculate risk score." : "Enter employee parameters to run calculations."}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className={`p-6 rounded-lg border text-center ${prediction.risk_level === 'High' ? 'bg-red-50 border-red-200 text-red-800' :
                                prediction.risk_level === 'Medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                                    'bg-green-50 border-green-200 text-green-800'
                            }`}>
                            <div className="text-sm font-semibold uppercase tracking-wider mb-1">Flight Risk Probability</div>
                            <div className="text-5xl font-black mb-2">{(prediction.probability * 100).toFixed(1)}%</div>
                            <div className="text-lg font-medium flex items-center justify-center gap-2">
                                {prediction.risk_level === 'High' && <AlertTriangle size={20} />}
                                {prediction.risk_level === 'Medium' && <HelpCircle size={20} />}
                                {prediction.risk_level === 'Low' && <CheckCircle size={20} />}
                                {prediction.risk_level} Risk Assessment
                            </div>
                        </div>

                        <button onClick={handleSaveToWatchlist} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <Save size={18} /> {editModeEmployee ? "Update Dashboard Record" : "Save Record to Dashboard Registry"}
                        </button>
                        {savedStatus && <div className="text-center text-green-600 font-semibold text-sm mt-2">{savedStatus}</div>}

                        {featureData && featureData.length > 0 && (
                            <div className="pt-4 border-t border-gray-200 mt-6">
                                <h3 className="text-sm font-semibold text-gray-600 mb-4 text-center">Global Factors Driving Attrition</h3>
                                <div className="h-56 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4B5563' }} width={130} />
                                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="importance" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={18} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Predict;