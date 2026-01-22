'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Material {
  description: string;
  specification: string;
  warranty: string;
}

interface ROI {
  energyGenerationPerYear: number;
  co2SavingsPerYear: number;
  paybackPeriodMin: number;
  paybackPeriodMax: number;
  totalSavings25Years: number;
  treesEquivalent: number;
  co2EliminatedTotal: number;
}

interface Proposal {
  _id: string;
  proposalNumber: string;
  date: string;
  clientName: string;
  projectLocation: string;
  plantCapacity: number;
  projectType: string;
  roofType: string;
  pricePerKW: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  advancePercent: number;
  balancePercent: number;
  paymentTermsNotes?: string;
  materials: Material[];
  roi: ROI;
  terms: string[];
  validUntil: string;
  status: string;
}

interface BusinessSettings {
  businessName: string;
  tagline?: string;
  phone?: string;
  email?: string;
  website?: string;
  gstNumber?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
}

const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
};

export default function PrintProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [business, setBusiness] = useState<BusinessSettings>({
    businessName: 'Solar Captures',
    tagline: 'Generate Your Own Power',
    phone: '+91 84891 11511',
    email: 'admin@solarcaptures.com',
    website: 'www.solarcaptures.com',
    gstNumber: '33AAICI2217E2Z1',
    bankDetails: {
      accountName: 'IC SOLAR CAPTURES',
      bankName: 'FEDERAL BANK',
      accountNumber: '23900200007536',
      ifscCode: 'FDRL0002390',
    },
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [proposalRes, settingsRes] = await Promise.all([
        fetch(`/api/proposals/${id}`),
        fetch('/api/business-settings'),
      ]);

      if (proposalRes.ok) {
        setProposal(await proposalRes.json());
      } else {
        toast.error('Proposal not found');
        router.push('/dashboard/proposals');
        return;
      }

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setBusiness(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading proposal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
        Loading proposal...
      </div>
    );
  }

  if (!proposal) return null;

  // CSS copied EXACTLY from sample-proposal.html
  const cssStyles = `
    :root {
      /* Brand Colors - Professional & Trustworthy */
      --primary: #0056b3;       
      --primary-dark: #003d80;
      --accent: #00c853;        
      --bg-light: #f8fbff;      
      --text-main: #2c3e50;
      --text-muted: #6c757d;
      --white: #ffffff;
      --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 15px rgba(0,0,0,0.08);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #e9ecef;
      color: var(--text-main);
      line-height: 1.6;
    }

    /* A4 Page Container */
    .page {
      width: 210mm;
      height: 297mm;
      padding: 15mm 20mm;
      margin: 20px auto;
      background: var(--white);
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* --- Header Design --- */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid var(--primary);
      padding-bottom: 15px;
      margin-bottom: 30px;
    }

    .logo-section h1 {
      color: var(--primary);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .logo-section p {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .contact-stack {
      text-align: right;
      font-size: 12px;
      line-height: 1.4;
    }

    .contact-stack strong { color: var(--primary); }

    /* --- Footer Design --- */
    .footer {
      margin-top: auto;
      border-top: 1px solid #eee;
      padding-top: 15px;
      text-align: center;
      font-size: 10px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
    }

    /* --- Cover Page Special Styling --- */
    .cover-hero {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }

    .proposal-title {
      font-size: 42px;
      color: var(--primary-dark);
      font-weight: 300;
      margin-bottom: 10px;
    }

    .tagline {
      font-size: 16px;
      color: var(--accent);
      font-weight: 600;
      font-style: italic;
      margin-bottom: 50px;
    }

    /* The Highlighted Client Box */
    .client-card {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: var(--shadow-md);
      margin: 0 auto 40px auto;
      width: 90%;
      position: relative;
    }

    .client-card::before {
      content: "PREPARED EXCLUSIVELY FOR";
      display: block;
      font-size: 10px;
      letter-spacing: 2px;
      opacity: 0.8;
      margin-bottom: 10px;
    }

    .client-name {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .project-location {
      font-size: 14px;
      opacity: 0.9;
    }

    /* The Spec Highlight Box */
    .spec-highlight {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 0 auto;
      width: 90%;
    }

    .spec-box {
      background: var(--bg-light);
      border: 1px solid #dceeff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .spec-box h3 {
      font-size: 36px;
      color: var(--primary);
      font-weight: 800;
      margin-bottom: 5px;
    }

    .spec-box span {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* --- Commercial Tables & Layout --- */
    .section-title {
      font-size: 18px;
      color: var(--primary);
      border-left: 5px solid var(--accent);
      padding-left: 15px;
      margin: 20px 0;
      font-weight: 700;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
      font-size: 13px;
      box-shadow: var(--shadow-sm);
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background-color: var(--primary);
      color: white;
      padding: 12px 15px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }

    td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
      color: #444;
    }

    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background-color: #f8fbff; }

    .price-highlight {
      font-size: 16px;
      font-weight: bold;
      color: var(--primary-dark);
    }

    .total-row td {
      background-color: var(--primary-dark);
      color: white;
      font-weight: bold;
      font-size: 15px;
    }

    /* Bank Card Design */
    .bank-card {
      background: #fdfdfd;
      border: 1px solid #e0e0e0;
      border-left: 5px solid var(--primary);
      padding: 20px;
      border-radius: 6px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      font-size: 13px;
    }

    /* --- ROI & Impact Design --- */
    .impact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
      margin: 30px 0;
    }

    .impact-card {
      background: white;
      border: 1px solid #eee;
      border-bottom: 4px solid var(--accent);
      padding: 20px 10px;
      text-align: center;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
    }

    .impact-card .value {
      display: block;
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      margin: 10px 0;
    }

    .impact-card .label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .quote-box {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      font-style: italic;
      margin-top: 20px;
      border: 1px dashed #a5d6a7;
    }

    /* --- Floating Button --- */
    .fab {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: var(--primary);
      color: white;
      padding: 15px 30px;
      border-radius: 50px;
      font-weight: bold;
      box-shadow: 0 4px 20px rgba(0,86,179,0.4);
      border: none;
      cursor: pointer;
      z-index: 100;
      transition: transform 0.2s;
    }
    .fab:hover { transform: translateY(-2px); background: var(--primary-dark); }

    .back-btn {
      position: fixed;
      bottom: 30px;
      left: 30px;
      background: #666;
      color: white;
      padding: 15px 30px;
      border-radius: 50px;
      font-weight: bold;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      border: none;
      cursor: pointer;
      z-index: 100;
    }
    .back-btn:hover { background: #555; }

    @media print {
      body { background: white; margin: 0; padding: 0; }
      .page { 
        margin: 0; 
        box-shadow: none; 
        width: 100%; 
        min-height: 100vh;
        height: 100vh;
        page-break-after: always;
        page-break-inside: avoid;
      }
      .fab { display: none; }
      .back-btn { display: none; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />

      <button className="fab" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
      <button className="back-btn" onClick={() => router.back()}>← Back</button>

      {/* Page 1: Cover - EXACT structure from sample-proposal.html */}
      <div className="page">
        <header className="header">
          <div className="logo-section">
            <h1>{business.businessName}</h1>
            <p>{business.tagline}</p>
          </div>
          <div className="contact-stack">
            <strong>MNRE Registered Vendor</strong><br />
            TamilNadu&apos;s Trusted Experts<br />
            {business.phone}
          </div>
        </header>

        <div className="cover-hero">
          <h2 className="proposal-title">Project Proposal</h2>
          <div className="tagline">&quot;Let The Sun Pay Your Bills&quot;</div>

          <div className="client-card">
            <div className="client-name">{proposal.clientName}</div>
            <div className="project-location">📍 {proposal.projectLocation}</div>
            <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>Date: {formatDate(proposal.date)}</div>
          </div>

          <div className="spec-highlight">
            <div className="spec-box">
              <h3>{proposal.plantCapacity} kW</h3>
              <span>Plant Capacity</span>
            </div>
            <div className="spec-box">
              <h3>{proposal.projectType.replace(' Solar', '')}</h3>
              <span>System Type</span>
            </div>
          </div>

          <div style={{ marginTop: '50px', padding: '0 40px', color: '#555' }}>
            <p><strong>Thank you for the opportunity.</strong></p>
            <p>We have prepared a competitive, high-performance proposal tailored specifically to your energy needs.</p>
          </div>
        </div>

        <footer className="footer">
          <span>{business.website}</span>
          <span>Page 01</span>
          <span>{business.email}</span>
        </footer>
      </div>

      {/* Page 2: Investment Proposal - EXACT structure from sample-proposal.html */}
      <div className="page">
        <header className="header">
          <div className="logo-section">
            <h1>{business.businessName}</h1>
          </div>
          <div className="contact-stack">
            84891 11511<br />044 2999 3999
          </div>
        </header>

        <h2 className="section-title">Investment Proposal: {proposal.roofType}</h2>

        <table>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Description</th>
              <th style={{ width: '25%' }}>Price Per KW</th>
              <th style={{ width: '25%' }}>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Design, Supply, Installation &amp; commissioning of <strong>{proposal.plantCapacity}KW Solar panels</strong> above the roofsheet including all materials.</td>
              <td>{formatCurrency(proposal.pricePerKW)}</td>
              <td className="price-highlight">{formatCurrency(proposal.amount)}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'right' }}>GST ({proposal.gstRate}%)</td>
              <td>{formatCurrency(proposal.gstAmount)}</td>
            </tr>
            <tr className="total-row">
              <td colSpan={2} style={{ textAlign: 'right' }}>TOTAL PROJECT COST</td>
              <td>₹ {formatCurrency(proposal.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '10px' }}>Payment Schedule</h3>
            <ul style={{ listStyle: 'none', fontSize: '13px' }}>
              <li style={{ marginBottom: '10px', paddingLeft: '15px', borderLeft: '3px solid var(--accent)' }}>
                <strong>{proposal.advancePercent}% Advance</strong><br />
                <span style={{ color: '#666' }}>Along with Order Confirmation</span>
              </li>
              <li style={{ paddingLeft: '15px', borderLeft: '3px solid var(--accent)' }}>
                <strong>{proposal.balancePercent}% Balance</strong><br />
                <span style={{ color: '#666' }}>After Installation Completion</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '10px' }}>Banking Information</h3>
            <div className="bank-card">
              <div><strong>Name:</strong><br />{business.bankDetails?.accountName}</div>
              <div><strong>Bank:</strong><br />{business.bankDetails?.bankName}</div>
              <div><strong>A/C No:</strong><br />{business.bankDetails?.accountNumber}</div>
              <div><strong>IFSC:</strong><br />{business.bankDetails?.ifscCode}</div>
            </div>
            <div style={{ fontSize: '11px', marginTop: '5px', textAlign: 'right', color: '#666' }}>GST: {business.gstNumber}</div>
          </div>
        </div>

        <footer className="footer">
          <span>{business.website}</span>
          <span>Page 02</span>
          <span>{business.email}</span>
        </footer>
      </div>

      {/* Page 3: Bill of Materials - EXACT structure from sample-proposal.html */}
      <div className="page">
        <header className="header">
          <div className="logo-section">
            <h1>{business.businessName}</h1>
          </div>
          <div className="contact-stack">
            84891 11511<br />044 2999 3999
          </div>
        </header>

        <h2 className="section-title">Bill of Materials &amp; Warranty</h2>

        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Specification</th>
              <th>Warranty Coverage</th>
            </tr>
          </thead>
          <tbody>
            {proposal.materials.map((material, index) => (
              <tr key={index}>
                <td><strong>{material.description}</strong></td>
                <td>{material.specification}</td>
                <td style={{ color: '#00c853', fontWeight: 'bold' }}>{material.warranty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px', fontSize: '13px', color: '#003d80' }}>
          <strong>Note:</strong> We use top-tier brands like Axitec, Deye, and Polycab to ensure maximum efficiency for your plant.
        </div>

        <footer className="footer">
          <span>{business.website}</span>
          <span>Page 03</span>
          <span>{business.email}</span>
        </footer>
      </div>

      {/* Page 4: Financial & Environmental Impact - EXACT structure from sample-proposal.html */}
      <div className="page">
        <header className="header">
          <div className="logo-section">
            <h1>{business.businessName}</h1>
          </div>
          <div className="contact-stack">
            84891 11511<br />044 2999 3999
          </div>
        </header>

        <h2 className="section-title">Financial &amp; Environmental Impact</h2>

        <div style={{ marginBottom: '20px' }}>
          <p><strong>The Strategy:</strong> With an installed cost of {(proposal.totalAmount / 100000).toFixed(2)} Lakh, your electricity bills will be virtually eliminated. Your simple payback period is between <strong>{proposal.roi.paybackPeriodMin} to {proposal.roi.paybackPeriodMax} years</strong>.</p>
          <p>After this short payback period, you will enjoy <strong>free electricity for decades</strong>.</p>
        </div>

        <div className="impact-grid">
          <div className="impact-card">
            <span className="label">Total Savings (22 Yrs)</span>
            <span className="value" style={{ color: '#0056b3' }}>₹ {(proposal.roi.totalSavings25Years / 100000).toFixed(1)} L</span>
            <span className="label">Estimated Returns</span>
          </div>
          <div className="impact-card">
            <span className="label">Environmental Impact</span>
            <span className="value" style={{ color: '#2e7d32' }}>{proposal.roi.treesEquivalent} Trees</span>
            <span className="label">Planted Equivalent</span>
          </div>
          <div className="impact-card">
            <span className="label">Carbon Reduction</span>
            <span className="value" style={{ color: '#555' }}>{proposal.roi.co2EliminatedTotal} Tons</span>
            <span className="label">CO2 Eliminated</span>
          </div>
        </div>

        <div style={{ background: '#f8fbff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#0056b3' }}>Technical Performance</h3>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '8px' }}>⚡ <strong>Annual Generation:</strong> {formatCurrency(proposal.roi.energyGenerationPerYear)} kWh/year</li>
            <li style={{ marginBottom: '8px' }}>🌍 <strong>Annual CO2 Avoided:</strong> {proposal.roi.co2SavingsPerYear} tonnes</li>
            <li>📅 <strong>Payback Time:</strong> {proposal.roi.paybackPeriodMin} to {proposal.roi.paybackPeriodMax} years</li>
          </ul>
        </div>

        <div className="quote-box">
          &quot;Eliminate your EB bills with {business.businessName.toUpperCase()} and start saving from day one.<br />
          Invest once, enjoy free electricity for 25+ years.&quot;
        </div>

        <footer className="footer">
          <span>{business.website}</span>
          <span>Page 04</span>
          <span>{business.email}</span>
        </footer>
      </div>

      {/* Page 5: Terms & Conditions - EXACT structure from sample-proposal.html */}
      <div className="page">
        <header className="header">
          <div className="logo-section">
            <h1>{business.businessName}</h1>
          </div>
          <div className="contact-stack">
            84891 11511<br />044 2999 3999
          </div>
        </header>

        <h2 className="section-title">Terms &amp; Conditions</h2>

        <div style={{ fontSize: '13px', color: '#444' }}>
          <ul style={{ paddingLeft: '20px', lineHeight: 2 }}>
            {proposal.terms.map((term, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: term.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </ul>
        </div>

        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Thank you, awaiting your favorable order.</p>
          <div style={{ marginTop: '40px', borderTop: '2px solid #ddd', width: '200px', marginLeft: 'auto', marginRight: 'auto', paddingTop: '10px' }}>
            Authorized Signatory
          </div>
        </div>

        <footer className="footer">
          <span>{business.website}</span>
          <span>Page 05</span>
          <span>{business.email}</span>
        </footer>
      </div>
    </>
  );
}
