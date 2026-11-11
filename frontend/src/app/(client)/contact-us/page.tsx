'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { useSiteSettings } from '@/lib/admin/useSiteSettings';

export default function ContactUsPage() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteName = settings.siteName || 'HeyGoodly';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim();
    const cleanPhone = form.phone.trim();
    const cleanMessage = form.message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setError('Please fill in your name, email address, and message before submitting.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post(API_ENDPOINTS.PUBLIC.FEEDBACK, {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        message: cleanMessage,
      });
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to send feedback at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#c62828] uppercase tracking-widest">
            <MessageSquare size={16} /> Get In Touch
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact {siteName} Support &amp; Partnership Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Have a question about a discount code? Found an expired coupon? Or are you a merchant interested in listing your brand on {siteName}? Drop us a note below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out to {siteName}. Our editorial team reviews every message and responds promptly during business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-[#c62828] hover:text-red-800 underline cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="space-y-5">
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
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder={settings.supportHotline || '+1 (555) 000-0000'}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Message / Store Report *</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your inquiry, store partnership request, or feedback..."
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#c62828] hover:bg-[#b71c1c] text-white text-xs font-bold px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
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

          {/* Contact Details & Trust Signals (Driven by PostgreSQL system_settings) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>

              <div className="space-y-4 text-xs">
                {settings.contactEmail && (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-red-50 text-[#c62828] rounded-xl shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Email Editorial Team</p>
                      <a href={`mailto:${settings.contactEmail}`} className="text-slate-600 hover:text-[#c62828] transition">
                        {settings.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {settings.supportHotline && (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-red-50 text-[#c62828] rounded-xl shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Support Hotline</p>
                      <a href={`tel:${settings.supportHotline}`} className="text-slate-600 hover:text-[#c62828] transition">
                        {settings.supportHotline}
                      </a>
                    </div>
                  </div>
                )}

                {settings.contactAddress && (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-red-50 text-[#c62828] rounded-xl shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Headquarters</p>
                      <p className="text-slate-600">{settings.contactAddress}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Editorial Desk Hours</p>
                    <p className="text-slate-500">Monday – Friday: 9:00 AM – 6:00 PM</p>
                    <p className="text-slate-500">Every message is logged directly to our support inbox.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Application Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400">
                Are You an Affiliate Merchant?
              </span>
              <h3 className="text-lg font-bold">List Your Brand on {siteName}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We partner directly with leading brands and manufacturers to feature verified promotions and honest product evaluations.
              </p>
              {settings.contactEmail && (
                <div className="pt-2">
                  <a href={`mailto:${settings.contactEmail}`} className="inline-block text-xs font-bold text-red-300 hover:text-white transition">
                    Email: {settings.contactEmail}
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
