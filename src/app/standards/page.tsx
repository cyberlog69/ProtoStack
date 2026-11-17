import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Compass, FileText, Search, ShieldAlert, Waypoints } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to read an RFC',
  description:
    'A practical guide to internet standards: document statuses, the meaning of MUST and SHOULD, the anatomy of an RFC, and how to check updates and errata.',
  alternates: { canonical: '/standards' },
};

const STATUSES = [
  {
    name: 'Standards Track',
    detail:
      'Proposed Standard → Internet Standard. A Proposed Standard is stable enough to implement; Internet Standard is the maturity level after widespread deployment. Most protocols you meet are Proposed Standards.',
    tone: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/5',
  },
  {
    name: 'Best Current Practice (BCP)',
    detail:
      'Operational and process requirements rather than a wire protocol. BCP 14 defines the MUST/SHOULD keywords, for example.',
    tone: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/5',
  },
  {
    name: 'Informational',
    detail:
      'Published for the record. It may describe a vendor protocol or a good idea; it is not a standard and does not oblige anyone to implement it.',
    tone: 'text-indigo-300 border-indigo-500/30 bg-indigo-500/5',
  },
  {
    name: 'Experimental',
    detail:
      'Proposed for experimentation, not recommended for production. Useful when reading research or early deployments.',
    tone: 'text-amber-300 border-amber-500/30 bg-amber-500/5',
  },
  {
    name: 'Historic',
    detail:
      'Superseded or obsolete. Read it to understand legacy traffic, not to build something new.',
    tone: 'text-slate-300 border-slate-600/40 bg-slate-500/5',
  },
];

const ANATOMY = [
  {
    part: 'Header block',
    detail:
      'Document number, category, publication date, authors, and the "Obsoletes" / "Updates" lines. Those lines are the first thing to check.',
  },
  {
    part: 'Status of This Memo',
    detail: 'Repeats the category and explains the document\'s standing. A surprising number of "standards" turn out to be Informational here.',
  },
  {
    part: 'Abstract and Introduction',
    detail: 'Two short sections that tell you what problem the document solves and what it replaces. Read these before anything else.',
  },
  {
    part: 'Terminology',
    detail:
      'Defines the keywords and protocol-specific terms. If a term is capitalised in the body, it is usually defined here.',
  },
  {
    part: 'The specification body',
    detail:
      'Packet formats, state machines, timers and procedures. Figures are usually ASCII art with bit offsets; read the offset columns, not the drawing.',
  },
  {
    part: 'IANA Considerations',
    detail:
      'Lists the registries the document creates or modifies (ports, protocol numbers, message types). This is how you find the current assigned values.',
  },
  {
    part: 'Security Considerations',
    detail:
      'Mandatory in IETF documents. It is often the most useful section for understanding why the design looks the way it does.',
  },
  {
    part: 'References',
    detail:
      'Normative references are required to implement the document. Informative references are background and can be skipped on a first read.',
  },
];

const READING_STEPS = [
  'Check the status, date and the Obsoletes/Updates lines. If a newer RFC replaces it, stop and read that one.',
  'Read the abstract and introduction, then jump to Security Considerations. You now know the problem and the constraints.',
  'Skim the table of contents to build a map, but do not read linearly yet.',
  'Read the packet format and the state machine, ignoring everything else. Ask: what are the fields, and what changes state?',
  'Read the IANA Considerations to learn which values are registered and where the current registry lives.',
  'Only then read the procedures and edge cases, with the diagrams beside you.',
  'Check the RFC Editor errata page for that number. Errata are corrections that were accepted after publication.',
];

export default function StandardsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Standards literacy</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          How to read an{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            RFC
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          Reading the specification is the difference between knowing a protocol and knowing <em>about</em> it. This
          page is the method I would give a newcomer: what the document labels mean, where to look, and which traps
          catch almost everyone.
        </p>

        <p className="text-xs text-slate-500">
          Every protocol page on this site lists its standards. Start with the simplest document in the list, not the
          longest.
        </p>
      </header>

      <section aria-labelledby="what-is-rfc" className="space-y-4">
        <h2 id="what-is-rfc" className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          What an RFC actually is
        </h2>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            An RFC is a document in a permanent, numbered series. It is not automatically a standard: the series
            contains standards, operational guidance, vendor descriptions, April Fools jokes and historical records.
          </p>
          <p>
            The label on the document tells you what you are holding. <strong className="text-white">Internet-Drafts</strong>{' '}
            are works in progress with a six-month lifetime and no standing at all; only an RFC number is durable.
          </p>
          <p>
            Different bodies publish in different series: the IETF through the RFC Editor, W3C as Recommendations,
            IEEE as numbered standards, 3GPP as Technical Specifications. The reading method below transfers; the
            document furniture does not.
          </p>
        </div>
      </section>

      <section aria-labelledby="statuses" className="space-y-4">
        <h2 id="statuses" className="text-xl font-bold text-white flex items-center gap-2">
          <Waypoints className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          The five labels that decide how much to trust a document
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STATUSES.map((status) => (
            <div key={status.name} className={`rounded-2xl border p-4 space-y-1.5 ${status.tone}`}>
              <h3 className="text-sm font-bold">{status.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{status.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="keywords" className="space-y-4">
        <h2 id="keywords" className="text-xl font-bold text-white">
          MUST, SHOULD, MAY: read these literally
        </h2>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <dl className="divide-y divide-slate-800">
            {[
              ['MUST / REQUIRED / SHALL', 'An absolute requirement. If you do not do this, you are not implementing the protocol.'],
              ['MUST NOT / SHALL NOT', 'An absolute prohibition. This is where interoperability and security failures usually start.'],
              ['SHOULD / RECOMMENDED', 'There may be valid reasons to deviate, but you must understand the consequences and be prepared to explain them.'],
              ['SHOULD NOT / NOT RECOMMENDED', 'The behaviour is permitted but discouraged for good reasons.'],
              ['MAY / OPTIONAL', 'Genuinely optional. A receiver must cope with peers that do not implement it.'],
            ].map(([keyword, meaning]) => (
              <div key={keyword} className="p-4 grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-2">
                <dt className="text-xs font-bold font-mono text-emerald-300">{keyword}</dt>
                <dd className="text-xs text-slate-300 leading-relaxed">{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-xs text-slate-400">
          The keywords are defined in RFC 2119, and RFC 8174 clarifies that only the UPPERCASE forms carry this
          meaning. A lowercase &quot;must&quot; in prose is just English, not a requirement.
        </p>
      </section>

      <section aria-labelledby="anatomy" className="space-y-4">
        <h2 id="anatomy" className="text-xl font-bold text-white">
          Anatomy of a specification
        </h2>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 divide-y divide-slate-800">
          {ANATOMY.map((section, index) => (
            <div key={section.part} className="p-4 flex gap-3">
              <span className="w-6 h-6 shrink-0 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center justify-center">
                {index + 1}
              </span>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white">{section.part}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{section.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="method" className="space-y-4">
        <h2 id="method" className="text-xl font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" aria-hidden="true" />
          A seven-step reading method
        </h2>

        <ol className="rounded-2xl border border-slate-800 bg-slate-900/50 divide-y divide-slate-800">
          {READING_STEPS.map((step, index) => (
            <li key={step} className="p-4 flex gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-mono text-indigo-300 flex items-center justify-center">
                {index + 1}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="traps" className="space-y-4">
        <h2 id="traps" className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" aria-hidden="true" />
          Six traps that catch beginners
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: 'Reading an obsoleted RFC',
              body: 'The header says "Obsoleted by RFC XXXX". Always check before investing an hour.',
            },
            {
              title: 'Ignoring errata',
              body: 'Accepted errata correct real errors in the published text. Check the RFC Editor errata page for the number.',
            },
            {
              title: 'Treating Informational as a standard',
              body: 'A vendor protocol published as Informational is documented, not standardised. Interoperability is not guaranteed.',
            },
            {
              title: 'Reading only the abstract',
              body: 'The abstract describes intent. Fields, defaults and error behaviour live in the body.',
            },
            {
              title: 'Confusing the RFC with the registry',
              body: 'Assigned port numbers and message types live in IANA registries, which change independently of the RFC.',
            },
            {
              title: 'Skipping Security Considerations',
              body: 'It explains the threat model the design assumes, and often the reason a feature exists at all.',
            },
          ].map((trap) => (
            <div key={trap.title} className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-1">
              <h3 className="text-xs font-bold text-amber-200">{trap.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{trap.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="where" className="space-y-4">
        <h2 id="where" className="text-xl font-bold text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          Where to look things up
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              name: 'RFC Editor',
              href: 'https://www.rfc-editor.org/',
              detail: 'Every RFC, plus errata and the official status metadata.',
            },
            {
              name: 'IETF Datatracker',
              href: 'https://datatracker.ietf.org/',
              detail: 'Working-group history, drafts, implementations and which RFCs update which.',
            },
            {
              name: 'IANA registries',
              href: 'https://www.iana.org/protocols',
              detail: 'The live source for protocol numbers, ports, message types and address assignments.',
            },
            {
              name: 'W3C Standards',
              href: 'https://www.w3.org/TR/',
              detail: 'Recommendations for web protocols such as WebSocket, WebAuthn and WebRTC.',
            },
          ].map((source) => (
            <a
              key={source.name}
              href={source.href}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-1 hover:border-slate-700 transition-colors"
            >
              <h3 className="text-xs font-bold text-cyan-300">{source.name} ↗</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{source.detail}</p>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="exercise" className="space-y-4">
        <h2 id="exercise" className="text-xl font-bold text-white">
          Your first three documents
        </h2>

        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-3 text-sm text-slate-300">
          <p>
            <strong className="text-white">1. RFC 2119</strong> — two pages, defines the keywords above. Read it once
            and the rest of the series becomes easier.
          </p>
          <p>
            <strong className="text-white">2. RFC 768</strong> — the entire UDP specification fits in about three
            pages: an 8-byte header and a checksum. Compare it with the <Link href="/protocols/udp" className="text-indigo-300 hover:underline">UDP lesson</Link>.
          </p>
          <p>
            <strong className="text-white">3. RFC 9293</strong> — the consolidated TCP specification. Long, but now you
            know where the state machine and the options live.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <h2 className="text-sm font-bold text-white">How to cite a standard</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Name the document, not just the protocol: &quot;TCP (RFC 9293, Section 3.5)&quot; is useful; &quot;the TCP
          RFC&quot; is not. For IEEE and ISO documents include the edition or year, because clauses move between
          editions.
        </p>
        <div className="flex flex-wrap gap-4 pt-1 text-xs">
          <Link href="/glossary" className="inline-flex items-center gap-1 font-semibold text-cyan-300 hover:text-cyan-200">
            Glossary of terms
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link href="/reference" className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:text-indigo-200">
            Standards in the reference registry
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
