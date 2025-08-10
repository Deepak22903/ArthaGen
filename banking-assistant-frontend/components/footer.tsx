import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Bank of Maharashtra</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              A leading public sector bank committed to providing innovative banking solutions powered by advanced AI
              technology for enhanced customer experience.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-200">Banking Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Personal Banking
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Business Banking
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Loans & Credit
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Investment Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-200">Support & Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Branch Locator
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Security Center
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Administrative Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-200">Legal & Compliance</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Regulatory Compliance
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Data Protection
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Bank of Maharashtra. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Powered by ArthaGen AI Technology</p>
        </div>
      </div>
    </footer>
  )
}
