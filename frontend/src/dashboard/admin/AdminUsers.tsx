// src/dashboard/admin/AdminUsers.tsx
import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Users, Search, Filter, Trash2, ShieldAlert, Check } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { toast } from "sonner";

interface User {
  objectId: string;
  email: string;
  name?: string;
  role: string;
  created: string;
}

interface AdminUsersProps {
  users: User[];
  totalUserCount: number;
  loading: boolean;
  onUserUpdate: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  totalUserCount,
  loading,
  onUserUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      u.email.toLowerCase().includes(term) ||
      (u.name && u.name.toLowerCase().includes(term));

    const matchesRole = 
      roleFilter === "all" || 
      (roleFilter === "admin" && u.role === "admin") ||
      (roleFilter === "teacher" && u.role === "teacher") ||
      (roleFilter === "student" && (u.role === "student" || !u.role || u.role === ""));

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      await apiClient.patch(`/auth/users/${userId}/role`, { role: newRole });
      toast.success("User access role updated successfully!");
      onUserUpdate();
    } catch (err: any) {
      console.error("Failed to update role:", err);
      toast.error(err.message || "Failed to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const confirmDelete = window.confirm(
      `Warning: Are you sure you want to permanently delete user account ${userEmail}? This action is irreversible.`
    );
    if (!confirmDelete) return;

    setUpdatingUserId(userId);
    try {
      await apiClient.delete(`/auth/users/${userId}`);
      toast.success("User account deleted successfully!");
      onUserUpdate();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      toast.error(err.message || "Failed to delete user account");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1 text-left">
      <CardContent className="p-6 sm:p-8">
        
        {/* Header and filters deck */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
              <Users className="w-5.5 h-5.5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Active User Database</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Audit student profiles & college scopes</p>
            </div>
          </div>

          {/* Interactive filter & search block */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Role Filter Selector */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400 mr-1.5 ml-1" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none border-0 cursor-pointer pr-4"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            {/* Count Badge */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs font-bold text-indigo-700 text-center">
              <span>{totalUserCount} total profiles</span>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">User Profile</th>
                <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Email Address</th>
                <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Access Role (Full Access)</th>
                <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Joined Date</th>
                <th className="p-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-slate-50 animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        <div className="h-3 bg-slate-200 rounded w-20" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-3 bg-slate-200 rounded w-32" />
                    </td>
                    <td className="p-4">
                      <div className="h-5 bg-slate-200 rounded-full w-14" />
                    </td>
                    <td className="p-4">
                      <div className="h-3 bg-slate-200 rounded w-16" />
                    </td>
                    <td className="p-4">
                      <div className="h-5 bg-slate-200 rounded-full w-20" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.map((u) => (
                <tr key={u.objectId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-inner">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[120px]">{u.name || "User"}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-600 break-all">{u.email}</td>
                  
                  {/* Access Role Badge (Read-only) */}
                  <td className="p-4">
                    <span className={`px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider select-none ${
                      u.role === "admin" 
                        ? "bg-rose-50 border-rose-200 text-rose-700" 
                        : u.role === "teacher"
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : "bg-indigo-50 border-indigo-200 text-indigo-700"
                    }`}>
                      {u.role || "student"}
                    </span>
                  </td>
                  
                  <td className="p-4 font-semibold text-slate-500">{new Date(u.created).toLocaleDateString()}</td>
                  
                  {/* Action delete buttons */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDeleteUser(u.objectId, u.email)}
                      disabled={updatingUserId === u.objectId}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-0 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
                      title="Delete User Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    No user accounts match selection filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </CardContent>
    </Card>
  );
};
