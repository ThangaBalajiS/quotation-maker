const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB
MONGODB_URI=mongodb://localhost:27017/quotation-maker

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${generateSecret()}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

function generateSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with default configuration');
  console.log('📝 Please update MONGODB_URI if using a different MongoDB connection');
} else {
  console.log('⚠️  .env.local already exists, skipping creation');
}

console.log('\n🚀 Setup complete! Run "npm run dev" to start the development server');
