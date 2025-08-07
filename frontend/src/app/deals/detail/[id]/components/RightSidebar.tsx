"use client";

import { Deal, Contact } from '../types';
import { Mail, Link2, Paperclip } from 'lucide-react';
import ContactsSidebar from './ContactsSidebar';
import OrganizationDetails from './OrganizationDetails';

interface RightSidebarProps {
  deal: Deal;
  contacts: Contact[];
  contactsLoading: boolean;
  isContactsExpanded: boolean;
  setIsContactsExpanded: (expanded: boolean) => void;
  isOrgDetailsExpanded: boolean;
  setIsOrgDetailsExpanded: (expanded: boolean) => void;
  getFirstChar: (value: any, fallback?: string) => string;
  displayValue: (value: any, fallback?: string) => string;
  formatCurrency: (value: any) => string;
  formatDate: (dateString: string | null | undefined) => string;
  handleCreateContact: () => void;
}

export default function RightSidebar({
  deal,
  contacts,
  contactsLoading,
  isContactsExpanded,
  setIsContactsExpanded,
  isOrgDetailsExpanded,
  setIsOrgDetailsExpanded,
  getFirstChar,
  displayValue,
  formatCurrency,
  formatDate,
  handleCreateContact
}: RightSidebarProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">
            {getFirstChar(deal.title) || 
             getFirstChar(deal.lead?.company) || 
             getFirstChar(deal.company?.name) || 'D'}
          </span>
        </div>
        <div className="flex space-x-2">
          {(deal.lead?.email || deal.contact?.email || deal.company?.email) && (
            <a href={`mailto:${deal.lead?.email || deal.contact?.email || deal.company?.email}`}>
              <Mail className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </a>
          )}
          {(deal.lead?.company || deal.company?.name) && (
            <a 
              href={`https://${(deal.lead?.company || deal.company?.name)?.toLowerCase().replace(/\s+/g, '')}.com`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link2 className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </a>
          )}
          <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </div>
      </div>

      <ContactsSidebar
        contacts={contacts}
        contactsLoading={contactsLoading}
        isContactsExpanded={isContactsExpanded}
        setIsContactsExpanded={setIsContactsExpanded}
        getFirstChar={getFirstChar}
        handleCreateContact={handleCreateContact}
        currentDeal={deal}
      />

      <OrganizationDetails
        deal={deal}
        isOrgDetailsExpanded={isOrgDetailsExpanded}
        setIsOrgDetailsExpanded={setIsOrgDetailsExpanded}
        displayValue={displayValue}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
}
