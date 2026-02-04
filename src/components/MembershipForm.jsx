import React, { useState, useEffect, useRef } from 'react';
import './MembershipForm.css';

const MembershipForm = ({ 
  webhookUrl = 'https://script.google.com/macros/s/AKfycbw6IyBFIF0qLhH1qXctH58GBTPFj2wrqv9oZJqUGXGxJ7y5Ti0Gm8ubrXgNvh6I-LdiLA/exec',
  onSuccess,
  showDisclaimer = true
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    country: '',
    interest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userId, setUserId] = useState('');
  
  const formRef = useRef(null);
  const elementsRef = useRef([]);

  // Generate UUID v4
  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Get or create user ID
  const getOrCreateUserId = () => {
    const key = 'bga_user_id';
    try {
      let id = localStorage.getItem(key);
      if (!id) {
        id = generateUUIDv4();
        localStorage.setItem(key, id);
      }
      return id;
    } catch {
      if (!window.__bga_ephemeral_id) {
        window.__bga_ephemeral_id = generateUUIDv4();
      }
      return window.__bga_ephemeral_id;
    }
  };

  // Initialize user ID
  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  // Animation on scroll using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      elementsRef.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getUserAgentString = () => {
    try {
      let ua = navigator.userAgent || '';
      if (!ua && navigator.userAgentData) {
        const brands = (navigator.userAgentData.brands || [])
          .map(b => `${b.brand}/${b.version}`)
          .join('; ');
        ua = `${brands}; mobile=${navigator.userAgentData.mobile}`;
      }
      const lang = navigator.language || '';
      let tz = '';
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      } catch {}
      return [ua, lang, tz].filter(Boolean).join(' | ');
    } catch {
      return 'unknown';
    }
  };

  const postJSON = async (url, payload) => {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true,
        mode: 'cors'
      });
      const ok = (resp.status >= 200 && resp.status < 400) || resp.type === 'opaque';
      let data = null;
      try {
        data = await resp.clone().json();
      } catch {
        try {
          data = await resp.text();
        } catch {
          data = null;
        }
      }
      return { ok, status: resp.status, data };
    } catch (error) {
      return { ok: false, status: 0, data: null, error };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      form: 'waitlist',
      formType: 'membership',
      ts: new Date().toISOString(),
      userId: userId || getOrCreateUserId(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      country: formData.country,
      interest: formData.interest,
      userAgent: getUserAgentString(),
      page: window.location.href
    };

    // Optimistic UI: show success immediately
    setShowSuccessModal(true);
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      country: '',
      interest: ''
    });

    // Fire-and-forget relay
    if (webhookUrl && !webhookUrl.includes('YOUR_DEPLOYMENT_ID')) {
      postJSON(webhookUrl, payload).catch((err) =>
        console.warn('Waitlist submission failed:', err)
      );
    }

    setIsSubmitting(false);

    // Call custom success handler if provided
    if (onSuccess) {
      onSuccess(payload);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="membership-form-wrapper">
      <div className="waitlist-container">
        <h2 
          className="animate-on-scroll"
          ref={(el) => {
            if (el && !elementsRef.current.includes(el)) {
              elementsRef.current.push(el);
            }
          }}
        >
          Become a Member
        </h2>
        <p 
          className="waitlist-subtitle animate-on-scroll"
          ref={(el) => {
            if (el && !elementsRef.current.includes(el)) {
              elementsRef.current.push(el);
            }
          }}
        >
          Join BizGrowth Africa to unlock tenders, grants, and trusted business news. Get exclusive access to opportunities and insights.
        </p>
        <form
          ref={(el) => {
            formRef.current = el;
            if (el && !elementsRef.current.includes(el)) {
              elementsRef.current.push(el);
            }
          }}
          id="waitlist-form"
          name="bga-waitlist"
          className="animate-on-scroll"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="formType" value="membership" />
          <input type="hidden" name="userId" value={userId} />
          
          <div className="form-group">
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="country"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <select
              id="interest"
              name="interest"
              value={formData.interest}
              onChange={handleInputChange}
              required
            >
              <option value="">What are you most interested in?</option>
              <option value="tenders">Tenders & procurement</option>
              <option value="grants">Grants & fellowships</option>
              <option value="news">Business news & insights</option>
              <option value="all">All of the above</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Become a Member'}
          </button>
        </form>
        
        {showDisclaimer && (
          <p 
            className="disclaimer animate-on-scroll"
            ref={(el) => {
              if (el && !elementsRef.current.includes(el)) {
                elementsRef.current.push(el);
              }
            }}
          >
            Become a member today and receive exclusive access to curated tenders, grants, and business insights.
          </p>
        )}
      </div>

      {/* Success modal – matches site design (primary red, light/dark) */}
      {showSuccessModal && (
        <div className="membership-modal-overlay" onClick={closeSuccessModal}>
          <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="membership-modal-close"
              onClick={closeSuccessModal}
              aria-label="Close"
            />
            <div className="membership-modal-icon-wrap">
              <span className="membership-modal-icon" aria-hidden>✓</span>
            </div>
            <h3 className="membership-modal-title">You Are On The Membership List</h3>
            <p className="membership-modal-message">
              Thanks for joining BizGrowth Africa. We will send you exclusive opportunities and key updates.
            </p>
            <button
              type="button"
              className="membership-modal-btn"
              onClick={closeSuccessModal}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipForm;
