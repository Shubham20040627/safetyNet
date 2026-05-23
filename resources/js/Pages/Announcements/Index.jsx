import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Index({ announcements }) {
    return (
        <AppLayout header="Community Notices">
            <Head title="Community Notices" />
            <style>
                {`
                .font-serif-custom { font-family: 'Merriweather', serif; }
                `}
            </style>
            
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col gap-2 mb-2">
                    <h2 class="text-2xl font-black text-slate-900 font-serif-custom">Announcement Archive</h2>
                    <p class="text-slate-500 text-sm font-medium">Stay informed with the latest news, safety drills, and updates from neighborhood watch management.</p>
                </div>

                <div className="space-y-4">
                    {announcements.data.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                            <div className="bg-slate-200 h-16 w-16 rounded-full mx-auto flex items-center justify-center text-slate-400 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">No Active Announcements</h3>
                            <p className="text-slate-500 text-sm mt-1">Everything is quiet right now. New broadcasted messages will appear here.</p>
                        </div>
                    ) : (
                        announcements.data.map((announcement) => (
                            <div key={announcement.id} className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition p-6 relative">
                                {/* Indicator bar on left */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                    announcement.type === 'critical' ? 'bg-red-600' : ''
                                } ${
                                    announcement.type === 'warning' ? 'bg-amber-500' : ''
                                } ${
                                    announcement.type === 'info' ? 'bg-indigo-600' : ''
                                }`}></div>

                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded ${
                                            announcement.type === 'critical' ? 'bg-red-100 text-red-700' : ''
                                        } ${
                                            announcement.type === 'warning' ? 'bg-amber-100 text-amber-700' : ''
                                        } ${
                                            announcement.type === 'info' ? 'bg-indigo-100 text-indigo-700' : ''
                                        }`}>
                                            {announcement.type}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">
                                            {dayjs(announcement.created_at).format('MMM DD, YYYY • hh:mm A')}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 font-serif-custom mb-2">{announcement.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{announcement.content}</p>
                                
                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Posted by Neighborhood Admin
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {announcements.links && announcements.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-1">
                            {announcements.links.map((link, index) => (
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
