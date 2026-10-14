import { Head, Link, usePage } from '@inertiajs/react';
import { Download, Mail } from 'lucide-react';

import { withLayout } from '../../layouts/AppLayout.jsx';

export default function LegalShow({ document: doc }) {
  const { legal, company } = usePage().props;

  return (
    <>
      <Head title={doc.title} />
      <div className="border-b-[3px] border-ink bg-lilac-soft">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="pixel text-xs text-pink-deep">Legal</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-6xl">{doc.title}</h1>
          <p className="mt-4 text-sm font-bold text-ink-soft">
            Version {doc.version} · Last updated {doc.effective_date}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {legal.documents.map((d) => (
              <Link key={d.key} href={d.url} className={`chip px-4 py-1.5 ${d.key === doc.key ? 'bg-ink text-cream' : 'shadow-toy-sm hover:-translate-y-0.5'}`}>
                {d.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[250px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="pixel mb-3 text-xs text-ink-muted">On this page</p>
          <nav className="hidden space-y-1 lg:block" aria-label="Table of contents">
            {doc.toc.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="block rounded-lg px-2 py-1 text-sm font-semibold text-ink-soft hover:bg-white hover:text-ink">
                {t.title}
              </a>
            ))}
          </nav>
          <select
            className="input lg:hidden"
            onChange={(e) => {
              if (e.target.value) document.getElementById(e.target.value)?.scrollIntoView({ behavior: 'smooth' });
            }}
            defaultValue=""
            aria-label="Jump to section"
          >
            <option value="">Jump to section...</option>
            {doc.toc.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <div className="mt-6 space-y-2">
            <a href={`/legal/${doc.key}/pdf`} target="_blank" rel="noopener" className="btn btn-secondary btn-sm w-full">
              <Download className="h-4 w-4" /> Download PDF
            </a>
            <a href={`mailto:${company.email}`} className="btn btn-sm w-full border-transparent bg-transparent shadow-none hover:shadow-none">
              <Mail className="h-4 w-4" /> {company.email}
            </a>
          </div>
        </aside>

        <article className="card prose-legal p-6 sm:p-10" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    </>
  );
}

LegalShow.layout = withLayout;
