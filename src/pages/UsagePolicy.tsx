import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const UsagePolicy = () => {
  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400">Usage Policy</h1>
        <div className="space-y-6 text-white/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptable Use</h2>
            <p>
              BTCMining provides cloud mining services for legitimate cryptocurrency mining purposes. Users are expected to use our platform in a responsible and lawful manner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Prohibited Activities</h2>
            <p>The following activities are strictly prohibited:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Using the service for any illegal activities</li>
              <li>Attempting to hack, breach, or compromise system security</li>
              <li>Creating multiple accounts to circumvent limits or restrictions</li>
              <li>Using automated scripts or bots without authorization</li>
              <li>Interfering with or disrupting the service or servers</li>
              <li>Impersonating any person or entity</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Account Responsibilities</h2>
            <p>Users are responsible for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Maintaining the security of their account credentials</li>
              <li>All activities that occur under their account</li>
              <li>Ensuring their account information is accurate and up-to-date</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Service Limitations</h2>
            <p>
              We reserve the right to limit, suspend, or terminate accounts that violate this policy. We may also implement usage limits to ensure fair access to our services for all users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the BTCMining platform are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Modifications to Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of our service at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Contact Information</h2>
            <p>
              For questions about this Usage Policy, please contact us at [email protected]
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

export default UsagePolicy;

