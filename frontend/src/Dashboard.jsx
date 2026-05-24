import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, HelpCircle, Trash2, Edit, Search, ArrowUpDown, ChevronUp, ChevronDown, Filter } from 'lucide-react';

const Dashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Search and Sort
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // NEW: State for Categorical Filters
    const [filterDept, setFilterDept] = useState('All');
    const [filterRole, setFilterRole] = useState('All');
    const [filterRisk, setFilterRisk] = useState('All');

    const navigate = useNavigate();

    const fetchEmployees = () => {
        fetch(`${import.meta.env.VITE_API_URL}/employees`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch data from server');
                return res.json();
            })
            .then((data) => {
                setEmployees(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this employee from the watchlist?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/employees/${id}`, { method: 'DELETE' });
            if (response.ok) fetchEmployees();
        } catch (err) {
            console.error("Error during deletion:", err);
        }
    };

    const handleEdit = (emp) => {
        navigate('/predict', { state: { editEmployee: emp } });
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // --- Dynamic Dropdown Options based on actual data ---
    const uniqueDepts = ['All', ...new Set(employees.map(emp => emp.department))];
    const uniqueRoles = ['All', ...new Set(employees.map(emp => emp.job_role))];
    const uniqueRisks = ['All', 'High', 'Medium', 'Low'];

    // --- Filter & Sort Pipeline ---
    const processedEmployees = useMemo(() => {
        let items = [...employees];

        // 1. Text Search
        if (searchQuery) {
            items = items.filter(emp =>
                emp.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Categorical Filters
        if (filterDept !== 'All') {
            items = items.filter(emp => emp.department === filterDept);
        }
        if (filterRole !== 'All') {
            items = items.filter(emp => emp.job_role === filterRole);
        }
        if (filterRisk !== 'All') {
            items = items.filter(emp => emp.risk_level === filterRisk);
        }

        // 3. Column Sorting
        if (sortConfig.key !== null) {
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return items;
    }, [employees, searchQuery, filterDept, filterRole, filterRisk, sortConfig]);

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) return <ArrowUpDown size={14} className="text-gray-400" />;
        if (sortConfig.direction === 'ascending') return <ChevronUp size={14} className="text-blue-600" />;
        return <ChevronDown size={14} className="text-blue-600" />;
    };

    const getRiskBadge = (level) => {
        switch (level) {
            case 'High': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-medium"><AlertCircle size={14} /> High Risk</span>;
            case 'Medium': return <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium"><HelpCircle size={14} /> Medium Risk</span>;
            default: return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle size={14} /> Low Risk</span>;
        }
    };

    if (loading) return <div className="text-gray-500 mt-10 text-center text-lg">Loading employee data...</div>;
    if (error) return <div className="text-red-500 mt-10 text-center text-lg">Error: {error}. Is your Flask server running?</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">

            {/* HEADER & SEARCH BAR */}
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Retention Watchlist</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor high-risk employees and track HR actions.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by employee name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="p-4 border-b border-gray-200 bg-white flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 font-medium mr-2">
                    <Filter size={16} /> Filters:
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-gray-500">Department:</label>
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="p-1.5 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                        {uniqueDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-gray-500">Role:</label>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="p-1.5 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                        {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-gray-500">Risk Level:</label>
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="p-1.5 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                        {uniqueRisks.map(risk => <option key={risk} value={risk}>{risk}</option>)}
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                            <th
                                className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                onClick={() => handleSort('id')}
                            >
                                <div className="flex items-center gap-1">Emp ID {getSortIcon('id')}</div>
                            </th>
                            
                            <th
                                className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-1">Employee Name {getSortIcon('name')}</div>
                            </th>
                            <th className="p-4 font-medium">Department</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Risk Level</th>
                            <th
                                className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                onClick={() => handleSort('risk_score')}
                            >
                                <div className="flex items-center gap-1">ML Score {getSortIcon('risk_score')}</div>
                            </th>
                            <th className="p-4 font-medium text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {processedEmployees.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No employees match your search and filter criteria.
                                </td>
                            </tr>
                        ) : (
                            processedEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500 font-mono text-sm">#{emp.id}</td>
                                    <td className="p-4 font-medium text-gray-900">{emp.name}</td>
                                    <td className="p-4 text-gray-600">{emp.department}</td>
                                    <td className="p-4 text-gray-600">{emp.job_role}</td>
                                    <td className="p-4">{getRiskBadge(emp.risk_level)}</td>
                                    <td className="p-4 text-gray-900 font-semibold">{emp.risk_score}%</td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                                            title="Edit employee"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(emp.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
                                            title="Remove from watchlist"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;