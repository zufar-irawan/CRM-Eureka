"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MainContentDeals from './Layouts/MainContentDeals';
import { usePathname } from 'next/navigation';

export default function DealsPage() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      
      <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'} flex flex-col`}>
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setIsModalOpen={setIsModalOpen}
          pathname={pathname}
        />

        {/* Main content - Table view */}
        <div className="flex-1 overflow-auto">
          <MainContentDeals />
        </div>
      </div>
    </div>
  );
}