import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

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
      <header className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> / <span>Contact</span></div>
          <h1>Get in <span style={{ color: 'var(--orange)' }}>touch</span></h1>
          <p style={{ marginTop: 8 }}>Questions, feedback, business enquiries — we'd love to hear from you.</p>
        </div>
      </header>
      <section className="section container" data-testid="contact-page">
        <div className="two-col">
          <form className="card card-body" onSubmit={submit} style={{ padding: 32 }}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Name</label><input className="form-control" required value={form.name} onChange={upd('name')} data-testid="contact-name" /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" required value={form.email} onChange={upd('email')} data-testid="contact-email" /></div>
            </div>
            <div className="form-group"><label className="form-label">Subject</label><input className="form-control" value={form.subject} onChange={upd('subject')} placeholder="General enquiry" data-testid="contact-subject" /></div>
            <div className="form-group"><label className="form-label">Message</label><textarea className="form-control" rows="5" required value={form.message} onChange={upd('message')} data-testid="contact-message"></textarea></div>
            <button className="btn btn-primary btn-lg" disabled={loading} data-testid="contact-submit">{loading ? 'Sending…' : 'Send Message'} <i className="fa-solid fa-paper-plane"></i></button>
          </form>

          <div style={{ display: 'grid', gap: 16 }}>
            <div className="stat-card"><div className="stat-icon orange"><i className="fa-solid fa-location-dot"></i></div><div><div className="vehicle-name">Head Office</div><div className="stat-label">Bangalore, India</div></div></div>
            <div className="stat-card"><div className="stat-icon green"><i className="fa-solid fa-phone"></i></div><div><div className="vehicle-name">+91 98765 43210</div><div className="stat-label">Mon–Sat, 9AM–9PM</div></div></div>
            <div className="stat-card"><div className="stat-icon blue"><i className="fa-solid fa-envelope"></i></div><div><div className="vehicle-name">support@ridex.com</div><div className="stat-label">24/7 email support</div></div></div>
            <div className="stat-card"><div className="stat-icon purple"><i className="fa-solid fa-comment"></i></div><div><div className="vehicle-name">Live Chat</div><div className="stat-label">Instant replies from our team</div></div></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
