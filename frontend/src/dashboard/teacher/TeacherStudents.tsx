// src/dashboard/teacher/TeacherStudents.tsx
import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Users, Search } from "lucide-react";

interface Student {
  objectId: string;
  email: string;
  name?: string;
  semester?: string;
  college?: string;
  created: string;
}

interface TeacherStudentsProps {
  students: Student[];
  loading: boolean;
}

const TeacherStudents: React.FC<TeacherStudentsProps> = ({ students, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(term)) ||
      student.email.toLowerCase().includes(term) ||
      (student.college && student.college.toLowerCase().includes(term))
    );
  });

  return (
    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
      <CardContent className="p-6 sm:p-8">
        
        {/* Title and search header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-805">Syllabus Registered Students</h2>
              <p className="text-xs font-semibold text-slate-455">Overview of active student community profiles</p>
            </div>
          </div>

          {/* Interactive search filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-60 focus:bg-white transition-all shadow-inner"
            />
          </div>

        </div>

        {/* Students grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse flex items-center gap-3.5">
                <div className="w-11 h-11 bg-slate-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-150 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((student) => (
              <div key={student.objectId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-slate-200 transition-all flex items-center gap-3.5">
                <div className="w-11 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0">
                  {(student.name || student.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-sm truncate">{student.name || "Student Contributor"}</p>
                  <p className="text-xs text-slate-500 truncate font-semibold">{student.email}</p>
                  {student.semester && (
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mt-0.5">Semester {student.semester}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-wider">
            No student profiles match filter
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default TeacherStudents;
