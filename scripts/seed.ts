import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../src/lib/mongodb';
import User from '../src/models/User';
import Customer from '../src/models/Customer';
import Product from '../src/models/Product';
import Quotation from '../src/models/Quotation';
import Invoice from '../src/models/Invoice';

const TENANT_ID = 'demo-tenant-123';
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    await connectDB();
    console.log('✅ Connected to database');

    // 1. Clear existing demo data
    console.log('🧹 Clearing existing demo data...');
    await User.deleteMany({ email: DEMO_EMAIL });
    await Customer.deleteMany({ tenantId: TENANT_ID });
    await Product.deleteMany({ tenantId: TENANT_ID });
    await Quotation.deleteMany({ tenantId: TENANT_ID });
    await Invoice.deleteMany({ tenantId: TENANT_ID });

    // 2. Create User
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    const user = await User.create({
      email: DEMO_EMAIL,
      password: hashedPassword,
      name: 'Demo Admin',
      tenantId: TENANT_ID,
      businessDetails: {
        businessName: 'NextGen Solutions',
        tagline: 'Innovating the Future',
        gstNumber: '29ABCDE1234F1Z5',
        address: '123 Tech Park, Bangalore, Karnataka 560001',
        phone: '+91 9876543210',
        email: 'billing@nextgensolutions.in',
        website: 'www.nextgensolutions.in'
      }
    });

    // 3. Create Customers
    console.log('👥 Creating customers...');
    const customers = await Customer.insertMany([
      {
        tenantId: TENANT_ID,
        name: 'Acme Corp',
        email: 'contact@acmecorp.com',
        phone: '+1 555-0100',
        address: {
          street: '456 Business Blvd',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        gstNumber: '27XYZAB5678C1Z9'
      },
      {
        tenantId: TENANT_ID,
        name: 'Globex Inc',
        email: 'info@globex.com',
        phone: '+1 555-0200',
        address: {
          street: '789 Enterprise Way',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        }
      }
    ]);

    // 4. Create Products
    console.log('📦 Creating products...');
    const products = await Product.insertMany([
      {
        tenantId: TENANT_ID,
        name: 'Web Development Services',
        description: 'Frontend and Backend development for web applications',
        price: 50000,
        unit: 'project',
        taxRate: 18,
        isActive: true
      },
      {
        tenantId: TENANT_ID,
        name: 'SEO Optimization',
        description: 'Monthly SEO optimization and reporting',
        price: 15000,
        unit: 'month',
        taxRate: 18,
        isActive: true
      },
      {
        tenantId: TENANT_ID,
        name: 'Cloud Hosting',
        description: 'Premium cloud hosting with daily backups',
        price: 5000,
        unit: 'month',
        taxRate: 18,
        isActive: true
      }
    ]);

    // 5. Create Quotation
    console.log('📝 Creating quotations...');
    const quotationTotal = (products[0].price * 1) + (products[1].price * 6);
    const quotationTax = quotationTotal * 0.18;
    
    const quotation = await Quotation.create({
      tenantId: TENANT_ID,
      quotationNumber: 'QT-2026-001',
      customerId: customers[0]._id,
      customerName: customers[0].name,
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      customerAddress: customers[0].address,
      items: [
        {
          productId: products[0]._id,
          productName: products[0].name,
          description: products[0].description,
          quantity: 1,
          unit: products[0].unit,
          price: products[0].price,
          taxRate: products[0].taxRate,
          total: products[0].price * 1
        },
        {
          productId: products[1]._id,
          productName: products[1].name,
          description: products[1].description,
          quantity: 6,
          unit: products[1].unit,
          price: products[1].price,
          taxRate: products[1].taxRate,
          total: products[1].price * 6
        }
      ],
      subtotal: quotationTotal,
      taxAmount: quotationTax,
      total: quotationTotal + quotationTax,
      includeGst: true,
      hideItemPrices: false,
      status: 'accepted',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: 'Thank you for your business.',
      terms: '50% advance payment, 50% on completion.'
    });

    // 6. Create Invoice
    console.log('🧾 Creating invoices...');
    const invoiceTotal = products[0].price * 1;
    const invoiceTax = invoiceTotal * 0.18;

    await Invoice.create({
      tenantId: TENANT_ID,
      invoiceNumber: 'INV-2026-001',
      customerId: customers[0]._id,
      customerName: customers[0].name,
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      customerAddress: customers[0].address,
      items: [
        {
          productId: products[0]._id,
          productName: products[0].name,
          description: 'Initial deposit for ' + products[0].name,
          quantity: 1,
          unit: products[0].unit,
          price: products[0].price,
          taxRate: products[0].taxRate,
          total: products[0].price * 1
        }
      ],
      subtotal: invoiceTotal,
      taxAmount: invoiceTax,
      total: invoiceTotal + invoiceTax,
      includeGst: true,
      status: 'sent',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      notes: 'Detailed milestone breakdown attached separately.',
      terms: 'Please pay within 15 days.',
      quotationId: quotation._id
    });

    console.log('✅ Seeding complete! You can now log in with:');
    console.log('✉️ Email: demo@example.com');
    console.log('🔑 Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
