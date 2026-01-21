'use client';

import { useState, useEffect } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import styles from './page.module.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
});

interface Zone {
  name: string;
  id?: string;
}

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullname: '',
    zone: '',
    overall_target: '',
    print_target: '',
    digital_target: '',
    wonder_sponsorship: '',
    project_sponsorship: '',
    crusade_sponsorship: '',
    other_campaigns: '',
  });

  // Fetch zones from API
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch('/api/zones');
        if (response.ok) {
          const data = await response.json();

          // Extract zones from nested structure (Regions -> Zones)
          const zonesList: Zone[] = [];

          // Iterate through each region
          Object.values(data).forEach((region: any) => {
            if (region && typeof region === 'object') {
              // Each region contains zones as keys
              Object.values(region).forEach((zone: any) => {
                if (zone && typeof zone === 'object' && zone.name) {
                  zonesList.push({ name: zone.name, id: zone.name });
                } else if (typeof zone === 'string') {
                  zonesList.push({ name: zone, id: zone });
                }
              });
            }
          });

          // Sort zones alphabetically
          zonesList.sort((a, b) => a.name.localeCompare(b.name));
          setZones(zonesList);
        }
      } catch (error) {
        console.error('Failed to fetch zones:', error);
      } finally {
        setZonesLoading(false);
      }
    };

    fetchZones();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate overall target if print and digital change
    if (name === 'print_target' || name === 'digital_target') {
      const printValue = parseInt(formData.print_target.replace(/[,\s]/g, '')) || 0;
      const digitalValue = parseInt(formData.digital_target.replace(/[,\s]/g, '')) || 0;
      const newValue = parseInt(value.replace(/[,\s]/g, '')) || 0;

      if (name === 'print_target') {
        const total = newValue + digitalValue;
        setFormData((prev) => ({ ...prev, overall_target: total.toLocaleString('en-US') }));
      } else {
        const total = printValue + newValue;
        setFormData((prev) => ({ ...prev, overall_target: total.toLocaleString('en-US') }));
      }
    }
  };

  const formatNumber = (value: string) => {
    const cleaned = value.replace(/[,\s]/g, '');
    if (!cleaned) return '';
    const num = parseInt(cleaned);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US');
  };

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: formatNumber(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage({ type: 'success', text: 'Thank you! Your partnership commitment has been submitted successfully.' });
        setFormData({
          fullname: '',
          zone: '',
          overall_target: '',
          print_target: '',
          digital_target: '',
          wonder_sponsorship: '',
          project_sponsorship: '',
          crusade_sponsorship: '',
          other_campaigns: '',
        });
      } else {
        setSubmitMessage({ type: 'error', text: result.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${inter.variable} ${playfair.variable}`}>
      <div className={styles.pageGrid}>

        {/* LEFT COLUMN: Content */}
        <div className={styles.contentSide}>
          <div className={styles.contentWrapper}>
            <img src="/logo.webp" alt="Rhapsody of Realities" className={styles.logo} />
            <div className={styles.eyebrow}>Partnership 2026</div>
            <h1 className={styles.title}>The Race For The Last Man</h1>

            {/* Scripture */}
            <div className={styles.scriptureBlock}>
              <div className={styles.scriptureText}>
                "And God is able to make all grace abound toward you; that ye, always having all sufficiency in all things, may abound to every good work."
              </div>
              <div className={styles.scriptureRef}>2 Corinthians 9:8</div>
            </div>

            {/* Pastor's Quote */}
            <div className={styles.quoteSection}>
              <p className={styles.quoteText}>
                "We must realize that the Rhapsody of Realities is not just a book; it is a life-giving spirit. When we give towards its distribution, we are not just donating; we are partnering with heaven to alter the destiny of nations."
              </p>
              <span className={styles.quoteAuthor}>Rev. Chris Oyakhilome D.Sc., D.D.</span>
            </div>

            {/* Chat UI */}
            <div className={styles.chatUi}>
              <div className={styles.chatAvatar}>ROR</div>
              <div className={styles.chatBubble}>
                <strong>ROR Department</strong><br />
                Thank you for your commitment to the vision of our Man of God. With your contribution, we are ready to break new records this year.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2>Rhapsody Partnership Target</h2>
              <p>Please complete your details and partnership breakdown below.</p>
            </div>

            {submitMessage && (
              <div className={submitMessage.type === 'success' ? styles.alertSuccess : styles.alertError}>
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Section 1: Details */}
              <div className={styles.formSectionTitle}>Partner Details</div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="fullname">Full Name <span style={{color: '#dc2626'}}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  id="fullname"
                  name="fullname"
                  placeholder="Enter Full Name"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="zone">Zone <span style={{color: '#dc2626'}}>*</span></label>
                <select
                  className={styles.input}
                  id="zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  required
                  disabled={zonesLoading}
                >
                  <option value="">{zonesLoading ? 'Loading zones...' : 'Select your zone'}</option>
                  {zones.map((zone, index) => (
                    <option key={zone.id || index} value={zone.name}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section 2: Main Targets */}
              <div className={styles.formSectionTitle}>Target Overview</div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="overall_target">Overall Target Goal (Copies) <span style={{color: '#dc2626'}}>*</span></label>
                <div className={styles.inputWrap}>
                  <input
                    className={styles.input}
                    type="text"
                    id="overall_target"
                    name="overall_target"
                    placeholder="0"
                    value={formData.overall_target}
                    onChange={handleInputChange}
                    onBlur={handleNumberBlur}
                    required
                  />
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="print_target">Print Copies <span style={{color: '#dc2626'}}>*</span></label>
                  <div className={styles.inputWrap}>
                    <input
                      className={styles.input}
                      type="text"
                      id="print_target"
                      name="print_target"
                      placeholder="0"
                      value={formData.print_target}
                      onChange={handleNumberChange}
                      onBlur={handleNumberBlur}
                      required
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="digital_target">Digital Copies <span style={{color: '#dc2626'}}>*</span></label>
                  <div className={styles.inputWrap}>
                    <input
                      className={styles.input}
                      type="text"
                      id="digital_target"
                      name="digital_target"
                      placeholder="0"
                      value={formData.digital_target}
                      onChange={handleNumberChange}
                      onBlur={handleNumberBlur}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Campaign Breakdown */}
              <div className={styles.formSectionTitle}>Campaigns & Sponsorships</div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="wonder_sponsorship">Wonder Copies Sponsorship <span style={{color: '#dc2626'}}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  id="wonder_sponsorship"
                  name="wonder_sponsorship"
                  placeholder="Enter amount"
                  value={formData.wonder_sponsorship}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="project_sponsorship">Project Sponsorship <span style={{color: '#dc2626'}}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  id="project_sponsorship"
                  name="project_sponsorship"
                  placeholder="Enter amount"
                  value={formData.project_sponsorship}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="crusade_sponsorship">Crusade Sponsorship <span style={{color: '#dc2626'}}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  id="crusade_sponsorship"
                  name="crusade_sponsorship"
                  placeholder="Enter amount"
                  value={formData.crusade_sponsorship}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="other_campaigns">Other Campaigns <span style={{color: '#dc2626'}}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  id="other_campaigns"
                  name="other_campaigns"
                  placeholder="Enter amount"
                  value={formData.other_campaigns}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Partnership'}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
