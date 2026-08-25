'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, Search, Circle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  lastMessage: string | null;
  lastMessageDate: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch contacts
  const fetchContacts = async (silent = false) => {
    if (!silent) setLoadingContacts(true);
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      if (!silent) setLoadingContacts(false);
    }
  };

  // 2. Fetch messages for selected contact
  const fetchMessages = async (contactId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?chatWith=${contactId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Poll for new messages/contacts in the background
  useEffect(() => {
    fetchContacts();

    const interval = setInterval(() => {
      fetchContacts(true);
      if (selectedContact) {
        fetchMessages(selectedContact.id, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedContact?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle contact selection
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    fetchMessages(contact.id);
    // Clear local unread count immediately
    setContacts(prev =>
      prev.map(c => (c.id === contact.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage;
    setNewMessage(''); // optimistic clear

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        fetchContacts(true); // update last message snippet in sidebar
      } else {
        setNewMessage(content); // restore text on error
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(content); // restore text
    } finally {
      setSending(false);
    }
  };

  // Filtered contacts list
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-12rem)] flex">
      {/* Sidebar Contacts list */}
      <div className="w-80 border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Direct Messages</h2>
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400 self-center my-auto" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loadingContacts && contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              No conversations found.
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full text-left p-4 flex items-start space-x-3 transition ${
                    isSelected ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm uppercase">
                      {contact.name.substring(0, 2)}
                    </div>
                    {contact.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-gray-900 truncate">
                        {contact.name}
                      </span>
                      {contact.lastMessageDate && (
                        <span className="text-[9px] text-gray-400">
                          {new Date(contact.lastMessageDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-blue-600 font-medium tracking-wide uppercase mt-0.5">
                      {contact.role}
                    </span>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {contact.unreadCount > 0 ? (
                        <strong className="text-gray-900 font-semibold">{contact.lastMessage}</strong>
                      ) : (
                        contact.lastMessage || 'Start conversation...'
                      )}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedContact ? (
          <>
            {/* Header info */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{selectedContact.name}</h3>
                <span className="text-[10px] text-gray-400 font-mono">{selectedContact.email}</span>
              </div>
            </div>

            {/* Message bubble list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId !== selectedContact.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-xs leading-relaxed shadow-sm ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}
                      >
                        <p>{message.content}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            isOwn ? 'text-blue-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-100 flex items-center space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow transition disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-6 space-y-3">
            <div className="bg-gray-100 p-4 rounded-full">
              <MessageSquare className="h-10 w-10 text-gray-300" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">No Active Conversation</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Select a contact from the sidebar list to view messages and start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
