import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const DriverMessages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        if(user) {
             supabase.from('drivers').select('id').eq('user_id', user.id).maybeSingle()
             .then(({data: driver}) => {
                 if(driver) {
                    supabase.from('admin_messages').select('*').eq('driver_id', driver.id).order('created_at', { ascending: false })
                    .then(({data}) => setMessages(data || []));
                 }
             });
        }
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Messages from Admin</h1>
            {messages.length === 0 ? (
                <Card className="p-12 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    No messages yet.
                </Card>
            ) : (
                <div className="space-y-4">
                    {messages.map(msg => (
                        <Card key={msg.id} className="p-4 border-l-4 border-l-blue-500">
                            <p className="text-gray-800">{msg.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DriverMessages;