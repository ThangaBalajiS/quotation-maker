'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Package, FileText, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-300/40 mix-blend-multiply blur-3xl" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-300/40 mix-blend-multiply blur-3xl" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-300/40 mix-blend-multiply blur-3xl" />
        {/* Subtle grid pattern pattern overlaid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navigation (Optional minimalist header could go here) */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
          T10i Quotes
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/signin">
            <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 font-medium">
              Log In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 font-medium shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 shadow-sm">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span>The modern way to bill clients</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
            Create professional <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">quotations & invoices</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Replace messy spreadsheets. Build brilliant proposals, manage your product catalog, and impress your clients in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg" className="group rounded-full px-8 py-6 bg-indigo-600 hover:bg-violet-700 text-white text-lg font-medium shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-violet-200 hover:-translate-y-1 transition-all duration-300">
                Start for free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg font-medium border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300">
                See how it works
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid (Glassmorphism) */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="group bg-white/60 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-transparent opacity-50 rounded-bl-full -z-10"></div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Manage Customers</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Keep a smart Rolodex of all your clients. Access detailed contact information and rich business history with a single click.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/60 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100 to-transparent opacity-50 rounded-bl-full -z-10"></div>
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Product Catalog</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Maintain a comprehensive database of your services and products. Instantly pull pricing, descriptions, and tax data into any quote.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/60 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent opacity-50 rounded-bl-full -z-10"></div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Instant PDFs</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Generate stunning, professional PDF documents perfectly formatted for your brand. Share directly to clients and close deals faster.
            </p>
          </div>
        </div>

        {/* Trust Banner Below Cards */}
        <div className="mt-20 flex justify-center items-center gap-2 text-slate-500 font-medium">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>Secure, isolated, and multi-tenant workspaces.</span>
        </div>
      </div>
    </div>
  );
}
