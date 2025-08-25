"use client";

import { Deal, Comment } from '../types';
import CommentsTab from './CommentsTab';

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
