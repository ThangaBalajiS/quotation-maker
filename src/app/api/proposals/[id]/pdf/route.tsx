import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Proposal from '@/models/Proposal';
import User from '@/models/User';
import puppeteer from 'puppeteer';

// Helper functions
const formatCurrency = (amount: number) => amount.toLocaleString('en-IN');
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
};

// Generate HTML exactly matching sample-proposal.html
function generateProposalHTML(proposal: {
  proposalNumber: string;
  date: Date;
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
  materials: Array<{ description: string; specification: string; warranty: string }>;
  roi: {
    energyGenerationPerYear: number;
    co2SavingsPerYear: number;
    paybackPeriodMin: number;
    paybackPeriodMax: number;
    totalSavings25Years: number;
    treesEquivalent: number;
    co2EliminatedTotal: number;
  };
  terms: string[];
}, business: {
  businessName: string;
  tagline?: string;
  phone?: string;
  email?: string;
  website?: string;
  gstNumber?: string;
  bankDetails?: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
}) {
  const materialsRows = proposal.materials.map(m => `
    <tr>
      <td><strong>${m.description}</strong></td>
      <td>${m.specification}</td>
      <td style="color: #00c853; font-weight: bold;">${m.warranty}</td>
    </tr>
  `).join('');

  const termsItems = proposal.terms.map(t => `<li>${t}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solar Proposal for ${proposal.clientName}</title>
  <style>
    :root {
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
      background-color: white;
      color: var(--text-main);
      line-height: 1.6;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 15mm 20mm;
      margin: 0 auto;
      background: var(--white);
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      page-break-after: always;
    }

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
      background-color: var(--primary-dark) !important;
      color: white !important;
      font-weight: bold;
      font-size: 15px;
    }

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

    @media print {
      .page { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <!-- Page 1: Cover -->
  <div class="page">
    <header class="header">
      <div class="logo-section">
        <h1>${business.businessName}</h1>
        <p>${business.tagline || 'Generate Your Own Power'}</p>
      </div>
      <div class="contact-stack">
        <strong>MNRE Registered Vendor</strong><br>
        TamilNadu's Trusted Experts<br>
        ${business.phone || '+91 84891 11511'}
      </div>
    </header>

    <div class="cover-hero">
      <h2 class="proposal-title">Project Proposal</h2>
      <div class="tagline">"Let The Sun Pay Your Bills"</div>

      <div class="client-card">
        <div class="client-name">${proposal.clientName}</div>
        <div class="project-location">📍 ${proposal.projectLocation}</div>
        <div style="margin-top: 15px; font-size: 12px; opacity: 0.8;">Date: ${formatDate(proposal.date)}</div>
      </div>

      <div class="spec-highlight">
        <div class="spec-box">
          <h3>${proposal.plantCapacity} kW</h3>
          <span>Plant Capacity</span>
        </div>
        <div class="spec-box">
          <h3>${proposal.projectType.replace(' Solar', '')}</h3>
          <span>System Type</span>
        </div>
      </div>

      <div style="margin-top: 50px; padding: 0 40px; color: #555;">
        <p><strong>Thank you for the opportunity.</strong></p>
        <p>We have prepared a competitive, high-performance proposal tailored specifically to your energy needs.</p>
      </div>
    </div>

    <footer class="footer">
      <span>${business.website || 'www.solarcaptures.com'}</span>
      <span>Page 01</span>
      <span>${business.email || 'admin@solarcaptures.com'}</span>
    </footer>
  </div>

  <!-- Page 2: Investment Proposal -->
  <div class="page">
    <header class="header">
      <div class="logo-section">
        <h1>${business.businessName}</h1>
      </div>
      <div class="contact-stack">
        84891 11511<br>044 2999 3999
      </div>
    </header>

    <h2 class="section-title">Investment Proposal: ${proposal.roofType}</h2>

    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Description</th>
          <th style="width: 25%;">Price Per KW</th>
          <th style="width: 25%;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Design, Supply, Installation & commissioning of <strong>${proposal.plantCapacity}KW Solar panels</strong> above the roofsheet including all materials.</td>
          <td>${formatCurrency(proposal.pricePerKW)}</td>
          <td class="price-highlight">${formatCurrency(proposal.amount)}</td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: right;">GST (${proposal.gstRate}%)</td>
          <td>${formatCurrency(proposal.gstAmount)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="text-align: right;">TOTAL PROJECT COST</td>
          <td>₹ ${formatCurrency(proposal.totalAmount)}</td>
        </tr>
      </tbody>
    </table>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
      <div>
        <h3 style="font-size: 14px; color: #0056b3; margin-bottom: 10px;">Payment Schedule</h3>
        <ul style="list-style: none; font-size: 13px;">
          <li style="margin-bottom: 10px; padding-left: 15px; border-left: 3px solid #00c853;">
            <strong>${proposal.advancePercent}% Advance</strong><br>
            <span style="color: #666;">Along with Order Confirmation</span>
          </li>
          <li style="padding-left: 15px; border-left: 3px solid #00c853;">
            <strong>${proposal.balancePercent}% Balance</strong><br>
            <span style="color: #666;">After Installation Completion</span>
          </li>
        </ul>
      </div>

      <div>
        <h3 style="font-size: 14px; color: #0056b3; margin-bottom: 10px;">Banking Information</h3>
        <div class="bank-card">
          <div><strong>Name:</strong><br>${business.bankDetails?.accountName || 'IC SOLAR CAPTURES'}</div>
          <div><strong>Bank:</strong><br>${business.bankDetails?.bankName || 'FEDERAL BANK'}</div>
          <div><strong>A/C No:</strong><br>${business.bankDetails?.accountNumber || '23900200007536'}</div>
          <div><strong>IFSC:</strong><br>${business.bankDetails?.ifscCode || 'FDRL0002390'}</div>
        </div>
        <div style="font-size: 11px; margin-top: 5px; text-align: right; color: #666;">GST: ${business.gstNumber || '33AAICI2217E2Z1'}</div>
      </div>
    </div>

    <footer class="footer">
      <span>${business.website || 'www.solarcaptures.com'}</span>
      <span>Page 02</span>
      <span>${business.email || 'admin@solarcaptures.com'}</span>
    </footer>
  </div>

  <!-- Page 3: Bill of Materials -->
  <div class="page">
    <header class="header">
      <div class="logo-section">
        <h1>${business.businessName}</h1>
      </div>
      <div class="contact-stack">
        84891 11511<br>044 2999 3999
      </div>
    </header>

    <h2 class="section-title">Bill of Materials & Warranty</h2>

    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Specification</th>
          <th>Warranty Coverage</th>
        </tr>
      </thead>
      <tbody>
        ${materialsRows}
      </tbody>
    </table>

    <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; font-size: 13px; color: #003d80;">
      <strong>Note:</strong> We use top-tier brands like Axitec, Deye, and Polycab to ensure maximum efficiency for your plant.
    </div>

    <footer class="footer">
      <span>${business.website || 'www.solarcaptures.com'}</span>
      <span>Page 03</span>
      <span>${business.email || 'admin@solarcaptures.com'}</span>
    </footer>
  </div>

  <!-- Page 4: Financial & Environmental Impact -->
  <div class="page">
    <header class="header">
      <div class="logo-section">
        <h1>${business.businessName}</h1>
      </div>
      <div class="contact-stack">
        84891 11511<br>044 2999 3999
      </div>
    </header>

    <h2 class="section-title">Financial & Environmental Impact</h2>

    <div style="margin-bottom: 20px;">
      <p><strong>The Strategy:</strong> With an installed cost of ${(proposal.totalAmount / 100000).toFixed(2)} Lakh, your electricity bills will be virtually eliminated. Your simple payback period is between <strong>${proposal.roi.paybackPeriodMin} to ${proposal.roi.paybackPeriodMax} years</strong>.</p>
      <p>After this short payback period, you will enjoy <strong>free electricity for decades</strong>.</p>
    </div>

    <div class="impact-grid">
      <div class="impact-card">
        <span class="label">Total Savings (22 Yrs)</span>
        <span class="value" style="color: #0056b3;">₹ ${(proposal.roi.totalSavings25Years / 100000).toFixed(1)} L</span>
        <span class="label">Estimated Returns</span>
      </div>
      <div class="impact-card">
        <span class="label">Environmental Impact</span>
        <span class="value" style="color: #2e7d32;">${proposal.roi.treesEquivalent} Trees</span>
        <span class="label">Planted Equivalent</span>
      </div>
      <div class="impact-card">
        <span class="label">Carbon Reduction</span>
        <span class="value" style="color: #555;">${proposal.roi.co2EliminatedTotal} Tons</span>
        <span class="label">CO2 Eliminated</span>
      </div>
    </div>

    <div style="background: #f8fbff; padding: 20px; border-radius: 8px; margin-top: 20px;">
      <h3 style="font-size: 16px; margin-bottom: 10px; color: #0056b3;">Technical Performance</h3>
      <ul style="list-style: none;">
        <li style="margin-bottom: 8px;">⚡ <strong>Annual Generation:</strong> ${formatCurrency(proposal.roi.energyGenerationPerYear)} kWh/year</li>
        <li style="margin-bottom: 8px;">🌍 <strong>Annual CO2 Avoided:</strong> ${proposal.roi.co2SavingsPerYear} tonnes</li>
        <li>📅 <strong>Payback Time:</strong> ${proposal.roi.paybackPeriodMin} to ${proposal.roi.paybackPeriodMax} years</li>
      </ul>
    </div>

    <div class="quote-box">
      "Eliminate your EB bills with ${business.businessName.toUpperCase()} and start saving from day one.<br>
      Invest once, enjoy free electricity for 25+ years."
    </div>

    <footer class="footer">
      <span>${business.website || 'www.solarcaptures.com'}</span>
      <span>Page 04</span>
      <span>${business.email || 'admin@solarcaptures.com'}</span>
    </footer>
  </div>

  <!-- Page 5: Terms & Conditions -->
  <div class="page">
    <header class="header">
      <div class="logo-section">
        <h1>${business.businessName}</h1>
      </div>
      <div class="contact-stack">
        84891 11511<br>044 2999 3999
      </div>
    </header>

    <h2 class="section-title">Terms & Conditions</h2>

    <div style="font-size: 13px; color: #444;">
      <ul style="padding-left: 20px; line-height: 2;">
        ${termsItems}
      </ul>
    </div>

    <div style="margin-top: 60px; text-align: center;">
      <p style="font-size: 16px; font-weight: bold;">Thank you, awaiting your favorable order.</p>
      <div style="margin-top: 40px; border-top: 2px solid #ddd; width: 200px; margin-left: auto; margin-right: auto; padding-top: 10px;">
        Authorized Signatory
      </div>
    </div>

    <footer class="footer">
      <span>${business.website || 'www.solarcaptures.com'}</span>
      <span>Page 05</span>
      <span>${business.email || 'admin@solarcaptures.com'}</span>
    </footer>
  </div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Fetch proposal
    const proposal = await Proposal.findOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Fetch user business details
    const user = await User.findOne({ tenantId: session.user.tenantId });

    const businessDetails = {
      businessName: user?.businessDetails?.businessName || 'Solar Captures',
      tagline: user?.businessDetails?.tagline || 'Generate Your Own Power',
      phone: user?.businessDetails?.phone || '+91 84891 11511',
      email: user?.businessDetails?.email || user?.email || 'admin@solarcaptures.com',
      website: user?.businessDetails?.website || 'www.solarcaptures.com',
      gstNumber: user?.businessDetails?.gstNumber || '33AAICI2217E2Z1',
      bankDetails: user?.businessDetails?.bankDetails || {
        accountName: 'IC SOLAR CAPTURES',
        bankName: 'FEDERAL BANK',
        accountNumber: '23900200007536',
        ifscCode: 'FDRL0002390',
      },
    };

    // Generate HTML
    const html = generateProposalHTML({
      proposalNumber: proposal.proposalNumber,
      date: proposal.date,
      clientName: proposal.clientName,
      projectLocation: proposal.projectLocation,
      plantCapacity: proposal.plantCapacity,
      projectType: proposal.projectType,
      roofType: proposal.roofType,
      pricePerKW: proposal.pricePerKW,
      amount: proposal.amount,
      gstRate: proposal.gstRate,
      gstAmount: proposal.gstAmount,
      totalAmount: proposal.totalAmount,
      advancePercent: proposal.advancePercent,
      balancePercent: proposal.balancePercent,
      materials: proposal.materials || [],
      roi: proposal.roi || {
        energyGenerationPerYear: Math.round(proposal.plantCapacity * 1600),
        co2SavingsPerYear: Math.round(proposal.plantCapacity * 1.3 * 10) / 10,
        paybackPeriodMin: 2.5,
        paybackPeriodMax: 3.5,
        totalSavings25Years: Math.round(proposal.plantCapacity * 1600 * 8 * 22),
        treesEquivalent: Math.round(proposal.plantCapacity * 62),
        co2EliminatedTotal: Math.round(proposal.plantCapacity * 1.3 * 22),
      },
      terms: proposal.terms || [],
    }, businessDetails);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal-${proposal.proposalNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating proposal PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
