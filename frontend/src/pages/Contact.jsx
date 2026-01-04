import React, { useState } from "react";
import "../styles/contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    type: "general",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
        type: "general",
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      description: "Get in touch via email",
      value: "contact@digitaltwin.io",
      link: "mailto:contact@digitaltwin.io",
    },
    {
      icon: "📞",
      title: "Phone",
      description: "Call our support team",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with our team",
      value: "Available 9 AM - 6 PM EST",
      link: "#",
    },
    {
      icon: "📍",
      title: "Office Location",
      description: "Visit our headquarters",
      value: "San Francisco, CA",
      link: "#",
    },
  ];

  const faqItems = [
    {
      question: "How do I get started with Digital Twin?",
      answer:
        "Simply sign up for an account, connect your building sensors, and our system will automatically begin collecting and analyzing data. Our onboarding team will guide you through the entire process.",
    },
    {
      question: "What is the typical implementation timeline?",
      answer:
        "Most implementations take 2-4 weeks depending on building complexity. This includes sensor installation, data pipeline setup, and model training. We'll provide a detailed timeline after the initial assessment.",
    },
    {
      question: "Do you offer technical support?",
      answer:
        "Yes! We provide 24/7 technical support via email, phone, and live chat. Premium customers also get dedicated account managers and on-site support.",
    },
    {
      question: "Can the system integrate with existing building systems?",
      answer:
        "Absolutely. Our Digital Twin integrates with most major BMS, HVAC, and energy management systems. Contact our team to discuss your specific setup.",
    },
    {
      question: "What kind of ROI can we expect?",
      answer:
        "Most customers see 15-25% energy savings within the first year, plus reduced maintenance costs and improved occupant comfort. We can provide case studies specific to your building type.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use enterprise-grade encryption, comply with all major security standards, and never share your data with third parties. Your data is your own.",
    },
  ];

  const integrations = [
    {
      name: "BACnet",
      icon: "🔧",
      description: "Building Automation & Control Networks",
    },
    {
      name: "Modbus",
      icon: "⚙️",
      description: "Industrial control systems",
    },
    {
      name: "MQTT",
      icon: "📡",
      description: "IoT messaging protocol",
    },
    {
      name: "REST APIs",
      icon: "🌐",
      description: "Standard web services",
    },
    {
      name: "Honeywell",
      icon: "🏭",
      description: "HVAC & automation systems",
    },
    {
      name: "Siemens",
      icon: "⚡",
      description: "Building management systems",
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Get in Touch</h1>
          <p>
            Have questions about our Digital Twin platform? We're here to help.
            Reach out to us using any method below.
          </p>
        </div>
      </section>

      <div className="contact-container">
        {/* Contact Methods */}
        <section className="contact-methods">
          <div className="section-header">
            <h2>Contact Our Team</h2>
            <p>Choose your preferred way to reach us</p>
          </div>
          <div className="methods-grid">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="method-card"
                target={method.link.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
              >
                <div className="method-icon">{method.icon}</div>
                <h3>{method.title}</h3>
                <p className="method-description">{method.description}</p>
                <div className="method-value">{method.value}</div>
                <div className="method-arrow">→</div>
              </a>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="contact-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours</p>
            </div>

            {submitted && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                <div className="success-content">
                  <h3>Message Sent!</h3>
                  <p>
                    Thank you for contacting us. We'll be in touch shortly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className={submitted ? "hidden" : ""}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Inquiry Type *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="support">Technical Support</option>
                    <option value="implementation">Implementation</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this about?"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more about your inquiry..."
                  rows="6"
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Integrations */}
        <section className="integrations-section">
          <div className="section-header">
            <h2>Technology Integrations</h2>
            <p>We work with industry-leading platforms and protocols</p>
          </div>
          <div className="integrations-grid">
            {integrations.map((integration, index) => (
              <div key={index} className="integration-card">
                <div className="integration-icon">{integration.icon}</div>
                <h4>{integration.name}</h4>
                <p>{integration.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about our platform</p>
          </div>
          <div className="faq-grid">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-item">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Support Resources */}
        <section className="support-section">
          <div className="section-header">
            <h2>Support Resources</h2>
            <p>Additional ways to get help</p>
          </div>
          <div className="resources-grid">
            <div className="resource-card">
              <div className="resource-icon">📚</div>
              <h3>Documentation</h3>
              <p>
                Access our comprehensive guides and API documentation for detailed technical information.
              </p>
              <a href="#" className="resource-link">
                Read Docs →
              </a>
            </div>
            <div className="resource-card">
              <div className="resource-icon">🎓</div>
              <h3>Training & Webinars</h3>
              <p>
                Join our regular webinars and training sessions to learn how to maximize your Digital Twin experience.
              </p>
              <a href="#" className="resource-link">
                View Schedule →
              </a>
            </div>
            <div className="resource-card">
              <div className="resource-icon">🐛</div>
              <h3>Report Issues</h3>
              <p>
                Found a bug? Have a feature request? Let us know through our dedicated feedback portal.
              </p>
              <a href="#" className="resource-link">
                Submit Feedback →
              </a>
            </div>
            <div className="resource-card">
              <div className="resource-icon">👥</div>
              <h3>Community Forum</h3>
              <p>
                Connect with other users, share best practices, and get help from our community.
              </p>
              <a href="#" className="resource-link">
                Join Forum →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;
