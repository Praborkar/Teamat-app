import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChannelPage from "../pages/ChannelPage";
import ChannelInfoPage from "../pages/ChannelInfoPage";
import AddMemberPage from "../pages/AddMemberPage";
import ProfilePage from "../pages/ProfilePage";
import OnlineUsersPanel from "../components/OnlineUsersPanel";
import logo from "../assets/logo.png";
// REMOVED BACKGROUND IMAGE IMPORT
import { FiX } from "react-icons/fi";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen w-screen bg-[var(--bg-secondary)] flex items-center justify-center font-space">
      {/* Main Container */}
      <div
        className="
          h-full w-full
          overflow-hidden
          flex
          bg-white
          relative
        "
      >
          {/* MOBILE SIDEBAR OVERLAY */}
          {isSidebarOpen && (
            <div
              className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* SIDEBAR (Desktop: static, Mobile: drawer) */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50
              w-[280px] sm:w-[320px] lg:w-72
              bg-[var(--bg-secondary)]
              border-r border-[var(--border-primary)]
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
              overflow-hidden flex flex-col
            `}
          >
            <Sidebar onSelect={() => setIsSidebarOpen(false)} />
          </aside>

          {/* MAIN CHAT AREA */}
          <main
            className="
              flex-1
              bg-[var(--bg-primary)] lg:bg-[var(--bg-primary)]/90
              backdrop-blur-md
              overflow-hidden
              flex flex-col
              w-full h-full
            "
          >
            <Routes>
              <Route 
                path="channels/:channelId" 
                element={<ChannelPage onMenuToggle={toggleSidebar} />} 
              />
              <Route 
                path="channels/:channelId/info" 
                element={<ChannelInfoPage />} 
              />
              <Route 
                path="channels/:channelId/add-member" 
                element={<AddMemberPage />} 
              />
              <Route 
                path="profile" 
                element={<ProfilePage />} 
              />
              <Route
                path="/"
                element={
                  <div className="flex-1 flex flex-col">
                    {/* Header for mobile when no channel is selected */}
                    <div className="lg:hidden h-14 bg-white border-b border-[var(--border-primary)] flex items-center px-4">
                      <button onClick={toggleSidebar} className="text-[var(--text-secondary)] p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                      </button>
                      <img 
                        src={logo} 
                        alt="Teamat" 
                        className="h-7 w-auto ml-2 object-contain" 
                      />
                    </div>
                    <div className="m-auto text-[var(--text-secondary)] text-center px-6">
                      <div className="mb-4">
                         <div className="w-20 h-20 bg-[#5865f2]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#5865f2]/20">
                            <svg className="w-10 h-10 text-[#5865f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                         </div>
                         <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tighter">Welcome to Teamat</h2>
                         <p className="max-w-xs mx-auto text-[var(--text-muted)] leading-relaxed">Select a channel from the sidebar to start chatting with your teammates effortlessly!</p>
                      </div>
                      <button 
                        onClick={toggleSidebar}
                        className="lg:hidden bg-[#5865f2] text-white px-6 py-2 rounded-full font-medium"
                      >
                        Browse Channels
                      </button>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* RIGHT PANEL (Online Users) - Hidden on mobile/tablet */}
          <aside
            className="
              hidden xl:flex
              w-72
              bg-[var(--bg-secondary)]
              border-l border-[var(--border-primary)]
              overflow-y-auto
              flex-col
            "
          >
            <OnlineUsersPanel />
          </aside>

        </div>
      </div>
    );
}
