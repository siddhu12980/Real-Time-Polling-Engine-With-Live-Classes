import React, { useState, useRef, useEffect } from 'react';
import { Send, Edit2, Check } from 'lucide-react';
import { useChat } from '@livekit/components-react';

const VideoChat = () => {
  const { send, update, chatMessages } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      send(newMessage);
      setNewMessage('');
    }
  };

  const handleEdit = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  };

  const handleUpdate = (messageId: string) => {
    if (editContent.trim()) {
      update(editContent, messageId);
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'new' | 'edit', messageId?: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'new') {
        handleSend();
      } else if (messageId) {
        handleUpdate(messageId);
      }
    }
  };

  return (
    <div className="flex flex-col  h-full w-full border border-slate-900  bg-slate-800 shadow-md    no-scrollbar">
      <div className="flex-1   p-4 space-y-4 no-scrollbar overflow-y-scroll">
        {chatMessages.map((message) => (

          < div
            key={message.id}
            className={`flex flex-col ${message.from?.isLocal ? 'items-end' : 'items-start'
              }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${message.from?.isLocal
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
                }`}
            >
              {/* Sender name */}
              <div className="text-xs mb-1 font-semibold">
                {message.from?.identity}
              </div>

              {/* Message content */}
              {editingMessage === message.id ? (
                <div className="flex items-center gap-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, 'edit', message.id)}
                    className="w-full p-2 text-gray-800 rounded border resize-none"
                    rows={2}
                  />
                  <button
                    onClick={() => handleUpdate(message.id)}
                    className="p-1 hover:bg-blue-600 rounded"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="whitespace-pre-wrap">{message.message}</p>
                  {message.from?.isLocal && (
                    <button
                      onClick={() => handleEdit(message.id, message.message)}
                      className="opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs mt-1 opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.editTimestamp && ' (edited)'}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 " >
        <div className="flex items-center gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, 'new')}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
          />
          <button
            onClick={handleSend}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div >
  );
};

export default VideoChat;





