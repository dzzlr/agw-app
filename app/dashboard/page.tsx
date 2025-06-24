"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { user, token } = useAuth(); // Fetch user and token from AuthContext

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-2 border border-slate-300 rounded-md">
        <div className="flex flex-col">
          <div className="border border-b-slate-300">
            <div className="text-xl font-bold p-4">Dashboard</div>
          </div>
          {user ? (
            <div className="p-4">
              <p className="text-xl font-semibold">Hello, {user.name}!</p>
              <p className="">Username: {user.username}</p>
              <p className="">Role: {user.role}</p>
              <p className="">Division: {user.division}</p>

              {/* Token Section */}
              {token && (
                <div className="mt-4 rounded-lg text-sm break-all">
                  <p className="">Token:</p>
                  <p className="text-green-700">{token}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-500 mt-6">
              No user data found. Please log in.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
