import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "../../lib/apiClient";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  CheckSquare, Square, Trash2, Search, Filter, Mail, Calendar, 
  MessageSquare, User, AlertTriangle, ChevronRight, Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
  resolved: boolean;
  created_at: string;
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, open, resolved
  const [priorityFilter, setPriorityFilter] = useState("all"); // all, low, medium, high, urgent
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/support") as Ticket[];
      setTickets(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolve = async (ticketId: string) => {
    try {
      const updated = await apiClient.patch(`/support/${ticketId}/resolve`, {}) as Ticket;
      setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(updated);
      }
      toast.success(updated.resolved ? "Ticket marked as resolved" : "Ticket re-opened");
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket status");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this support ticket?")) return;
    try {
      await apiClient.delete(`/support/${ticketId}`);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(null);
      }
      toast.success("Ticket deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ticket");
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "high":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "medium":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "resolved" && ticket.resolved) ||
      (statusFilter === "open" && !ticket.resolved);
      
    const matchesPriority = 
      priorityFilter === "all" ||
      ticket.priority.toLowerCase() === priorityFilter.toLowerCase();
      
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-850">Support & Contact Tickets</h2>
          <p className="text-xs font-semibold text-slate-450">Manage user inquiries and technical issues submitted through the support portal</p>
        </div>
        <Button onClick={fetchTickets} size="sm" variant="outline">Refresh Tickets</Button>
      </div>

      {/* Filters & Search Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-semibold"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-bold"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open / Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-bold"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ticket List (Spans 2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-semibold">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-white/50">
              <CardContent className="p-12 text-center">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-extrabold text-slate-700 mb-1">No support tickets found</h3>
                <p className="text-xs font-semibold text-slate-450">Everything is clear or search query does not match.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <motion.div
                  key={ticket.id}
                  layoutId={ticket.id}
                  className={`bg-white border rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                    selectedTicket?.id === ticket.id 
                      ? "border-indigo-500 ring-2 ring-indigo-500/10" 
                      : ticket.resolved 
                      ? "border-slate-100 opacity-70" 
                      : "border-slate-200/60"
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        {ticket.resolved ? (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Resolved
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                            Open
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{ticket.subject}</h4>
                      <p className="text-xs text-slate-450 font-semibold">{ticket.name} · {ticket.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Ticket Preview Details (Spans 1 col) */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-premium lg:sticky lg:top-24 space-y-6"
              >
                <div className="border-b border-slate-50 pb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      selectedTicket.resolved 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-rose-50 text-rose-700 border-rose-100"
                    }`}>
                      {selectedTicket.resolved ? "Resolved" : "Open"}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-850 leading-snug">{selectedTicket.subject}</h3>
                </div>

                <div className="space-y-4">
                  {/* User details */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-2">
                    <div className="flex items-center text-xs font-semibold text-slate-600 gap-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>{selectedTicket.name}</span>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-slate-600 gap-2">
                      <Mail className="w-4 h-4 text-indigo-500" />
                      <a href={`mailto:${selectedTicket.email}`} className="hover:underline text-indigo-600">{selectedTicket.email}</a>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-slate-600 gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Message Details</label>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.message}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                  <Button
                    onClick={() => handleToggleResolve(selectedTicket.id)}
                    variant={selectedTicket.resolved ? "outline" : "default"}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200"
                  >
                    {selectedTicket.resolved ? (
                      <>
                        <Square className="w-4 h-4 text-slate-500" />
                        <span>Re-open</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                        <span>Resolve</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Card className="border border-dashed border-slate-200 shadow-sm rounded-3xl bg-slate-50/30 p-6 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-450 leading-relaxed">
                  Select any ticket from the list to preview details, mark resolve, or initiate administrative replies.
                </p>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
