'use client';

import { useEffect, useState } from 'react';

interface EmailContact {
    email: string;
    name: string;
    position: string;
}

interface EmailSelectorProps {
    selectedEmails: string[];
    onChange: (emails: string[]) => void;
    label?: string;
    placeholder?: string;
}

export default function EmailSelector({ selectedEmails, onChange, label = "Select Recipients", placeholder = "Click to select emails..." }: EmailSelectorProps) {
    const [contacts, setContacts] = useState<EmailContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const shopid = 'rungroj'; // TODO: Make this dynamic

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/mongodb/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'email_contacts',
                    filter: { shopid },
                    sort: { name: 1 },
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setContacts(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleEmail = (email: string) => {
        if (selectedEmails.includes(email)) {
            onChange(selectedEmails.filter(e => e !== email));
        } else {
            onChange([...selectedEmails, email]);
        }
    };

    const removeEmail = (email: string) => {
        onChange(selectedEmails.filter(e => e !== email));
    };

    const filteredContacts = contacts.filter(contact =>
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getContactInfo = (email: string) => {
        return contacts.find(c => c.email === email);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>

            {/* Selected Emails Display */}
            {selectedEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {selectedEmails.map(email => {
                        const contact = getContactInfo(email);
                        return (
                            <div key={email} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{contact?.name || email}</span>
                                    {contact && <span className="text-xs text-slate-500">{contact.email}</span>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeEmail(email)}
                                    className="text-slate-400 hover:text-red-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dropdown Trigger */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-4 py-2 text-left bg-white border border-slate-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <span className="text-slate-900 text-sm">{placeholder}</span>
                </button>

                {/* Dropdown */}
                {showDropdown && (
                    <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                        {/* Search */}
                        <div className="p-3 border-b border-slate-200">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search contacts..."
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                autoFocus
                            />
                        </div>

                        {/* Contact List */}
                        <div className="overflow-y-auto max-h-64">
                            {loading ? (
                                <div className="p-4 text-center text-slate-500 text-sm">Loading contacts...</div>
                            ) : filteredContacts.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">No contacts found</div>
                            ) : (
                                <div className="p-2">
                                    {filteredContacts.map(contact => (
                                        <button
                                            key={contact.email}
                                            type="button"
                                            onClick={() => toggleEmail(contact.email)}
                                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors ${selectedEmails.includes(contact.email) ? 'bg-blue-50 border border-blue-200' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-900 text-sm">{contact.name}</span>
                                                        <span className="text-xs text-slate-500">({contact.position})</span>
                                                    </div>
                                                    <div className="text-xs text-slate-600 truncate">{contact.email}</div>
                                                </div>
                                                {selectedEmails.includes(contact.email) && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600 flex-shrink-0">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <div className="p-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setShowDropdown(false)}
                                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedEmails.length > 0 && (
                <p className="text-xs text-slate-500">{selectedEmails.length} recipient{selectedEmails.length !== 1 ? 's' : ''} selected</p>
            )}
        </div>
    );
}
