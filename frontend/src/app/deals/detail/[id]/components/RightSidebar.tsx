"use client";

import { Deal, Contact } from '../types';
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
      {/* Deal Header - Simple Title Display */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {deal.title || 'Untitled Deal'}
          </h2>
          <div className="space-y-1">
            {(deal.lead?.company || deal.company?.name) && (
              <p className="text-sm text-gray-600">
                Company: {deal.lead?.company || deal.company?.name}
              </p>
            )}
            {deal.stage && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {deal.stage}
              </span>
            )}
          </div>
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