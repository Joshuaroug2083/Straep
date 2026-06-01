'use client';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Straep
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8">
            Your brand. Your page. Your market. Your growth.
          </p>
          <p className="text-lg text-slate-400 mb-12">
            The all-in-one platform for brands to build pages, manage inventory, capture leads, and grow their business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
              Get Started
            </button>
            <button className="border-2 border-slate-400 hover:border-slate-300 text-slate-300 hover:text-white font-bold py-3 px-8 rounded-lg transition">
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2">Brand Pages</h3>
              <p className="text-slate-400">Create beautiful, customizable brand pages in minutes</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2">Digital Storefront</h3>
              <p className="text-slate-400">Showcase and sell your products and services</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2">Lead Management</h3>
              <p className="text-slate-400">Capture and manage customer inquiries effortlessly</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
