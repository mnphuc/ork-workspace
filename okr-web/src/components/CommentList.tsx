"use client";
import React from 'react';
import { formatDateTime } from '@/lib/date-utils';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_by: string;
  created_date: string;
  last_modified_date?: string;
  replies?: Comment[];
}

interface CommentListProps {
  comments: Comment[];
  onEditComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  onReply: (parentId: string, content: string) => void;
  currentUserId?: string;
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

export function CommentList({ 
  comments, 
  onEditComment, 
  onDeleteComment, 
  onReply,
  currentUserId,
  className = "",
  showHeader = true,
  maxHeight = "400px"
}: CommentListProps) {
  const canEdit = (comment: Comment) => {
    return currentUserId && (comment.author_id === currentUserId || comment.created_by === currentUserId);
  };

  const renderComment = (comment: Comment, isReply = false, depth = 0) => {
    const maxDepth = 3; // Limit nesting depth
    const canReply = depth < maxDepth;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-6 mt-3' : 'mb-4'}`}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {comment.created_by.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`${isReply ? 'bg-gray-50' : 'bg-white'} rounded-lg p-3 border border-gray-200`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{comment.created_by}</span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(comment.created_date)}
                  </span>
                  {comment.last_modified_date && comment.last_modified_date !== comment.created_date && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">edited</span>
                  )}
                </div>
                {canEdit(comment) && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditComment(comment.id, comment.content)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </div>

              {canReply && !isReply && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => onReply(comment.id, '')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => renderComment(reply, true, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
        </div>
      )}

      <div 
        className="space-y-4 overflow-y-auto"
        style={{ maxHeight }}
      >
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-sm">No comments yet</p>
            <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
}


