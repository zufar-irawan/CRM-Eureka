"use client";

import { Deal, Comment } from '../types';
import ActivityTab from './ActivityTab';
import EmailsTab from './EmailsTab';
import CommentsTab from './CommentsTab';
import DataTab from './DataTab';

interface TabContentProps {
  activeTab: string;
  deal: Deal;
  comments: Comment[];
  commentsLoading: boolean;
  displayValue: (value: any, fallback?: string) => string;
  formatTimeAgo: (dateString: string | null | undefined) => string;
  formatCurrency: (value: any) => string;
  formatPercentage: (value: any) => string;
  formatDate: (dateString: string | null | undefined) => string;
  getFirstChar: (value: any, fallback?: string) => string;
  addComment: (text: string) => Promise<void>;
}

export default function TabContent({
  activeTab,
  deal,
  comments,
  commentsLoading,
  displayValue,
  formatTimeAgo,
  formatCurrency,
  formatPercentage,
  formatDate,
  getFirstChar,
  addComment
}: TabContentProps) {
  switch (activeTab) {
    case "Activity":
      return (
        <ActivityTab
          deal={deal}
          displayValue={displayValue}
          formatTimeAgo={formatTimeAgo}
          formatCurrency={formatCurrency}
        />
      );

    case "Emails":
      return (
        <EmailsTab
          deal={deal}
          displayValue={displayValue}
        />
      );

    case "Comments":
      return (
        <CommentsTab
          deal={deal}
          comments={comments}
          commentsLoading={commentsLoading}
          displayValue={displayValue}
          formatTimeAgo={formatTimeAgo}
          getFirstChar={getFirstChar}
          addComment={addComment}
        />
      );

    case "Data":
      return (
        <DataTab
          deal={deal}
          displayValue={displayValue}
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
          formatDate={formatDate}
        />
      );

    default:
      return (
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">
            {activeTab} content for {displayValue(deal.title, 'this deal')}
          </h3>
        </div>
      );
  }
}