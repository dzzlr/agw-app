// app/admin-config/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { FaEnvelope, FaUserCog } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminConfigDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const handleEmailConfigClick = () => {
    router.push('/admin-config/email-config');
  };

  const handleRoleManagementClick = () => {
    router.push('/admin-config/role-management');
  };

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-2 border border-slate-300 rounded-md">
        <div className="flex flex-col">
          <div className="border border-b-slate-300">
            <div className="text-xl font-bold p-4">Admin Configuration</div>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {user ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email Configuration Card */}
                  <div 
                    className="border border-slate-300 rounded-md p-4 hover:bg-slate-100 transition cursor-pointer flex items-center gap-4"
                    onClick={handleEmailConfigClick}
                  >
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaEnvelope className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Email Configuration</h3>
                      <p className="text-slate-600">Manage email templates and notification settings</p>
                    </div>
                  </div>

                  {/* Role Management Card */}
                  <div 
                    className="border border-slate-300 rounded-md p-4 hover:bg-slate-100 transition cursor-pointer flex items-center gap-4"
                    onClick={handleRoleManagementClick}
                  >
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaUserCog className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Role Management</h3>
                      <p className="text-slate-600">Manage user roles and permissions</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-500">
                    Note: These settings are only accessible to users with appropriate permissions.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-8 rounded-lg shadow-lg">
                <p className="text-red-500">No user data found. Please log in.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
