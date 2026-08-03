// src/dashboard/student/StudentHistoryLog.tsx
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  Activity, FileText, CheckCircle, Clock, UserPlus, 
  Award, ShieldAlert, Calendar, Filter, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface Paper {
  objectId: string;
  title: string;
  uploadedAt: string;
  approved: boolean;
}

interface StudentHistoryLogProps {
  papers: Paper[];
  papersLoading: boolean;
}

interface TimelineEvent {
  id: string;
  title: string;
  desc: string;
  timestamp: string;
  type: "upload" | "approval" | "system" | "milestone";
  status?: string;
}

const StudentHistoryLog: React.FC<StudentHistoryLogProps> = ({ papers, papersLoading }) => {
  const [filterType, setFilterType] = useState<"all" | "upload" | "milestone">("all");

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // 1. Add upload events
    papers.forEach(paper => {
      events.push({
        id: `upload-${paper.objectId}`,
        title: "Paper Contributed",
        desc: `You uploaded the past paper "${paper.title}" for review.`,
        timestamp: paper.uploadedAt,
        type: "upload",
        status: paper.approved ? "Approved" : "Pending"
      });

      // 2. Add approval event if approved
      if (paper.approved) {
        // Mock approval time slightly after upload
        const uploadDate = new Date(paper.uploadedAt);
        const approvalDate = new Date(uploadDate.getTime() + 24 * 60 * 60 * 1000); // 1 day later
        events.push({
          id: `approve-${paper.objectId}`,
          title: "Submission Approved",
          desc: `Moderators approved your past paper submission: "${paper.title}".`,
          timestamp: approvalDate.toISOString(),
          type: "approval",
          status: "Completed"
        });
      }
    });

    // 3. Add default system/milestone milestones
    // Sort papers to find oldest contribution or fallback
    const oldestDate = papers.length > 0 
      ? new Date(papers[papers.length - 1].uploadedAt)
      : new Date();
    
    const registrationDate = new Date(oldestDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week before oldest upload
    
    events.push({
      id: "milestone-rank",
      title: "First Contribution Milestone 🌱",
      desc: "Earned your 'Novice' contributor badge after registering your first file upload.",
      timestamp: oldestDate.toISOString(),
      type: "milestone"
    });

    events.push({
      id: "milestone-join",
      title: "Account Created successfully",
      desc: "Successfully registered on the BCSITHub Student Portal and set up your student profile credentials.",
      timestamp: registrationDate.toISOString(),
      type: "milestone"
    });

    // Sort all events chronologically (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return events;
  }, [papers]);

  const filteredEvents = useMemo(() => {
    if (filterType === "all") return timelineEvents;
    return timelineEvents.filter(e => {
      if (filterType === "upload") return e.type === "upload" || e.type === "approval";
      return e.type === "milestone";
    });
  }, [timelineEvents, filterType]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "upload":
        return { icon: FileText, color: "text-indigo-500 bg-indigo-50 border-indigo-100" };
      case "approval":
        return { icon: CheckCircle, color: "text-emerald-500 bg-emerald-50 border-emerald-100" };
      case "milestone":
        return { icon: Award, color: "text-amber-500 bg-amber-50 border-amber-100" };
      default:
        return { icon: UserPlus, color: "text-slate-500 bg-slate-50 border-slate-100" };
    }
  };

  return (
    <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1 text-left">
      <CardContent className="p-6 sm:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/50 rounded-xl flex items-center justify-center text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Student Activity logs</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Chronological feed of your contributions</p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/30 self-start sm:self-center">
            {(["all", "upload", "milestone"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-0 cursor-pointer ${
                  filterType === type
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {type === "upload" ? "Contributions" : type === "milestone" ? "Milestones" : "All activity"}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Flow */}
        <div className="relative pl-6 sm:pl-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 space-y-6">
          {papersLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white animate-pulse relative">
                <div className="absolute -left-7 top-6 w-3 h-3 bg-slate-200 rounded-full border-2 border-white" />
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-150 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const iconConfig = getEventIcon(event.type);
              const EventIcon = iconConfig.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-2xl border border-slate-100/80 bg-slate-50/20 hover:bg-slate-50 hover:border-indigo-500/10 transition-all duration-200 group"
                >
                  {/* Timeline bullet pin */}
                  <div className="absolute -left-9 sm:-left-[39px] top-6 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-500 transition-colors z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-indigo-500 transition-colors" />
                  </div>

                  {/* Visual Event Icon wrapper */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${iconConfig.color}`}>
                    <EventIcon className="w-4.5 h-4.5" />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        {event.title}
                        {event.status && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            event.status === "Approved" || event.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                              : "bg-amber-50 text-amber-600 border border-amber-100/50"
                          }`}>
                            {event.status}
                          </span>
                        )}
                      </h4>
                      
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
                      {event.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-200/60 rounded-2xl bg-slate-50/20 pl-0 relative">
              {/* Timeline bullet pin */}
              <div className="absolute -left-9 sm:-left-[39px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>
              
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-100">
                <Activity className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-black text-slate-800">No events detected</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Activities matching filter will show here</p>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default StudentHistoryLog;
