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
    group: '',
    groupOther: '',
    overall_target: '',
    print_target: '',
    digital_target: '',
    wonder_sponsorship: '',
    project_sponsorship: '',
    crusade_sponsorship: '',
    other_campaigns: '',
  });

  const [showZoneOther, setShowZoneOther] = useState(false);
  const [showGroupOther, setShowGroupOther] = useState(false);

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
        setFormData((prev) => ({ ...prev, zone: '', zoneOther: '', group: '', groupOther: '' }));
        setShowGroupOther(false);
      } else {
        setShowZoneOther(false);
        setFormData((prev) => ({ ...prev, zoneOther: '', group: '', groupOther: '' }));
        setShowGroupOther(false);
      }
    }

    // Handle "Other" selection for group
    if (name === 'group') {
      if (value === 'OTHER') {
        setShowGroupOther(true);
        setFormData((prev) => ({ ...prev, group: '', groupOther: '' }));
      } else {
        setShowGroupOther(false);
        setFormData((prev) => ({ ...prev, groupOther: '' }));
      }
    }
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
          zoneOther: '',
          group: '',
          groupOther: '',
          overall_target: '',
          print_target: '',
          digital_target: '',
          wonder_sponsorship: '',
          project_sponsorship: '',
          crusade_sponsorship: '',
          other_campaigns: '',
        });
        setShowZoneOther(false);
        setShowGroupOther(false);
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
              <div className={styles.chatAvatar}><img src="/logo.webp" alt="ROR" style={{width: '100%', height: '100%', objectFit: 'contain'}} /></div>
              <div className={styles.chatBubble}>
                <strong>Dear Esteemed Pastor,</strong><br /><br />
                Warm greetings in the precious name of our Lord Jesus Christ.<br /><br />
                What an incredible journey we've just experienced together—three powerful days of prayer and fasting with our dear man of God, Pastor Chris. Our hearts are still ablaze with the fresh fire and vision he imparted to us!<br /><br />
                We are deeply grateful for your unwavering commitment and generous sponsorship in bringing Rhapsody of Realities to the nations. Your partnership has been instrumental in reaching precious souls with God's Word, and we honor you for your faithfulness.<br /><br />
                As we step boldly into this Year of Manifestation, we carry the prophetic declaration that our capacity has increased 1000 times! The man of God has reminded us that the Lord has given us power to get wealth, and this year, we will surpass everything we've ever accomplished—1000 times over—as we race together to reach the last man with the Gospel.<br /><br />
                We are confident that God has placed a specific vision in your heart for Rhapsody of Realities this year. Kindly share with us your overall faith goal and a breakdown for distribution (Print), digital, project sponsorship, so we can build a strategic plan together and work the miracles as we manifest the power of God through our combined efforts.<br /><br />
                Please take a few moments to complete the form below with your ROR goals for this year of manifestation.<br /><br />
                Thank you.<br /><br />
                <strong>Global Partnership Department</strong><br />
                Rhapsody of Realities.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2>𝐘𝐎𝐔𝐑 𝟐𝟎𝟐𝟔 PARTNERSHIP 𝐏𝐋𝐀𝐍𝐒 𝐅𝐎𝐑 𝐓𝐇𝐄 𝐙𝐎𝐍𝐄</h2>
            </div>

            {submitMessage && (
              <div className={submitMessage.type === 'success' ? styles.alertSuccess : styles.alertError}>
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="fullname">Name of Pastor <span style={{color: '#dc2626'}}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  id="fullname"
                  name="fullname"
                  placeholder="Enter Pastor's name"
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
                  required={(!showZoneOther)}
                  disabled={zonesLoading}
                >
                  <option value="">{zonesLoading ? 'Loading zones...' : 'Select your zone'}</option>
                  {zones.map((zone, index) => (
                    <option key={zone.id || index} value={zone.name}>
                      {zone.name}
                    </option>
                  ))}
                  <option value="OTHER">Other (Specify below)</option>
                </select>
              </div>

              {showZoneOther && (
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="zoneOther">Specify Zone <span style={{color: '#dc2626'}}>*</span></label>
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

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="group">Group</label>
                <select
                  className={styles.input}
                  id="group"
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  disabled={!formData.zone && !showZoneOther}
                >
                  <option value="">{(!formData.zone && !showZoneOther) ? 'Select a zone first' : 'Select your group (optional)'}</option>
                  {!showZoneOther && zones.find(z => z.name === formData.zone)?.groups?.map((group, index) => (
                    <option key={group.id || index} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                  {!showZoneOther && <option value="OTHER">Other (Specify below)</option>}
                </select>
              </div>

              {showGroupOther && (
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="groupOther">Specify Group</label>
                  <input
                    className={styles.input}
                    type="text"
                    id="groupOther"
                    name="groupOther"
                    placeholder="Enter your group name"
                    value={formData.groupOther}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="overall_target">Faith Goal - Total number of copies <span style={{color: '#dc2626'}}>*</span></label>
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

              <p style={{ marginBottom: '15px' }}>Please kindly break the above into the sections below:</p>

              <div className={styles.formSectionTitle}>1. Print copies</div>
              <div className={styles.inputGroup}>
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

              <div className={styles.formSectionTitle}>2. Digital copies</div>
              <div className={styles.inputGroup}>
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
