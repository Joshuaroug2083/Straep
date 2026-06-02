"use client";

import Link from "next/link";
import { ArrowRight, Zap, Globe, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 backdrop-blur-sm bg-white/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-900">Straep</div>
          <div className="space-x-6 hidden md:flex">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">
              Features
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition">
              Pricing
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition">
              Docs
            </a>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Your brand. Your page.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              Your market. Your growth.
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Build stunning brand pages, run your digital storefront, and manage leads—all in one beautiful platform.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition transform hover:scale-105">
              Get Started Free
              <ArrowRight size={20} />
            </button>
            <button className="border-2 border-slate-300 hover:border-slate-400 text-slate-900 px-8 py-4 rounded-lg font-semibold transition">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          id="features"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Globe className="text-blue-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Brand Pages</h3>
            <p className="text-slate-600 mb-4">
              Create a beautiful, customizable brand page that represents your business. No coding required.
            </p>
            <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
              Learn more <ArrowRight size={16} />
            </a>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="bg-cyan-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-cyan-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Digital Storefront</h3>
            <p className="text-slate-600 mb-4">
              Showcase and sell your products and services directly to customers with built-in shopping features.
            </p>
            <a href="#" className="text-cyan-600 font-semibold hover:text-cyan-700 flex items-center gap-2">
              Learn more <ArrowRight size={16} />
            </a>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1">
            <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="text-purple-600" size={28} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Lead Management</h3>
            <p className="text-slate-600 mb-4">
              Capture, organize, and convert leads with our powerful inquiry management system.
            </p>
            <a href="#" className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-2">
              Learn more <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center mt-20 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
          <p className="mb-8 text-blue-50">
            Join thousands of creators, makers, and business owners using Straep.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            Start your free trial
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Straep</h4>
              <p className="text-sm">Your all-in-one platform for brand, storefront, and lead management.</p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Straep. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
