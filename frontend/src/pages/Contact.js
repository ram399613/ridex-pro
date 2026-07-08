import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const InfoCard = ({ icon, color, title, sub }) => (
  <div className="bg-ink-800 border border-ink-700 rounded-xl p-5 flex items-center gap-4">
    <div className={`w-13 h-13 rounded-lg flex items-center justify-center text-2xl ${color}`}><i className={`fa-solid ${icon}`}></i></div>
    <div>
      <div className="font-bold">{title}</div>
      <div className="text-xs text-muted-faint">{sub}</div>
    </div>
  </div>
);

const Contact = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/contact', form);
      showToast(data.message || 'Message sent!', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) { showToast(err.response?.data?.message || 'Failed to send', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <header className="pt-28 pb-10 bg-ink-900/80 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-faint mb-3"><Link to="/" className="hover:text-brand">Home</Link> / <span className="text-white">Contact</span></div>
          <h1 className="text-4xl font-extrabold">Get in <span className="text-brand">touch</span></h1>
          <p className="mt-2 text-muted">Questions, feedback, business enquiries — we'd love to hear from you.</p>
        </div>
      </header>
      <section className="py-16 max-w-7xl mx-auto px-6" data-testid="contact-page">
        <div className="grid lg:grid-cols-2 gap-8">
          <form className="card-flat p-8" onSubmit={submit}>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div><label className="form-label">Name</label><input className="form-control" required value={form.name} onChange={upd('name')} data-testid="contact-name" /></div>
              <div><label className="form-label">Email</label><input className="form-control" type="email" required value={form.email} onChange={upd('email')} data-testid="contact-email" /></div>
            </div>
            <div className="mb-4"><label className="form-label">Subject</label><input className="form-control" value={form.subject} onChange={upd('subject')} placeholder="General enquiry" data-testid="contact-subject" /></div>
            <div className="mb-5"><label className="form-label">Message</label><textarea className="form-control" rows="5" required value={form.message} onChange={upd('message')} data-testid="contact-message" /></div>
            <button className="btn-primary btn-lg" disabled={loading} data-testid="contact-submit">{loading ? 'Sending…' : 'Send Message'} <i className="fa-solid fa-paper-plane"></i></button>
          </form>

          <div className="grid gap-4">
            <InfoCard icon="fa-location-dot" color="bg-brand/15 text-brand" title="Head Office" sub="Bangalore, India" />
            <InfoCard icon="fa-phone" color="bg-green-500/15 text-green-400" title="+91 98765 43210" sub="Mon–Sat, 9AM–9PM" />
            <InfoCard icon="fa-envelope" color="bg-blue-500/15 text-blue-400" title="support@ridex.com" sub="24/7 email support" />
            <InfoCard icon="fa-comment" color="bg-violet-500/15 text-violet-400" title="Live Chat" sub="Instant replies from our team" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
