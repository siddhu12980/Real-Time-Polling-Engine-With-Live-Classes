
import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
  };
  message: string;
  type: 'chat' | 'join' | 'leave';
  timestamp: string;
}

interface VideoChatProps {
  ws: WebSocket | null;
  userId: string;
  username: string;
  roomId: string;
}

function getFormatDateTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const VideoChat = ({ ws, userId, username, roomId }: VideoChatProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {

    console.log(ws?.readyState)

    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const messageData = JSON.parse(event.data);
        console.log("Received message:", messageData);

        if (['chat', 'join', 'leave'].includes(messageData.type)) {
          const newMessage: ChatMessage = {
            id: messageData.id || crypto.randomUUID(),
            message: messageData.message || '',
            sender: {
              id: messageData.sender?.ID || messageData.sender?.id || messageData.userId || '',
              name: messageData.sender?.NAME || messageData.sender?.name || messageData.sender?.Name || '',
            },
            timestamp: messageData.timestamp || getFormatDateTime(),
            type: messageData.type
          };

          console.log("Added MEssage", newMessage)

          setChatMessages(prev => [...prev, newMessage]);
        }

        console.log(chatMessages, chatMessages.length)

      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };



    const chatEventHandler = (event: MessageEvent) => {
      handleMessage(event);
    };

    ws.addEventListener('message', chatEventHandler);



    return () => {

      ws.removeEventListener('message', chatEventHandler);


    };
  }, [ws, userId, username, roomId]);

  const handleSend = () => {
    if (newMessage.trim() && ws?.readyState === WebSocket.OPEN) {
      const messageId = crypto.randomUUID();
      const messagePayload = {
        type: 'chat',
        message: newMessage,
        userId: userId,
        roomId: roomId,
        timestamp: getFormatDateTime(),
        id: messageId,
        sender: {
          id: userId,
          name: username
        }
      };

      // Add message to local state immediately
      const localMessage: ChatMessage = {
        id: messageId,
        message: newMessage,
        sender: {
          id: userId,
          name: username
        },
        timestamp: getFormatDateTime(),
        type: 'chat'
      };
      setChatMessages(prev => [...prev, localMessage]);

      // Send message through WebSocket
      ws.send(JSON.stringify(messagePayload));
      setNewMessage('');
    }
  };

  const handleEdit = (messageId: string) => {
    const message = chatMessages.find((msg) => msg.id === messageId);
    if (message) {
      setEditingMessage(messageId);
      setEditContent(message.message);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessage && editContent.trim() && ws?.readyState === WebSocket.OPEN) {
      const updatedMessages = chatMessages.map((msg) =>
        msg.id === editingMessage
          ? { ...msg, message: editContent }
          : msg
      );
      setChatMessages(updatedMessages);

      const editedMessagePayload = {
        type: 'chat',
        message: editContent,
        userId: userId,
        roomId: roomId,
        timestamp: getFormatDateTime(),
        id: editingMessage,
        sender: {
          id: userId,
          name: username
        }
      };
      ws.send(JSON.stringify(editedMessagePayload));

      setEditingMessage(null);
      setEditContent('');
    }
  };



  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleSaveEdit();
      } else {
        handleSend();
      }
    }
  };


  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const renderMessage = (msg: ChatMessage, {
    userId,
    editingMessage,
    editContent,
    handleKeyDown,
    handleSaveEdit,
    handleCancelEdit,
    handleEdit,
    formatTimestamp,
    setEditContent
  }: {
    userId: string;
    editingMessage: string | null;
    editContent: string;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleSaveEdit: () => void;
    handleCancelEdit: () => void;
    handleEdit: (id: string) => void;
    formatTimestamp: (timestamp: string) => string;
    setEditContent: (content: string) => void;
  }) => {
    const isOwnMessage = msg.sender.id === userId;

    if (msg.type === 'join' || msg.type === 'leave') {
      return (
        <div className="flex justify-center my-1.5 px-2">
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
            {msg.message}
          </span>
        </div>
      );
    }

    return (
      <div className={`flex flex-col mb-2 sm:mb-3 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center mb-0.5 sm:mb-1 px-2">
          <span className="text-xs sm:text-sm text-gray-600">{msg.sender.name}</span>
          <span className="text-xs text-gray-400 ml-1.5 sm:ml-2">
            {formatTimestamp(msg.timestamp)}
          </span>
        </div>

        {editingMessage === msg.id ? (
          <div className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg px-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-1.5 sm:p-2 text-sm border rounded-lg mb-1.5 sm:mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={2}
            />
            <div className="flex justify-end gap-1.5 sm:gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-xs sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={`relative group max-w-[calc(100%-2rem)] sm:max-w-lg px-2`}>
            <div
              className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm ${isOwnMessage
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
                }`}
            >
              {msg.message}
            </div>
            {isOwnMessage && (
              <button
                onClick={() => handleEdit(msg.id)}
                className="invisible group-hover:visible absolute -right-6 sm:-right-8 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };




  return (
    <div className="flex flex-col h-full min-h-[200px] bg-white rounded-lg shadow resize-y overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
          {chatMessages.map((msg) => (
            <div key={msg.id}>
              {renderMessage(msg, {
                userId,
                editingMessage,
                editContent,
                handleKeyDown,
                handleSaveEdit,
                handleCancelEdit,
                handleEdit,
                formatTimestamp,
                setEditContent
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area with compact design */}
      <div className="border-t p-2 sm:p-4">
        <div className="flex gap-1.5 sm:gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-3 sm:px-6 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};


export default VideoChat;