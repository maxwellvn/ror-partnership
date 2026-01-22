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
  groups?: { name: string; id: string }[];
}

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullname: '',
    zone: '',
    zoneOther: '',
    num_groups: '',
    overall_target: '',
    print_target: '',
    digital_target: '',
    campaigns: '',
  });

  const [showZoneOther, setShowZoneOther] = useState(false);

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
                  zonesList.push({ name: zone.name, id: zone.name, groups: zone.groups || [] });
                } else if (typeof zone === 'string') {
                  zonesList.push({ name: zone, id: zone, groups: [] });
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

    // Handle "Other" selection for zone
    if (name === 'zone') {
      if (value === 'OTHER') {
        setShowZoneOther(true);
        setFormData((prev) => ({ ...prev, zone: '', zoneOther: '' }));
      } else {
        setShowZoneOther(false);
        setFormData((prev) => ({ ...prev, zoneOther: '' }));
      }
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Allow only numbers for num_groups field
    if (name === 'num_groups') {
      const numValue = value.replace(/[^\d]/g, '');
      setFormData((prev) => ({ ...prev, [name]: numValue }));
      return;
    }

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
    if (name !== 'num_groups') {
      setFormData((prev) => ({ ...prev, [name]: formatNumber(value) }));
    }
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
          zoneOther: '',
          num_groups: '',
          overall_target: '',
          print_target: '',
          digital_target: '',
          campaigns: '',
        });
        setShowZoneOther(false);
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
      <div className={styles.pageWrapper}>

        <div className={styles.document}>

          {/* Header */}
          <header className={styles.header}>
            <div className={styles.logoContainer}>
              <img src="/logo.webp" alt="Rhapsody of Realities" className={styles.logo} />
            </div>
            <h1 className={styles.title}>The Race For The Last Man</h1>

            <div className={styles.scriptureBox}>
              <div className={styles.scriptureText}>
                "And God is able to make all grace abound toward you; that ye, always having all sufficiency in all things, may abound to every good work."
              </div>
              <span className={styles.scriptureRef}>2 Corinthians 9:8</span>
            </div>
          </header>

          {/* Letter Body */}
          <section className={styles.letterContent}>
            <span className={styles.salutation}>Dear Esteemed Pastor,</span>

            <p>
              Warm greetings in the precious name of our Lord Jesus Christ. What an incredible journey we've just experienced together—three powerful days of prayer and fasting with our dear man of God, Pastor Chris.
            </p>

            <p>
              We are deeply grateful for your unwavering commitment and generous sponsorship in bringing Rhapsody of Realities to the nations. Your partnership has been instrumental in reaching precious souls with God's Word, and we honor you for your faithfulness.
            </p>

            <p>
              As we step boldly into this Year of Manifestation, we carry the prophetic declaration that our capacity has increased 1000 times! The man of God has reminded us that the Lord has given us power to get wealth, and this year, we will surpass everything we've ever accomplished—1000 times over—as we race together to reach the last man with the Gospel.
            </p>

            <p>
              We are confident that God has placed a specific vision in your heart for Rhapsody of Realities this year. Kindly share with us your overall faith goal and a breakdown for distribution (Print), digital, and project sponsorship, so we can build a strategic plan together and work the miracles as we manifest the power of God through our combined efforts.
            </p>

            <div className={styles.signatureBlock}>
              Global Partnership Department<br />
              Rhapsody of Realities
            </div>
          </section>

          {/* Form Section */}
          <section className={styles.formArea}>
            <div className={styles.formHeading}>2026 Partnership Commitment</div>

            {submitMessage && (
              <div className={submitMessage.type === 'success' ? styles.alertSuccess : styles.alertError}>
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="fullname">Name of Pastor <span>*</span></label>
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

              {/* Zone and Number of Groups */}
              <div className={styles.row}>
                <div className={styles.col + ' ' + styles.inputGroup}>
                  <label className={styles.label} htmlFor="zone">Zone <span>*</span></label>
                  <select
                    className={styles.select}
                    id="zone"
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    required={!showZoneOther}
                    disabled={zonesLoading}
                  >
                    <option value="">{zonesLoading ? 'Loading zones...' : 'Select Zone...'}</option>
                    {zones.map((zone, index) => (
                      <option key={zone.id || index} value={zone.name}>
                        {zone.name}
                      </option>
                    ))}
                    <option value="OTHER">Other (Specify below)</option>
                  </select>
                </div>

                <div className={styles.col + ' ' + styles.inputGroup}>
                  <label className={styles.label} htmlFor="num_groups">Number of Groups in Zone</label>
                  <input
                    className={styles.input}
                    type="text"
                    id="num_groups"
                    name="num_groups"
                    placeholder="0"
                    value={formData.num_groups}
                    onChange={handleNumberChange}
                    onBlur={handleNumberBlur}
                  />
                </div>
              </div>

              {showZoneOther && (
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="zoneOther">Specify Zone <span>*</span></label>
                  <input
                    className={styles.input}
                    type="text"
                    id="zoneOther"
                    name="zoneOther"
                    placeholder="Enter your zone name"
                    value={formData.zoneOther}
                    onChange={handleInputChange}
                    required={showZoneOther}
                  />
                </div>
              )}

              {/* Goal & Breakdown Container */}
              <div className={styles.goalSection}>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="overall_target">Faith Goal - Total Number of Copies <span>*</span></label>
                  <input
                    className={styles.input}
                    type="text"
                    id="overall_target"
                    name="overall_target"
                    placeholder="Enter Total Amount"
                    value={formData.overall_target}
                    onChange={handleInputChange}
                    onBlur={handleNumberBlur}
                    required
                    style={{ borderColor: 'var(--navy)', fontWeight: 500 }}
                  />
                </div>

                <div className={styles.sectionSeparator}>
                  <span>Please kindly break the above into the sections below</span>
                </div>

                <div className={styles.row}>
                  <div className={styles.col + ' ' + styles.inputGroup}>
                    <label className={styles.label} htmlFor="print_target">1. Print Copies</label>
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

                  <div className={styles.col + ' ' + styles.inputGroup}>
                    <label className={styles.label} htmlFor="digital_target">2. Digital Copies</label>
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

                <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                  <label className={styles.label} htmlFor="campaigns">3. Campaigns (Wonder, Crusades)</label>
                  <input
                    className={styles.input}
                    type="text"
                    id="campaigns"
                    name="campaigns"
                    placeholder="0"
                    value={formData.campaigns}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Partnership'}
              </button>

            </form>
          </section>

        </div>

      </div>
    </div>
  );
}
