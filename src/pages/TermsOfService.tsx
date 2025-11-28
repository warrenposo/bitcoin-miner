import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400">Terms of Service</h1>
        <div className="space-y-6 text-white/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using BTCMining ("we", "us", or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on BTCMining's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on BTCMining's website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Mining Services</h2>
            <p>
              BTCMining provides cloud mining services for cryptocurrency. By using our services, you acknowledge that:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Cryptocurrency mining involves risk and may result in losses</li>
              <li>Mining rewards are not guaranteed and depend on network conditions</li>
              <li>We reserve the right to modify mining plans and terms at any time</li>
              <li>All mining activities are subject to applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Provide accurate and complete information when creating an account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Payments and Refunds</h2>
            <p>
              All payments for mining services are final. Refunds may be considered on a case-by-case basis at our sole discretion. Deposits and withdrawals are subject to processing fees and may take time to process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Limitation of Liability</h2>
            <p>
              In no event shall BTCMining or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BTCMining's website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Revisions and Errata</h2>
            <p>
              The materials appearing on BTCMining's website could include technical, typographical, or photographic errors. BTCMining does not warrant that any of the materials on its website are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at btcminingbase@gmail.com
            </p>
          </section>

          <section className="pt-4 border-t border-white/10">
            <p className="text-sm text-white/60">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;

