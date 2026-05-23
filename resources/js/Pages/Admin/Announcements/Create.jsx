import React from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        type: 'info',
        content: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.announcements.store'));
    };

    return (
        <AppLayout header="Create Announcement">
            <Head title="Create Announcement" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">New Announcement</h2>
                        <p className="text-sm text-gray-500">Fill out the details to post a notice to the dashboard.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="title">Announcement Title</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="e.g., Upcoming Community Meeting, Severe Storm Alert"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="type">Priority / Type</label>
                            <select
                                name="type"
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                required
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="info">🔵 Info (Blue Banner)</option>
                                <option value="warning">🟡 Warning (Yellow Banner)</option>
                                <option value="critical">🔴 Critical (Red Banner)</option>
                            </select>
                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="content">Details / Description</label>
                            <textarea
                                name="content"
                                id="content"
                                rows="5"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                required
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="Provide specifics here..."
                            />
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <Link href={route('admin.announcements.index')} className="text-gray-500 text-sm hover:underline">Cancel</Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-md ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                Publish Announcement
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
