import React from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Index({ announcements }) {
    const { delete: destroy } = useForm();

    const handleDelete = (e, announcementId) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            destroy(route('admin.announcements.destroy', announcementId));
        }
    };

    return (
        <AppLayout header="Safety Announcements">
            <Head title="Manage Announcements" />
            
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Manage Announcements</h2>
                        <p className="text-sm text-gray-500">Broadcast critical information to the neighborhood dashboard.</p>
                    </div>
                    <Link href={route('admin.announcements.create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-md flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Announcement
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {announcements.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" class="px-6 py-8 text-center text-gray-500">
                                        No announcements found. <Link href={route('admin.announcements.create')} className="text-indigo-600 underline">Create the first one.</Link>
                                    </td>
                                </tr>
                            ) : (
                                announcements.data.map((announcement) => (
                                    <tr key={announcement.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{announcement.title}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{announcement.content}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                announcement.type === 'critical' ? 'bg-red-100 text-red-600' : ''
                                            } ${
                                                announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : ''
                                            } ${
                                                announcement.type === 'info' ? 'bg-blue-100 text-blue-600' : ''
                                            }`}>
                                                {announcement.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium ${announcement.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                                {announcement.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {dayjs(announcement.created_at).format('MMM DD, YYYY HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form onSubmit={(e) => handleDelete(e, announcement.id)} className="inline-block">
                                                <button type="submit" className="text-red-600 hover:text-red-900 font-bold text-xs">
                                                    Delete
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {announcements.links && announcements.links.length > 3 && (
                    <div className="mt-4 flex justify-center">
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
