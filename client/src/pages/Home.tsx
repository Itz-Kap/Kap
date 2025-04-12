import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatSection } from "@/components/ChatSection";
import { GamesSection } from "@/components/GamesSection";
import { VideoSection } from "@/components/VideoSection";
import { MobileNavigation } from "@/components/MobileNavigation";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar />
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileNavigation />
          
          {/* Content Sections */}
          <div className="flex-1 overflow-hidden">
            <ChatSection />
            <GamesSection />
            <VideoSection />
          </div>
        </div>
      </main>
    </div>
  );
}
