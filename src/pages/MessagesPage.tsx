import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import {
  Search, Filter, MoreVertical, Send, UserCircle,
  SearchIcon, Phone, Video, Edit, Link, Paperclip,
  Smile, Verified, Bold, Italic, Check, Clock
} from "lucide-react";
import { leads } from "@/data/mockData";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0].id);
  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-10rem)] bg-surface-container-lowest rounded-3xl border border-outline-variant/5 shadow-sm overflow-hidden">
        {/* Contacts List */}
        <aside className="w-80 border-r border-outline-variant/5 flex flex-col bg-surface-container-low/20">
          <div className="p-6 border-b border-outline-variant/5">
            <h3 className="text-xl font-bold font-headline mb-4">Messages</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="w-full bg-white border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400/50 transition-all outline-none shadow-sm" placeholder="Search chats..." type="text" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedLeadId === lead.id ? 'bg-white shadow-sm border border-outline-variant/10 translate-x-1' : 'hover:bg-surface-container-low'}`}
              >
                <div className="relative">
                   <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                     {lead.name.charAt(0)}
                   </div>
                   <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-bold truncate text-on-surface">{lead.name}</p>
                    <span className="text-[10px] text-outline font-bold">12:45</span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">I've seen the latest proposal...</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 flex flex-col">
          <header className="px-6 py-4 border-b border-outline-variant/5 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {selectedLead.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-on-surface">{selectedLead.name}</p>
                  <Verified className="w-3.5 h-3.5 text-primary fill-primary/10" />
                </div>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-surface-container-high rounded-xl transition-colors text-slate-500"><Phone className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-surface-container-high rounded-xl transition-colors text-slate-500"><Video className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-surface-container-high rounded-xl transition-colors text-slate-500"><SearchIcon className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-surface-container-high rounded-xl transition-colors text-slate-500"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
             <div className="flex justify-center">
               <span className="text-[10px] font-bold text-outline uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full shadow-sm border border-outline-variant/5">Yesterday</span>
             </div>

             <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 text-xs">
                  {selectedLead.name.charAt(0)}
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/5">
                  <p className="text-sm text-on-surface-variant leading-relaxed">Hi Julian! I've been reviewing the Enterprise Hub integration you sent over. The feature set looks incredible, especially the AI predictions.</p>
                  <p className="text-[10px] text-outline mt-2 font-bold uppercase tracking-tighter">10:24 AM</p>
                </div>
             </div>

             <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-lg signature-gradient flex items-center justify-center text-white shrink-0 text-xs font-bold">ME</div>
                <div className="signature-gradient text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                  <p className="text-sm leading-relaxed">Thanks {selectedLead.name.split(' ')[0]}! We really focused on making the insights actionable. Have you had a chance to look at the pricing model?</p>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-[10px] opacity-70 font-bold uppercase tracking-tighter">10:28 AM</span>
                    <Check className="w-3 h-3" />
                  </div>
                </div>
             </div>

             <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 text-xs">
                  {selectedLead.name.charAt(0)}
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/5">
                  <p className="text-sm text-on-surface-variant leading-relaxed">Yes, it looks solid. I have a quick question about the data residency for our EU customers. Could we hop on a brief call?</p>
                  <p className="text-[10px] text-outline mt-2 font-bold uppercase tracking-tighter">10:30 AM</p>
                </div>
             </div>
          </div>

          <footer className="p-6 bg-white border-t border-outline-variant/5">
            <div className="bg-surface-container-low/50 rounded-2xl p-2 border border-outline-variant/10">
              <div className="flex items-center gap-1 px-2 mb-2 border-b border-outline-variant/5 pb-2">
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400"><Bold className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400"><Italic className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400"><Link className="w-3.5 h-3.5" /></button>
                <div className="w-[1px] h-4 bg-outline-variant/20 mx-1"></div>
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400"><Paperclip className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400"><Smile className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex items-end gap-3 px-2">
                <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none no-scrollbar h-10"
                  placeholder="Type your message..."
                />
                <button className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </footer>
        </main>

        {/* Lead Context Panel */}
        <aside className="w-72 border-l border-outline-variant/5 hidden lg:flex flex-col p-6 bg-surface-container-low/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl mx-auto mb-4 border-2 border-white shadow-sm">
              {selectedLead.name.charAt(0)}
            </div>
            <h4 className="font-extrabold text-on-surface">{selectedLead.name}</h4>
            <p className="text-xs text-on-surface-variant mb-4">{selectedLead.business}</p>
            <ScoreBadge score={selectedLead.score} />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">Recent Activity</p>
              <div className="space-y-4">
                <div className="flex gap-2">
                   <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div></div>
                   <p className="text-xs text-on-surface-variant leading-relaxed">Viewed <strong>Enterprise Proposal</strong> 3 times in last 24h</p>
                </div>
                <div className="flex gap-2">
                   <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div></div>
                   <p className="text-xs text-on-surface-variant leading-relaxed">Clicked link in <strong>Feature Update</strong> email</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">Lead Insights</p>
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <p className="text-xs text-primary font-bold leading-relaxed">AI Prediction: 82% likely to close this month if discount is offered before Friday.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
             <button className="w-full py-2.5 text-xs font-bold bg-white border border-outline-variant/10 rounded-xl hover:bg-surface-container-low transition-colors shadow-sm">View Full Profile</button>
             <button className="w-full py-2.5 text-xs font-bold text-white signature-gradient rounded-xl shadow-lg shadow-indigo-500/10">Create Proposal</button>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
