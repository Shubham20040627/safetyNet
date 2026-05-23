import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Reports({ reports, responders }) {
    const { post, delete: destroy } = useForm();
    const [assignedResponderId, setAssignedResponderId] = useState({});

    const handleAssign = (e, reportId) => {
        e.preventDefault();
        const responderId = assignedResponderId[reportId];
        if (!responderId) return;

        post(route('admin.reports.assign-responder', reportId), {
            data: { responder_id: responderId }
        });
    };

    const handleResolve = (e, reportId) => {
        e.preventDefault();
        post(route('admin.reports.resolve', reportId));
    };

    const handleDelete = (e, reportId) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to delete this report?')) {
            destroy(route('admin.reports.delete', reportId));
        }
    };

    return (
        <AppLayout header="Manage Reports">
            <Head title="Manage Reports" />
            
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 overflow-x-auto">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">All Reported Incidents</h3>
                            <p className="text-sm text-gray-500">Monitor and resolve neighborhood incidents.</p>
                        </div>
                    </div>
                    
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Report</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reporter</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reports.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No reports found.
                                    </td>
                                </tr>
                            ) : (
                                reports.data.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800 hover:text-indigo-600 transition">
                                                <Link href={route('reports.show', report.id)}>{report.title}</Link>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">{report.location} | {dayjs(report.datetime).format('MMM DD, YYYY')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                report.type === 'crime' ? 'bg-red-100 text-red-600' : ''
                                            } ${
                                                report.type === 'accident' ? 'bg-yellow-100 text-yellow-600' : ''
                                            } ${
                                                report.type === 'suspicious' ? 'bg-purple-100 text-purple-600' : ''
                                            } ${
                                                report.type === 'other' ? 'bg-gray-100 text-gray-600' : ''
                                            }`}>
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                report.priority === 'critical' ? 'bg-red-600 text-white shadow-sm' : ''
                                            } ${
                                                report.priority === 'high' ? 'bg-orange-100 text-orange-600 border border-orange-200' : ''
                                            } ${
                                                report.priority === 'medium' ? 'bg-blue-100 text-blue-600 border border-blue-200' : ''
                                            } ${
                                                report.priority === 'low' ? 'bg-slate-100 text-slate-600 border border-slate-200' : ''
                                            }`}>
                                                {report.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-700">{report.user.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                report.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a href={route('reports.pdf', report.id)} className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    PDF
                                                </a>

                                                {report.latitude && report.longitude && (
                                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Navigate
                                                    </a>
                                                )}

                                                {report.status !== 'resolved' && (
                                                    <>
                                                        <form onSubmit={(e) => handleAssign(e, report.id)} className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                            <select 
                                                                name="responder_id" 
                                                                value={assignedResponderId[report.id] || report.responder_id || ""}
                                                                onChange={(e) => setAssignedResponderId({ ...assignedResponderId, [report.id]: e.target.value })}
                                                                className="text-xs border-none bg-gray-50 focus:ring-0 py-1.5 pl-2 pr-6 h-full cursor-pointer" 
                                                                required
                                                            >
                                                                <option value="">Assign Responder</option>
                                                                {responders.map((responder) => (
                                                                    <option key={responder.id} value={responder.id}>
                                                                        {responder.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 text-xs font-bold transition h-full border-l border-indigo-600 cursor-pointer">
                                                                Assign
                                                            </button>
                                                        </form>

                                                        <form onSubmit={(e) => handleResolve(e, report.id)}>
                                                            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                                                                Resolve
                                                            </button>
                                                        </form>
                                                    </>
                                                )}
                                            
                                                <form onSubmit={(e) => handleDelete(e, report.id)}>
                                                    <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                                                        Delete
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {reports.links && reports.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-1">
                            {reports.links.map((link, index) => (
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                                            link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
