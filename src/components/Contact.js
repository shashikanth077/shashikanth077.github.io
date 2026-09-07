import emailjs from "emailjs-com";
import { useState } from "react";
import { contactInfo, contactIntro, sectionIds, siteConfig, timeouts } from "../constants";

const Contact = () => {
  const [mailData, setMailData] = useState({ name: "", email: "", message: "" });
  const { name, email, message } = mailData;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onChange = (e) =>
    setMailData({ ...mailData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(true);
      setTimeout(() => setError(null), timeouts.contactErrorClearMs);
      return;
    }
    const templateParams = {
      to_email: process.env.NEXT_PUBLIC_EMAILJS_TO_EMAIL,
      from_name: name,
      name,
      email,
      message,
    };
    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      )
      .then(
        () => {
          setSuccess(true);
          setError(null);
          setMailData({ name: "", email: "", message: "" });
          setTimeout(() => setSuccess(false), timeouts.contactSuccessClearMs);
        },
        () => {
          setError(true);
          setSuccess(false);
          setTimeout(() => setError(null), timeouts.contactErrorClearMs);
        },
      );
  };

  return (
    <section className="section" id={sectionIds.contact}>
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">{contactIntro.eyebrow}</span>
          <h2>{contactIntro.heading}</h2>
        </div>
        <div className="contact-grid">
          <div className="contact-form reveal">
            {error && (
              <div className="form-error">Please fill in all required fields.</div>
            )}
            {success && (
              <div className="form-success">
                Email sent successfully! Thank you for reaching out — I&apos;ll get back to you soon.
              </div>
            )}
            <form onSubmit={onSubmit} autoComplete="off">
              <div className="form-row">
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={name}
                  onChange={onChange}
                />
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={onChange}
                />
              </div>
              <div className="form-field">
                <textarea
                  className="form-textarea"
                  name="message"
                  placeholder="Your Message"
                  value={message}
                  onChange={onChange}
                />
              </div>
              <button type="submit" className="form-submit">
                Send Message
              </button>
            </form>
          </div>
          <div className="contact-info reveal reveal-delay-2">
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div className="contact-info-label">Address</div>
                <div className="contact-info-value">{contactInfo.address}</div>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className="contact-info-label">Email</div>
                <div className="contact-info-value">
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </div>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <div className="contact-info-label">Phone</div>
                <div className="contact-info-value">{contactInfo.phone}</div>
              </div>
            </div>
            <div className="social-links">
              <a
                href={siteConfig.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {siteConfig.socialLinks.github && (
                <a
                  href={siteConfig.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  aria-label="GitHub"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Contact;
