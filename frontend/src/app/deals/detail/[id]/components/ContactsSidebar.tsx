"use client";

import { Contact } from '../types';
import { Plus, ChevronDown, Mail, Phone, MoreHorizontal, ArrowUpRight, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContactsSidebarProps {
  contacts: Contact[];
  contactsLoading: boolean;
  isContactsExpanded: boolean;
  setIsContactsExpanded: (expanded: boolean) => void;
  getFirstChar: (value: any, fallback?: string) => string;
  handleCreateContact: () => void;
  currentDeal: any;
}

export default function ContactsSidebar({ 
  contacts, 
  contactsLoading, 
  isContactsExpanded, 
  setIsContactsExpanded, 
  getFirstChar, 
  handleCreateContact, 
  currentDeal
}: ContactsSidebarProps) {
  const router = useRouter();

  const handleContactAction = (contactId: number, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/contacts/${contactId}`);
        break;
      case 'edit':
        console.log('Edit contact', contactId);
        break;
      case 'delete':
        console.log('Delete contact', contactId);
        break;
      default:
        console.log('Unknown action', action);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <button
            onClick={() => setIsContactsExpanded(!isContactsExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isContactsExpanded ? '' : '-rotate-90'}`} />
          </button>
          Contacts
          {contacts.length > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {contacts.length}
            </span>
          )}
        </h3>
        <button onClick={handleCreateContact}>
          <Plus className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {isContactsExpanded && (
        <div className="space-y-3">
          {contactsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading contacts...</p>
            </div>
          ) : contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <div key={contact.id} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-700">
                      {getFirstChar(contact.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {contact.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      {index === 0 && currentDeal.contact?.id === contact.id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Primary
                        </span>
                      )}
                      {contact.position && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {contact.position}
                        </span>
                      )}
                    </div>
                    {contact.email && (
                      <p className="text-xs text-gray-500 mt-1">{contact.email}</p>
                    )}
                    {contact.phone && (
                      <p className="text-xs text-gray-500">{contact.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} title="Send Email">
                      <Mail className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} title="Call">
                      <Phone className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        const action = prompt('Choose action: view, edit, delete');
                        if (action) handleContactAction(contact.id, action);
                      }}
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleContactAction(contact.id, 'view')}
                    title="View contact details"
                  >
                    <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 mb-2">No contacts found</p>
              <button 
                onClick={handleCreateContact}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add Contact
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
