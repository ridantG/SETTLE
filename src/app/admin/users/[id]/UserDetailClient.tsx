// File: app/admin/users/[id]/UserDetailClient.tsx
// FINAL, DEFINITIVE, AND TYPE-SAFE VERSION

"use client";

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { type Profile } from '@/lib/schemas'; // <-- THE FIX: Import the single source of truth

export default function UserDetailClient({ profile: initialProfile }: { profile: Profile }) {
    const router = useRouter();
    // This local state is now also strongly typed
    const [profile, setProfile] = useState(initialProfile);
    const [isSaving, setIsSaving] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);

    const handleResetFlags = async () => {
        setIsSaving(true);
        const toastId = toast.loading("Resetting flags...");
        const response = await fetch(`/api/admin/users/${profile.id}`, { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ action: 'reset_flags' }) 
        });
        toast.dismiss(toastId);
        if (response.ok) {
            toast.success("Flags reset to 0.");
            setProfile({ ...profile, flags: 0 }); 
        } else {
            toast.error("Failed to reset flags.");
        }
        setIsSaving(false);
    };

    const handleSuspend = async (suspend: boolean) => {
        setIsSaving(true);
        const toastId = toast.loading(suspend ? "Suspending user..." : "Lifting suspension...");
        const response = await fetch(`/api/admin/users/${profile.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'suspend', value: suspend })
        });
        toast.dismiss(toastId);
        if (response.ok) {
            toast.success(suspend ? "User has been suspended." : "User suspension lifted.");
            setProfile({ ...profile, is_suspended: suspend });
        } else {
            toast.error("Failed to update suspension status.");
        }
        setIsSaving(false);
    };

    const handleBanUser = async () => {
        setShowBanModal(false);
        setIsSaving(true);
        const toastId = toast.loading(`Banning user ${profile.name}...`);
        const response = await fetch(`/api/admin/users/${profile.id}`, { method: 'DELETE' });
        toast.dismiss(toastId);
        if (response.ok) {
            toast.success("User has been permanently banned and deleted.");
            router.push('/admin/reports');
        } else {
            const data = await response.json();
            toast.error(data.error || "Failed to ban user.");
        }
        setIsSaving(false);
    };

    return (
        <>
            <Toaster position="top-center" />
            
            {showBanModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
                        <h2 className="text-2xl font-bold text-red-600">Ban User?</h2>
                        <p className="text-gray-600 mt-4">Are you sure you want to permanently ban and delete <span className="font-bold">{profile.name}</span>? This action is irreversible.</p>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setShowBanModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Cancel</button>
                            <button onClick={handleBanUser} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg">Yes, Ban User</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{profile.name || 'Unnamed User'}</h2>
                        <p className="text-gray-500">{profile.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${profile.is_suspended ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>{profile.is_suspended ? 'Suspended' : 'Active'}</span>
                            {/* THE FIX IS HERE: We use '?? 0' as a fallback, which satisfies TypeScript. */}
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${(profile.flags ?? 0) > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>Reports: {profile.flags ?? 0}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                        <button onClick={handleResetFlags} disabled={isSaving} className="flex-1 sm:grow-0 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg text-sm disabled:opacity-50">Reset Flags</button>
                        {profile.is_suspended ? (
                            <button onClick={() => handleSuspend(false)} disabled={isSaving} className="flex-1 sm:grow-0 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg text-sm disabled:opacity-50">Un-Suspend</button>
                        ) : (
                            <button onClick={() => handleSuspend(true)} disabled={isSaving} className="flex-1 sm:grow-0 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50">Suspend</button>
                        )}
                        <button onClick={() => setShowBanModal(true)} disabled={isSaving} className="flex-1 sm:grow-0 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50">Ban User</button>
                    </div>
                </div>
                
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Profile Details</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <p><strong className="block text-gray-500">Role:</strong> {profile.role || 'N/A'}</p>
                        <p><strong className="block text-gray-500">City:</strong> {profile.city || 'N/A'}</p>
                        <p><strong className="block text-gray-500">Age:</strong> {profile.age || 'N/A'}</p>
                        <p><strong className="block text-gray-500">Gender:</strong> {profile.gender || 'N/A'}</p>
                        <p><strong className="block text-gray-500">Status:</strong> {profile.status || 'N/A'}</p>
                        <p><strong className="block text-gray-500">Organization:</strong> {profile.organization || 'N/A'}</p>
                    </div>
                </div>

                {profile.description && (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">User Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{profile.description}</p>
                    </div>
                )}
            </div>
        </>
    );
}