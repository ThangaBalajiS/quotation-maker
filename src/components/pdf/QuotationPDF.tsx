/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

interface QuotationItem {
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  total: number;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  customerName: string;
  customerAddress?: string;
  workDescription?: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  hideItemPrices?: boolean;
  brandImages?: string[];
  businessDetails: {
    businessName: string;
    contactPerson?: string;
    address?: string;
    phone?: string;
    email?: string;
    gstNumber?: string;
    logo?: string;
    signature?: string;
    bankDetails?: {
      accountName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      branch?: string;
    };
  };
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logoSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '30%',
  },
  companySection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '60%',
  },
  logo: {
    width: 80,
    height: 60,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  contactPerson: {
    fontSize: 12,
    marginBottom: 3,
  },
  address: {
    fontSize: 10,
    marginBottom: 3,
    color: '#666',
  },
  slogan: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 9,
    marginBottom: 2,
    color: '#666',
  },
  gstInfo: {
    fontSize: 9,
    marginTop: 5,
    fontWeight: 'bold',
  },
  quotationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'right',
  },
  quotationDetails: {
    alignItems: 'flex-end',
    width: '40%',
  },
  quotationNumber: {
    fontSize: 12,
    marginBottom: 5,
  },
  quotationDate: {
    fontSize: 12,
  },
  customerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  customerAddress: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5,
  },
  workDescription: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  col1: { width: '8%' },
  col2: { width: '50%' },
  col3: { width: '12%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  itemDescription: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  summaryBox: {
    width: '40%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    backgroundColor: '#e0e7ff',
    padding: 5,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  paymentSection: {
    width: '45%',
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paymentInfo: {
    fontSize: 9,
    marginBottom: 3,
    color: '#374151',
  },
  signatureSection: {
    width: '45%',
    alignItems: 'flex-end',
  },
  signatureText: {
    fontSize: 9,
    marginBottom: 20,
    color: '#374151',
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: '#000',
    marginBottom: 5,
  },
  signatureImage: {
    width: 120,
    height: 60,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6b7280',
  },
  brandImagesSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  brandImagesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
  },
  brandImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandImage: {
    width: 100,
    height: 100,
    objectFit: 'contain',
  },
});

const QuotationPDF: React.FC<{ data: QuotationData }> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    // Use a simple format that works reliably in PDFs
    return `Rs. ${amount.toFixed(2)}`;
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>{data.businessDetails.businessName}</Text>
            {data.businessDetails.contactPerson && (
              <Text style={styles.contactPerson}>{data.businessDetails.contactPerson}</Text>
            )}
            {data.businessDetails.address && (
              <Text style={styles.address}>{data.businessDetails.address}</Text>
            )}
            {data.businessDetails.phone && (
              <Text style={styles.contactInfo}>PH: {data.businessDetails.phone}</Text>
            )}
            {data.businessDetails.email && (
              <Text style={styles.contactInfo}>EMAIL: {data.businessDetails.email}</Text>
            )}
            {data.businessDetails.gstNumber && (
              <Text style={styles.gstInfo}>GSTIN: {data.businessDetails.gstNumber}</Text>
            )}
          </View>
          <View style={styles.logoSection}>
            {data.businessDetails.logo && (
              <Image 
                style={styles.logo} 
                src={data.businessDetails.logo} 
              />
            )}
            <Text style={styles.quotationTitle}>Quotation</Text>
            <Text style={styles.quotationNumber}>Quotation#: {data.quotationNumber}</Text>
            <Text style={styles.quotationDate}>Date: {formatDate(data.date)}</Text>
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>To,</Text>
          {data.workDescription && (
            <Text style={styles.workDescription}>{data.workDescription}</Text>
          )}
          <Text style={styles.customerName}>{data.customerName}</Text>
          {data.customerAddress && (
            <Text style={styles.customerAddress}>{data.customerAddress}</Text>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderCell, data.hideItemPrices ? { width: '75%' } : styles.col2]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderCell, data.hideItemPrices ? { width: '17%' } : styles.col3]}>QTY</Text>
            {!data.hideItemPrices && (
              <>
                <Text style={[styles.tableHeaderCell, styles.col4]}>PRICE</Text>
                <Text style={[styles.tableHeaderCell, styles.col5]}>TOTAL</Text>
              </>
            )}
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
              <View style={data.hideItemPrices ? { width: '75%' } : styles.col2}>
                <Text style={styles.tableCell}>{item.productName}</Text>
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.tableCell, data.hideItemPrices ? { width: '17%' } : styles.col3]}>{item.quantity} {item.unit}</Text>
              {!data.hideItemPrices && (
                <>
                  <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(item.price)}</Text>
                  <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(item.total)}</Text>
                </>
              )}
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>SUB TOTAL:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(data.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18.00%):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(data.taxAmount)}</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 10 }]}>
              <Text style={styles.grandTotal}>GRAND TOTAL: {formatCurrency(data.total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Payment Instructions</Text>
            <Text style={styles.paymentInfo}>Acc. Name: {data.businessDetails.bankDetails?.accountName || data.businessDetails.businessName}</Text>
            {data.businessDetails.bankDetails?.accountNumber && (
              <Text style={styles.paymentInfo}>Acc No: {data.businessDetails.bankDetails.accountNumber}</Text>
            )}
            {data.businessDetails.bankDetails?.ifscCode && (
              <Text style={styles.paymentInfo}>IFSC Code: {data.businessDetails.bankDetails.ifscCode}</Text>
            )}
            {data.businessDetails.bankDetails?.bankName && (
              <Text style={styles.paymentInfo}>Bank: {data.businessDetails.bankDetails.bankName}</Text>
            )}
            {data.businessDetails.bankDetails?.branch && (
              <Text style={styles.paymentInfo}>Branch: {data.businessDetails.bankDetails.branch}</Text>
            )}
          </View>
          <View style={styles.signatureSection}>
            <Text style={styles.signatureText}>
              For, {data.businessDetails.businessName}
            </Text>
            {data.businessDetails.signature ? (
              <Image 
                style={styles.signatureImage} 
                src={data.businessDetails.signature} 
              />
            ) : (
              <View style={styles.signatureLine} />
            )}
            <Text style={styles.signatureLabel}>AUTHORIZED SIGNATURE</Text>
          </View>
        </View>

        {/* Brand Images Section */}
        {data.brandImages && data.brandImages.length > 0 && (
          <View style={styles.brandImagesSection}>
            <Text style={styles.brandImagesTitle}>Our Work</Text>
            <View style={styles.brandImagesGrid}>
              {data.brandImages.map((imageUrl, index) => (
                <Image
                  key={index}
                  style={styles.brandImage}
                  src={imageUrl}
                />
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default QuotationPDF;
