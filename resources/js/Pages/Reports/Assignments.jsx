import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Assignments({ reports }) {
    const { auth } = usePage().props;
    const isAdmin = auth.user.role === 'admin';
    const headerTitle = isAdmin ? 'Active Dispatches' : 'My Assignments';
    const { post } = useForm();

    const handleResolve = (e, reportId) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to mark this incident as resolved?')) {
            post(route('reports.resolve-assigned', reportId));
        }
    };

    return (
        <AppLayout header={headerTitle}>
            <Head title={headerTitle} />
            
            <style>
                {`
                .glass-card {
                    background: rgba(15, 23, 42, 0.65);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(30, 41, 59, 0.8);
                }
                `}
            </style>

            <div className="space-y-6">
                <div className="glass-card rounded-xl shadow-md overflow-hidden overflow-x-auto">
                    <div className="p-6 border-b border-slate-800/80">
                        <h3 className="text-lg font-bold text-indigo-100 font-serif-custom">{isAdmin ? 'Active Responder Dispatches' : 'Incidents Assigned to You'}</h3>
                        <p className="text-sm text-slate-400">{isAdmin ? 'Monitor current response operations in the neighborhood.' : 'Investigate and resolve these incidents.'}</p>
                    </div>
                    
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-900/60 border-b border-slate-800/80">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Report</th>
                                {isAdmin && (
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Responder</th>
                                )}
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {reports.data.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            <span className="font-bold text-sm text-slate-400">{isAdmin ? 'No active dispatches' : 'No active assignments'}</span>
                                            <span className="text-xs text-slate-500 mt-1">{isAdmin ? 'There are currently no active dispatches in the community.' : 'You currently have no incidents assigned to you.'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.data.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-900/30 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white font-serif-custom">{report.title}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{report.location} | {dayjs(report.datetime).format('MMM DD, YYYY')}</div>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-slate-300">
                                                    {report.responder ? report.responder.name : 'Unassigned'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                                report.type === 'crime' ? 'bg-red-950/60 text-red-400 border-red-800/50' : ''
                                            } ${
                                                report.type === 'accident' ? 'bg-yellow-950/60 text-yellow-400 border-yellow-800/50' : ''
                                            } ${
                                                report.type === 'suspicious' ? 'bg-purple-950/60 text-purple-400 border-purple-800/50' : ''
                                            } ${
                                                report.type === 'other' ? 'bg-slate-900/60 text-slate-400 border-slate-800/50' : ''
                                            }`}>
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                                report.priority === 'critical' ? 'bg-red-650/30 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''
                                            } ${
                                                report.priority === 'high' ? 'bg-orange-950/60 text-orange-400 border-orange-800/50' : ''
                                            } ${
                                                report.priority === 'medium' ? 'bg-blue-950/60 text-blue-400 border-blue-800/50' : ''
                                            } ${
                                                report.priority === 'low' ? 'bg-slate-900/60 text-slate-400 border-slate-800/50' : ''
                                            }`}>
                                                {report.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                                report.status === 'resolved' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('reports.show', report.id)} className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 transition shadow-sm">
                                                    View Details
                                                </Link>

                                                {report.status !== 'resolved' && (
                                                    <>
                                                        {report.latitude && report.longitude && (
                                                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/50 transition shadow-sm flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                Navigate
                                                            </a>
                                                        )}

                                                        <form onSubmit={(e) => handleResolve(e, report.id)} className="inline">
                                                            <button type="submit" className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-500/50 transition shadow-sm flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Mark Resolved
                                                            </button>
                                                        </form>
                                                    </>
                                                )}
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
                                        className={`px-4 py-2 border rounded-md text-sm font-bold transition ${
                                            link.active ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-slate-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-4 py-2 border rounded-md text-sm font-bold bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed"
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
