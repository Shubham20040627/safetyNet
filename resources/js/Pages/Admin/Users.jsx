import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function Users({ users }) {
    const { post } = useForm();

    const handleAction = (e, routeName, userId) => {
        e.preventDefault();
        post(route(routeName, userId));
    };

    return (
        <AppLayout header="Manage Users">
            <Head title="Manage Users" />
            
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 overflow-x-auto">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Community Members</h3>
                        <p className="text-sm text-gray-500">Approve or reject new member registrations.</p>
                    </div>
                    
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No members found.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    {user.name.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-gray-100 text-gray-600">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {dayjs(user.created_at).format('MMM DD, YYYY')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                user.status === 'approved' ? 'bg-green-100 text-green-600' : ''
                                            } ${
                                                user.status === 'pending' ? 'bg-amber-100 text-amber-600' : ''
                                            } ${
                                                user.status === 'rejected' ? 'bg-red-100 text-red-600' : ''
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.status !== 'approved' && (
                                                    <form onSubmit={(e) => handleAction(e, 'admin.users.approve', user.id)}>
                                                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                                                            Approve
                                                        </button>
                                                    </form>
                                                )}
                                                
                                                {user.status === 'approved' && user.role === 'user' && (
                                                    <form onSubmit={(e) => handleAction(e, 'admin.users.make-responder', user.id)}>
                                                        <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                                                            Make Responder
                                                        </button>
                                                    </form>
                                                )}

                                                {user.status === 'approved' && user.role === 'responder' && (
                                                    <form onSubmit={(e) => handleAction(e, 'admin.users.remove-responder', user.id)}>
                                                        <button type="submit" className="bg-slate-500 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                                                            Remove Responder
                                                        </button>
                                                    </form>
                                                )}

                                                {user.status !== 'rejected' && (
                                                    <form onSubmit={(e) => handleAction(e, 'admin.users.reject', user.id)}>
                                                        <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                                                            Reject
                                                        </button>
                                                    </form>
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
                {users.links && users.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-1">
                            {users.links.map((link, index) => (
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
