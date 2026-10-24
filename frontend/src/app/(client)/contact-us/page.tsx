'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post(API_ENDPOINTS.PUBLIC.FEEDBACK, form);
    } catch (err: any) {
      console.warn('API submission notice:', err.message);
    } finally {
      // Save directly to local admin collection so ProCMS displays it in real-time
      if (typeof window !== 'undefined') {
        try {
          const key = 'admin:collection:customer-feedback';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const newInquiry = {
            id: Date.now(),
            name: form.name,
            email: form.email,
            phone: form.phone,
            message: form.message,
            isRead: false,
            createdAt: 'Just now',
          };
          localStorage.setItem(key, JSON.stringify([newInquiry, ...existing]));
        } catch {
          // ignore
        }
      }

      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
            <MessageSquare size={16} /> Get In Touch
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Bargorya Support & Partnership Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Have a question about a discount code? Found an expired coupon? Or are you a merchant interested in listing your brand on Bargorya? Drop us a note below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out to Bargorya. Our editorial team reviews every message and responds within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">Send Us an Inquiry</h2>
                  <p className="text-xs text-slate-500">Fill in the form and our team will get back to you.</p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Message / Store Report *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your inquiry, store partnership request, or feedback..."
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <Send size={14} /> Submit Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Details & Trust Signals */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Email Editorial Team</p>
                    <p className="text-slate-500">contact@bargorya.com</p>
                    <p className="text-slate-500">partnerships@bargorya.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Headquarters</p>
                    <p className="text-slate-500">Bargorya Media Inc.</p>
                    <p className="text-slate-500">100 Tech Promenade, Suite 400</p>
                    <p className="text-slate-500">Austin, TX 78701, United States</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Response Guarantee</p>
                    <p className="text-slate-500">Monday - Friday: 9am - 6pm EST</p>
                    <p className="text-slate-500">Guaranteed reply within 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Application Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                Are You an Affiliate Merchant?
              </span>
              <h3 className="text-lg font-bold">List Your Brand on Bargorya</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We partner with brands on PartnerBoost, Impact, ShareASale, and CJ Affiliate to drive targeted shoppers to your promotions.
              </p>
              <div className="pt-2">
                <span className="inline-block text-xs font-bold text-indigo-200">
                  Email: merchants@bargorya.com
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
