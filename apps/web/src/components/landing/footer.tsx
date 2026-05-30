import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">EduAI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              The AI-powered educational platform for the modern world. Learn smarter, teach better.
            </p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Changelog'] },
            { title: 'Roles', links: ['Teachers', 'Students', 'Parents', 'Institutions'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">&copy; 2025 EduAI Platform. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <Link key={item} href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
