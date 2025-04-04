'use client';


import Header from "@/components/Header";
import { getAuthToken } from "@/lib/helper-function";
import { notFound } from "next/navigation";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
const token = getAuthToken();

if(!token){
    return notFound();
}
    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col relative overflow-hidden">
           <div className="fixed top-0 left-0 right-0 z-20">
              <Header />
           </div>
           
           <div className="flex-1 w-full pt-24 pb-20">
                {children}
           </div>
        
           <footer className="fixed bottom-0 left-0 right-0 z-10">
              <div className="max-w-7xl mx-auto px-4">
                <div className="backdrop-blur-sm bg-white/70 dark:bg-black/70 rounded-t-xl shadow-sm border border-gray-200 dark:border-gray-800 border-b-0">
                  <div className="flex flex-col md:flex-row justify-between items-center p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-0">
                      © {new Date().getFullYear()} Ohh.tc. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                      <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
                        Privacy Policy
                      </a>
                      <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
                        Terms of Service
                      </a>
                      <a href="#" className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
                        Contact
                      </a>
                    </div>
                  </div>
                </div>
              </div>
           </footer>
        </div>
    );
}

