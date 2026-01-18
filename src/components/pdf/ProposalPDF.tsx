/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Interfaces
interface ProposalMaterial {
  description: string;
  specification: string;
  warranty: string;
}

interface ProposalROI {
  energyGenerationPerYear: number;
  co2SavingsPerYear: number;
  paybackPeriodMin: number;
  paybackPeriodMax: number;
  totalSavings25Years: number;
  treesEquivalent: number;
  co2EliminatedTotal: number;
}

interface ProposalData {
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
  materials: ProposalMaterial[];
  roi: ProposalROI;
  technicalSummary?: string;
  financialSummary?: string;
  terms: string[];
  validUntil: string;
  businessDetails: {
    businessName: string;
    tagline?: string;
    phone?: string;
    landline?: string;
    email?: string;
    website?: string;
    gstNumber?: string;
    logo?: string;
    bankDetails?: {
      accountName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
    };
  };
}

// Color palette - matching the reference design
const colors = {
  primary: '#1a5f2a', // Dark green
  secondary: '#f5a623', // Orange/yellow
  background: '#ffffff',
  lightGray: '#f5f5f5',
  darkGray: '#333333',
  border: '#000000',
  gradientStart: '#f5d98a',
  gradientEnd: '#f5a623',
};

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.background,
    padding: 25,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  // Page border
  pageBorder: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
  },
  pageContent: {
    flex: 1,
    padding: 20,
  },
  
  // Header styles (consistent across all pages)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 15,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: 6,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 12,
    color: colors.secondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  contactSection: {
    alignItems: 'flex-end',
  },
  contactText: {
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: 4,
  },
  
  // Footer styles (consistent across all pages)
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    right: 25,
    backgroundColor: colors.primary,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.background,
    marginHorizontal: 15,
  },
  
  // Cover page styles
  coverTagline: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 8,
    color: colors.darkGray,
  },
  coverSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.darkGray,
  },
  mnreBadge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.darkGray,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 25,
  },
  mnreText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  mnreBold: {
    fontWeight: 'bold',
  },
  proposalForSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  proposalForTitle: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGray,
    paddingBottom: 8,
    marginBottom: 20,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  dateText: {
    fontSize: 13,
    color: colors.darkGray,
  },
  introText: {
    fontSize: 12,
    color: colors.darkGray,
    lineHeight: 1.6,
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  specsCard: {
    backgroundColor: colors.gradientStart,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 40,
    marginTop: 15,
  },
  specItem: {
    fontSize: 13,
    color: colors.darkGray,
    marginBottom: 8,
  },
  specLabel: {
    fontWeight: 'bold',
  },
  
  // Pricing page styles
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 25,
    textDecoration: 'underline',
  },
  pricingTable: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    padding: 10,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    padding: 10,
    fontSize: 10,
    textAlign: 'center',
  },
  col1: { width: '45%', borderRightWidth: 1, borderRightColor: colors.border },
  col2: { width: '25%', borderRightWidth: 1, borderRightColor: colors.border },
  col3: { width: '30%' },
  gstRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.lightGray,
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: colors.gradientStart,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.darkGray,
  },
  paymentSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paymentItem: {
    fontSize: 11,
    marginLeft: 12,
    marginBottom: 5,
  },
  accountBox: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 20,
  },
  accountTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: colors.lightGray,
    padding: 8,
    marginTop: -12,
    marginHorizontal: -12,
    marginBottom: 12,
  },
  accountItem: {
    fontSize: 11,
    marginBottom: 5,
  },
  
  // Bill of Materials styles
  bomTable: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bomCol1: { width: '25%', borderRightWidth: 1, borderRightColor: colors.border },
  bomCol2: { width: '45%', borderRightWidth: 1, borderRightColor: colors.border },
  bomCol3: { width: '30%' },
  
  // ROI page styles
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 11,
    color: colors.darkGray,
    lineHeight: 1.6,
  },
  roiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    textDecoration: 'underline',
  },
  roiTable: {
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 25,
  },
  roiRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roiLabel: {
    width: '50%',
    padding: 12,
    fontSize: 11,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.lightGray,
  },
  roiValue: {
    width: '50%',
    padding: 12,
    fontSize: 11,
    textAlign: 'center',
  },
  quoteBox: {
    backgroundColor: colors.gradientStart,
    padding: 20,
    borderRadius: 8,
    marginTop: 25,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    color: colors.darkGray,
    marginBottom: 8,
  },
  
  // Terms page styles
  termsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 25,
    textDecoration: 'underline',
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 25,
  },
  bullet: {
    fontSize: 12,
    marginRight: 10,
    color: colors.darkGray,
  },
  termText: {
    fontSize: 12,
    color: colors.darkGray,
    flex: 1,
    lineHeight: 1.5,
  },
  termIndent: {
    marginLeft: 25,
    marginTop: 5,
    marginBottom: 5,
  },
  thankYouSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  awaitingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
});

// Helper functions
const formatCurrency = (amount: number) => {
  return `₹ ${amount.toLocaleString('en-IN')}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day} - ${month} - ${year}`;
};

// Header Component (reused across all pages)
const Header: React.FC<{ businessDetails: ProposalData['businessDetails'] }> = ({ businessDetails }) => (
  <View style={styles.header}>
    <View style={styles.logoSection}>
      {businessDetails.logo && (
        <Image style={styles.logo} src={businessDetails.logo} />
      )}
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{businessDetails.businessName}</Text>
        {businessDetails.tagline && (
          <Text style={styles.tagline}>{businessDetails.tagline}</Text>
        )}
      </View>
    </View>
    <View style={styles.contactSection}>
      {businessDetails.phone && (
        <Text style={styles.contactText}>Mobile- {businessDetails.phone}</Text>
      )}
      {businessDetails.landline && (
        <Text style={styles.contactText}>☎ {businessDetails.landline}</Text>
      )}
    </View>
  </View>
);

// Footer Component (reused across all pages)
const Footer: React.FC<{ businessDetails: ProposalData['businessDetails'] }> = ({ businessDetails }) => (
  <View style={styles.footer}>
    {businessDetails.email && (
      <Text style={styles.footerText}>Email- {businessDetails.email}</Text>
    )}
    <Text style={styles.footerText}>|</Text>
    {businessDetails.website && (
      <Text style={styles.footerText}>{businessDetails.website}</Text>
    )}
  </View>
);

// Page 1: Cover Page
const CoverPage: React.FC<{ data: ProposalData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageBorder} />
    <View style={styles.pageContent}>
      <Header businessDetails={data.businessDetails} />
      
      {/* Tagline */}
      <Text style={styles.coverTagline}>{`"Let The Sun Pay Your Bills"`}</Text>
      <Text style={styles.coverSubtitle}>{`TamilNadu's Trusted Solar Experts`}</Text>
      
      {/* MNRE Badge */}
      <View style={styles.mnreBadge}>
        <Text style={styles.mnreText}>
          <Text style={styles.mnreBold}>MNRE</Text> Registered Vendor
        </Text>
      </View>
      
      {/* Project Proposal For */}
      <View style={styles.proposalForSection}>
        <Text style={styles.proposalForTitle}>Project Proposal for,</Text>
        <View style={styles.clientRow}>
          <Text style={styles.clientName}>{data.clientName}</Text>
          <Text style={styles.dateText}>Date : {formatDate(data.date)}</Text>
        </View>
      </View>
      
      {/* Introduction Text */}
      <Text style={styles.introText}>
        Thank you for giving an opportunity to work with you. Following our recent discussion, 
        we have prepared a well-structured, competitive, and attractive proposal tailored to your requirements.
      </Text>
      
      {/* Project Specs Card */}
      <View style={styles.specsCard}>
        <Text style={styles.specItem}>
          <Text style={styles.specLabel}>Plant Capacity - </Text>
          {data.plantCapacity} Kw
        </Text>
        <Text style={styles.specItem}>{data.projectType}</Text>
        <Text style={styles.specItem}>
          <Text style={styles.specLabel}>Location : </Text>
          {data.projectLocation}
        </Text>
      </View>
    </View>
    <Footer businessDetails={data.businessDetails} />
  </Page>
);

// Page 2: Pricing Page
const PricingPage: React.FC<{ data: ProposalData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageBorder} />
    <View style={styles.pageContent}>
      <Header businessDetails={data.businessDetails} />
      
      <Text style={styles.pageTitle}>PROPOSAL - {data.roofType.toUpperCase()}</Text>
      
      {/* Pricing Table */}
      <View style={styles.pricingTable}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.col1]}>
            Charges for Specialized contract{'\n'}inclusive of Materials, Labor, Tools
          </Text>
          <Text style={[styles.tableHeaderCell, styles.col2]}>Price Per KW</Text>
          <Text style={[styles.tableHeaderCell, styles.col3]}>Amount</Text>
        </View>
        
        {/* Content Row */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.col1]}>
            Design, Supply, Installation &{'\n'}commissioning of {data.plantCapacity}KW Solar panels{'\n'}
            above the roofsheet with including all{'\n'}materials.
          </Text>
          <Text style={[styles.tableCell, styles.col2]}>{formatCurrency(data.pricePerKW)}</Text>
          <Text style={[styles.tableCell, styles.col3]}>{formatCurrency(data.amount)}</Text>
        </View>
        
        {/* GST Row */}
        <View style={styles.gstRow}>
          <Text style={[styles.tableCell, styles.col1]}></Text>
          <Text style={[styles.tableCell, styles.col2]}>GST {data.gstRate}%</Text>
          <Text style={[styles.tableCell, styles.col3]}>{formatCurrency(data.gstAmount)}</Text>
        </View>
        
        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={[styles.tableCell, styles.col1]}></Text>
          <Text style={[styles.tableCell, styles.col2, styles.totalLabel]}>Total Amount</Text>
          <Text style={[styles.tableCell, styles.col3, styles.totalValue]}>{formatCurrency(data.totalAmount)}</Text>
        </View>
      </View>
      
      {/* Payment Terms */}
      <View style={styles.paymentSection}>
        <Text style={styles.paymentTitle}>Payment terms *</Text>
        <Text style={styles.paymentItem}>• {data.advancePercent}% advance along with Order Confirmation.</Text>
        <Text style={styles.paymentItem}>• {data.balancePercent}% After Installation completion.</Text>
        {data.paymentTermsNotes && (
          <Text style={styles.paymentItem}>• {data.paymentTermsNotes}</Text>
        )}
      </View>
      
      {/* Account Details */}
      <View style={styles.accountBox}>
        <Text style={styles.accountTitle}>Account details</Text>
        {data.businessDetails.bankDetails?.accountName && (
          <Text style={styles.accountItem}>Account Name : {data.businessDetails.bankDetails.accountName}</Text>
        )}
        {data.businessDetails.bankDetails?.bankName && (
          <Text style={styles.accountItem}>Bank Name : {data.businessDetails.bankDetails.bankName}</Text>
        )}
        {data.businessDetails.bankDetails?.accountNumber && (
          <Text style={styles.accountItem}>Account Number : {data.businessDetails.bankDetails.accountNumber}</Text>
        )}
        {data.businessDetails.bankDetails?.ifscCode && (
          <Text style={styles.accountItem}>IFSC Code : {data.businessDetails.bankDetails.ifscCode}</Text>
        )}
        {data.businessDetails.gstNumber && (
          <Text style={styles.accountItem}>GST Number : {data.businessDetails.gstNumber}</Text>
        )}
      </View>
    </View>
    <Footer businessDetails={data.businessDetails} />
  </Page>
);

// Page 3: Bill of Materials
const BillOfMaterialsPage: React.FC<{ data: ProposalData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageBorder} />
    <View style={styles.pageContent}>
      <Header businessDetails={data.businessDetails} />
      
      <Text style={styles.pageTitle}>Bill of Materials</Text>
      
      {/* Materials Table */}
      <View style={styles.bomTable}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.bomCol1]}>DESCRIPTION</Text>
          <Text style={[styles.tableHeaderCell, styles.bomCol2]}>SPECIFICATION</Text>
          <Text style={[styles.tableHeaderCell, styles.bomCol3]}>WARRANTY{'\n'}(from the date of invoice)</Text>
        </View>
        
        {/* Material Rows */}
        {data.materials.map((material, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.bomCol1]}>{material.description}</Text>
            <Text style={[styles.tableCell, styles.bomCol2]}>{material.specification}</Text>
            <Text style={[styles.tableCell, styles.bomCol3]}>{material.warranty}</Text>
          </View>
        ))}
      </View>
    </View>
    <Footer businessDetails={data.businessDetails} />
  </Page>
);

// Page 4: ROI Page
const ROIPage: React.FC<{ data: ProposalData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageBorder} />
    <View style={styles.pageContent}>
      <Header businessDetails={data.businessDetails} />
      
      {/* Technical & Environmental */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Technical & Environmental :</Text>
        <Text style={styles.summaryText}>
          {data.technicalSummary || 
            `The ${data.plantCapacity} KW rooftop solar system is estimated to generate - ${data.roi.energyGenerationPerYear.toLocaleString()} kWh/year, avoiding - ${data.roi.co2SavingsPerYear} tonnes of CO₂ annually.`
          }
        </Text>
      </View>
      
      {/* Financial Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Financial summary :</Text>
        <Text style={styles.summaryText}>
          {data.financialSummary || 
            `With an installed cost of ${formatCurrency(data.totalAmount / 100000)} Lakh (${formatCurrency(data.pricePerKW)}/kW), your electricity costs can be eliminated, typical simple payback is between ${data.roi.paybackPeriodMin} to ${data.roi.paybackPeriodMax} years depending on the tariff. After payback, enjoy effectively free electricity for decades.`
          }
        </Text>
      </View>
      
      {/* ROI Title */}
      <Text style={styles.roiTitle}>Return On Investment (ROI)</Text>
      
      {/* ROI Table */}
      <View style={styles.roiTable}>
        <View style={styles.roiRow}>
          <Text style={styles.roiLabel}>Emi Period</Text>
          <Text style={styles.roiValue}>{data.roi.paybackPeriodMin} to {data.roi.paybackPeriodMax} years</Text>
        </View>
        <View style={styles.roiRow}>
          <Text style={styles.roiLabel}>Total Financial Savings For 22 years</Text>
          <Text style={styles.roiValue}>{formatCurrency(data.roi.totalSavings25Years)}/-</Text>
        </View>
        <View style={[styles.roiRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.roiLabel}>Planted Around</Text>
          <Text style={styles.roiValue}>
            <Text style={{ fontWeight: 'bold' }}>{data.roi.treesEquivalent}</Text> Trees Which Eliminates {data.roi.co2EliminatedTotal} tonnes of CO2
          </Text>
        </View>
      </View>
      
      {/* Quote Box */}
      <View style={styles.quoteBox}>
        <Text style={styles.quoteText}>
          {`"Eliminate your EB bills with ${data.businessDetails.businessName} and start saving from day one."`}
        </Text>
        <Text style={styles.quoteText}>
          {`"Invest once, enjoy free electricity for 25+ years."`}
        </Text>
      </View>
    </View>
    <Footer businessDetails={data.businessDetails} />
  </Page>
);

// Page 5: Terms and Conditions
const TermsPage: React.FC<{ data: ProposalData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.pageBorder} />
    <View style={styles.pageContent}>
      <Header businessDetails={data.businessDetails} />
      
      <Text style={styles.termsTitle}>TERMS AND CONDITIONS</Text>
      
      {/* Terms List */}
      {data.terms.map((term, index) => {
        // Check if term contains sub-items (starts with indent markers)
        if (term.includes('\n')) {
          const lines = term.split('\n');
          return (
            <View key={index}>
              <View style={styles.termItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.termText}>{lines[0]}</Text>
              </View>
              {lines.slice(1).map((subLine, subIndex) => (
                <View key={subIndex} style={[styles.termItem, styles.termIndent]}>
                  <Text style={styles.termText}>{subLine}</Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <View key={index} style={styles.termItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.termText}>{term}</Text>
          </View>
        );
      })}
      
      {/* Thank You Section */}
      <View style={styles.thankYouSection}>
        <Text style={styles.thankYouText}>Thank you,</Text>
        <Text style={styles.awaitingText}>Awaiting your favorable order</Text>
      </View>
    </View>
    <Footer businessDetails={data.businessDetails} />
  </Page>
);

// Main ProposalPDF Component
const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
  return (
    <Document>
      <CoverPage data={data} />
      <PricingPage data={data} />
      <BillOfMaterialsPage data={data} />
      <ROIPage data={data} />
      <TermsPage data={data} />
    </Document>
  );
};

export default ProposalPDF;
