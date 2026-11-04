import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Comment, ProjectMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { CommentApiService } from '../services/api';
import { MessageSquare, Send, Trash2, AtSign, Loader2 } from 'lucide-react';

interface CommentSectionProps {
  taskId?: number;
  subtaskId?: number | string;
  members?: ProjectMember[];
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function parseMentions(content: string, members: ProjectMember[]): number[] {
  const mentioned: number[] = [];
  const regex = /@(\S+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const username = match[1].toLowerCase();
    const member = members.find(
      (m) => (m.userName || '').toLowerCase().replace(/\s+/g, '') === username.replace(/\s+/g, '')
    );
    if (member) mentioned.push(member.userId);
  }
  return [...new Set(mentioned)];
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  taskId,
  subtaskId,
  members = [],
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // @mention dropdown state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const filteredMembers = mentionOpen
    ? members.filter((m) =>
        (m.userName || '').toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : [];

  // Load comments
  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      let list: Comment[] = [];
      if (subtaskId) {
        list = await CommentApiService.getCommentsBySubtaskId(subtaskId);
      } else if (taskId) {
        list = await CommentApiService.getCommentsByTaskId(taskId);
      }
      setComments(list);
    } catch (err) {
      console.warn('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId, subtaskId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Auto scroll to bottom on new comments
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Detect @ trigger
    const cursorPos = e.target.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionOpen(true);
      setMentionIndex(0);
    } else {
      setMentionOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, filteredMembers.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setMentionOpen(false);
        return;
      }
    }
    // Submit on Ctrl+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertMention = (member: ProjectMember) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursorPos = textarea.selectionStart ?? inputValue.length;
    const textBefore = inputValue.slice(0, cursorPos);
    const textAfter = inputValue.slice(cursorPos);
    const newBefore = textBefore.replace(/@(\w*)$/, `@${(member.userName || '').replace(/\s+/g, '')} `);
    setInputValue(newBefore + textAfter);
    setMentionOpen(false);
    setTimeout(() => {
      textarea.focus();
      const newPos = newBefore.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!user || !inputValue.trim()) return;
    const content = inputValue.trim();
    const mentionedUserIds = parseMentions(content, members);

    // Optimistic update
    const tempComment: Comment = {
      id: Date.now(),
      taskId: taskId,
      subtaskId: typeof subtaskId === 'number' ? subtaskId : undefined,
      userId: user.id,
      userName: user.name || user.email,
      content,
      mentionedUserIds,
      createdAt: new Date().toISOString(),
      isSelf: true,
    };
    setComments((prev) => [...prev, tempComment]);
    setInputValue('');
    setSubmitting(true);

    try {
      const payload: any = {
        userId: user.id,
        content,
        mentionedUserIds,
      };
      if (subtaskId) {
        payload.subtaskId = Number(subtaskId);
      } else if (taskId) {
        payload.taskId = taskId;
      }
      const created = await CommentApiService.createComment(payload);
      // Replace temp with real
      setComments((prev) =>
        prev.map((c) =>
          c.id === tempComment.id
            ? CommentApiService.normalizeComment(created, { ...tempComment, isSelf: true })
            : c
        )
      );
    } catch (err) {
      console.warn('Failed to post comment:', err);
      // Rollback
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setInputValue(content);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    setDeletingId(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await CommentApiService.deleteComment(commentId);
    } catch (err) {
      console.warn('Failed to delete comment:', err);
      loadComments();
    } finally {
      setDeletingId(null);
    }
  };

  const renderContent = (content: string | undefined) => {
    // Highlight @mentions in the comment text
    const parts = (content || '').split(/(@\S+)/g);
    return parts.map((part, i) =>
      part.startsWith('@') ? (
        <span key={i} className="text-emerald-600 font-semibold">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <MessageSquare size={16} className="text-emerald-600" />
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Comments
        </h3>
        {!loading && (
          <span className="text-xs text-gray-500 font-semibold ml-1">({comments.length})</span>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-xs">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isSelf = comment.isSelf || comment.userId === user?.id;
            return (
              <div key={comment.id} className="flex gap-2.5 group animate-in fade-in">
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isSelf ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {getInitials(comment.userName)}
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-gray-800">{comment.userName}</span>
                    <span className="text-[10px] text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                    {/* Delete button (only for own comments or no userId comparison) */}
                    {isSelf && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      isSelf
                        ? 'bg-emerald-50 border border-emerald-100 text-gray-800'
                        : 'bg-gray-50 border border-gray-100 text-gray-800'
                    }`}
                  >
                    {renderContent(comment.content)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={listEndRef} />
      </div>

      {/* Input Area */}
      {user ? (
        <div className="relative">
          {/* @Mention Dropdown */}
          {mentionOpen && filteredMembers.length > 0 && (
            <div className="absolute bottom-full mb-1 left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-500">
                <AtSign size={11} />
                <span>Mention a member</span>
              </div>
              {filteredMembers.slice(0, 8).map((m, idx) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => insertMention(m)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs hover:bg-emerald-50 transition-colors cursor-pointer ${
                    idx === mentionIndex ? 'bg-emerald-50 text-emerald-800' : 'text-gray-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[9px] font-bold shrink-0">
                    {getInitials(m.userName || 'U')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{m.userName}</div>
                    {m.roleName && (
                      <div className="text-[10px] text-gray-400 truncate">{m.roleName}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            {/* Self Avatar */}
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-0.5">
              {getInitials(user.name || user.email || 'U')}
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Write a comment… type @ to mention someone (Ctrl+Enter to send)"
                rows={2}
                className="w-full resize-none px-3 py-2 pr-10 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-gray-400 leading-relaxed transition-all"
                style={{ minHeight: '60px' }}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!inputValue.trim() || submitting}
                className="absolute right-2 bottom-2 p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Send (Ctrl+Enter)"
              >
                {submitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
              </button>
            </div>
          </div>
          <div className="mt-1 ml-9 text-[10px] text-gray-400">
            Use <kbd className="bg-gray-100 px-1 rounded text-[9px]">@</kbd> to mention project members • <kbd className="bg-gray-100 px-1 rounded text-[9px]">Ctrl+Enter</kbd> to send
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400 italic text-center py-2">
          Log in to add comments.
        </div>
      )}
    </div>
  );
};
