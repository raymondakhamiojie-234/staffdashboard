'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, UserCircle } from 'lucide-react';

export default function ChatClient({ currentUserId }: { currentUserId: number }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      interval = setInterval(() => fetchMessages(selectedContact.id), 5000); // Poll every 5s
    }
    return () => clearInterval(interval);
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/chat/users');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (contactId: number) => {
    try {
      const res = await fetch(`/api/chat?contactId=${contactId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContact) return;

    const content = input;
    setInput('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, {
      id: Date.now(),
      senderId: currentUserId,
      receiverId: selectedContact.id,
      content,
      createdAt: new Date().toISOString()
    }]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedContact.id, content })
      });
      // Silent re-fetch handled by polling
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: 'calc(100vh - 200px)' }}>
      
      {/* Sidebar Contacts */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Messages</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loadingContacts ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading contacts...</p>
          ) : contacts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No contacts found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: selectedContact?.id === contact.id ? 'var(--primary)' : 'transparent',
                    color: selectedContact?.id === contact.id ? 'white' : 'var(--text-primary)',
                    textAlign: 'left', transition: 'all 0.2s ease'
                  }}
                  className={selectedContact?.id !== contact.id ? 'hover-glass' : ''}
                >
                  <UserCircle size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{contact.fullName}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{contact.role.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedContact ? (
          <>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <UserCircle size={32} style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{selectedContact.fullName}</h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedContact.role.name}</span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Start the conversation with {selectedContact.fullName}
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} style={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      background: isMine ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      borderBottomRightRadius: isMine ? '0' : '12px',
                      borderBottomLeftRadius: isMine ? '12px' : '0'
                    }}>
                      <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>{msg.content}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  style={{ marginBottom: 0, flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a contact to start chatting
          </div>
        )}
      </div>

    </div>
  );
}
