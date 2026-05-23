import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function MyReports({ reports }) {
    return (
        <AppLayout header="My Reported Incidents">
            <Head title="My Reported Incidents" />
            
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
                <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border border-indigo-500/30 rounded-xl p-8 text-white shadow-[0_0_25px_rgba(99,102,241,0.15)] relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black font-serif-custom">Your Contributions</h2>
                        <p className="text-indigo-200 mt-2">Thank you for helping keep our neighborhood safe. You have reported <span className="font-bold text-indigo-300 text-lg">{reports.total}</span> incidents.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>

                {reports.data.length === 0 ? (
                    <div className="premium-card space-y-6 rounded-xl text-center">
                        <div className="mb-4 flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-indigo-100">You haven't reported any incidents yet</h3>
                        <p className="text-slate-400 mt-2">If you see something, say something. Your reports help the whole community.</p>
                        <Link href={route('reports.create')} className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                            Start First Report
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="premium-card rounded-xl overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-slate-900/60 border-b border-slate-800/80">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Incident</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80">
                                    {reports.data.map(report => (
                                        <tr key={report.id} className="hover:bg-slate-900/30 transition duration-150">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-indigo-200 hover:text-indigo-400 transition font-serif-custom">
                                                    <Link href={route('reports.show', report.id)}>{report.title}</Link>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 line-clamp-1">{report.description}</div>
                                            </td>
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
                                            <td className="px-6 py-4 text-sm text-slate-300 font-medium">{report.location}</td>
                                            <td className="px-6 py-4 text-sm text-slate-400 font-medium">{dayjs(report.datetime).format('MMM DD, YYYY')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                                    report.status === 'resolved' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                                                }`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={route('reports.show', report.id)} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition uppercase tracking-wider text-[10px]">
                                                    View
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {reports.links && reports.links.length > 3 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-1">
                                    {reports.links.map((link, index) => (
                                        link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-4 py-2 border rounded-md text-sm font-bold transition ${
                                                    link.active ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-900/60 text-slate-400 hover:bg-slate-850 border-slate-800'
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
                    </>
                )}
            </div>
        </AppLayout>
    );
}
