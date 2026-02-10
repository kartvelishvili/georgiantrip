import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitContactForm } from '@/lib/contactService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';

const ContactForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitContactForm(formData);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
        className: "bg-green-50 border-green-200"
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Sending Message",
        description: "Please try again later or email us directly."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Send us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input 
              id="name" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Your Name" 
              className="bg-gray-50 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="you@example.com" 
              className="bg-gray-50 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+995..." 
              className="bg-gray-50 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
            <Input 
              id="subject" 
              name="subject" 
              required 
              value={formData.subject} 
              onChange={handleChange} 
              placeholder="How can we help?" 
              className="bg-gray-50 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
          <Textarea 
            id="message" 
            name="message" 
            required 
            value={formData.message} 
            onChange={handleChange} 
            placeholder="Write your message here..." 
            rows={5}
            className="bg-gray-50"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold rounded-xl shadow-lg shadow-green-200"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</>
          ) : (
            <><Send className="w-5 h-5 mr-2" /> Send Message</>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;