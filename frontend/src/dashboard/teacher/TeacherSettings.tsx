// src/dashboard/teacher/TeacherSettings.tsx
import React from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Settings } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  role: string;
  college?: string;
  college_address?: string;
}

interface TeacherSettingsProps {
  profile: Profile | null;
}

const TeacherSettings: React.FC<TeacherSettingsProps> = ({ profile }) => {
  return (
    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
      <CardContent className="p-8">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
            <Settings className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-805">Teacher Account Settings</h2>
            <p className="text-xs font-semibold text-slate-455">Manage teacher profile affiliation records</p>
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-6 text-left">
          <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <p className="text-sm font-bold text-slate-800">{profile?.name || "N/A"}</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <p className="text-sm font-bold text-slate-800">{profile?.email || "N/A"}</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Institution Affiliation</label>
              <p className="text-sm font-bold text-slate-800">{profile?.college || "N/A"}</p>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-xs text-slate-400 font-semibold mb-3">Interactive profile modifications are administered by institution moderators.</p>
            <p className="text-xs text-indigo-650 font-bold">Contact bcsithub@gmail.com for credential changes.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherSettings;
