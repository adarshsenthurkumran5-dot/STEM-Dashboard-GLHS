import { useState, useRef, useEffect, useCallback } from 'react'

/* ================================================================
   MOCK DATA
   ================================================================ */

const DEMO_USERS = {
  'student@stemrc.org': {
    password: 'password123',
    role: 'student',
    name: 'Jacob Michael',
    id: 'u1',
    initials: 'JM',
  },
  'admin@stemrc.org': {
    password: 'adminsecure2026',
    role: 'admin',
    name: 'Dr. Sarah Williams',
    id: 'u2',
    initials: 'SW',
  },
}

const ACTIVE_CODE = 'RESEARCH2026'

const INITIAL_ATTENDANCE = [
  { id: 1, name: 'Jacob Michael',  date: 'May 14, 2026', code: 'STEMFAIR25', time: '3:58 PM' },
  { id: 2, name: 'Marcus Johnson', date: 'May 14, 2026', code: 'STEMFAIR25', time: '4:02 PM' },
  { id: 3, name: 'Priya Patel',    date: 'May 14, 2026', code: 'STEMFAIR25', time: '4:07 PM' },
]

const INITIAL_SHIFTS = [
  { id: 1, date: 'Wed, May 28, 2026', time: '3:30 – 5:00 PM', total: 8, remaining: 5, signedUp: false },
  { id: 2, date: 'Wed, Jun 4, 2026',  time: '3:30 – 5:00 PM', total: 8, remaining: 2, signedUp: false },
  { id: 3, date: 'Wed, Jun 11, 2026', time: '3:30 – 5:00 PM', total: 8, remaining: 0, signedUp: false },
  { id: 4, date: 'Wed, Jun 18, 2026', time: '3:30 – 5:00 PM', total: 8, remaining: 6, signedUp: false },
  { id: 5, date: 'Wed, Jun 25, 2026', time: '3:30 – 5:00 PM', total: 8, remaining: 8, signedUp: false },
]

const ISEF_FORMS = [
  {
    id: 'f1',
    tag: 'Form 1',
    title: 'Adult Sponsor / Research Plan Checklist',
    what: 'Required for all projects. Completed by the Adult Sponsor (teacher or qualified adult) certifying that they reviewed the research plan, all safety precautions are in place, and the student received adequate supervision before experimentation began.',
    how: [
      'Have your Adult Sponsor (not you) fill out and sign this form',
      'Sponsor confirms the Research Plan (Form 1A) was reviewed before any work began',
      'Sponsor identifies the type of project and checks all applicable hazard categories',
      'Sponsor certifies student received safety training appropriate to the project',
      'Submit original with signature — photocopies are not accepted',
    ],
  },
  {
    id: 'f1a',
    tag: 'Form 1A',
    title: 'Student Checklist & Research Plan',
    what: 'Required for all projects. A structured 700-word research plan written by the student. Includes the research question, hypothesis, experimental design, variables, materials, procedures, and anticipated data analysis method. Must be completed and reviewed before experimentation begins.',
    how: [
      'Write your research question and hypothesis clearly in the opening section',
      'List all independent, dependent, and controlled variables explicitly',
      'Describe your complete experimental procedure step by step',
      'Outline your data collection method and planned statistical analysis',
      'Check every item on the student compliance checklist at the top of the form',
      'Have your Adult Sponsor review and date the plan before you begin any work',
      'Stay within the 700-word limit for the written plan',
    ],
  },
  {
    id: 'f1b',
    tag: 'Form 1B',
    title: 'Continuation / Research Continuation Project',
    what: 'Required only if your project continues research from a previous ISEF-affiliated competition year. Clearly documents what is new this year versus carried forward from prior work, ensuring judges can evaluate current-year contributions independently.',
    how: [
      'Attach your previous year\'s finalized, approved research plan',
      'List every procedure, dataset, and analysis that is genuinely new this year',
      'Clearly explain how the new work extends (and does not merely duplicate) prior findings',
      'Do NOT present prior-year data as new — this is a disqualifying violation',
      'Have your SRC/IRB review the continuation scope before submitting',
    ],
  },
  {
    id: 'f2',
    tag: 'Form 2',
    title: 'Qualified Scientist',
    what: 'Required when research is conducted at a university, hospital, government lab, or any regulated research institution with a supervising professional scientist. The Qualified Scientist documents their credentials, supervision hours, and confirms the student performed the work independently.',
    how: [
      'Identify the supervising Qualified Scientist (PhD, MD, DVM, or equivalent)',
      'Scientist lists their institution, department, and relevant credentials',
      'Document the total hours of direct supervision provided',
      'Scientist describes the student\'s specific role and independent contributions',
      'Obtain the scientist\'s original signature — email confirmations are not sufficient',
      'Attach this form only if research took place at a regulated institution',
    ],
  },
  {
    id: 'f3',
    tag: 'Form 3',
    title: 'Risk Assessment',
    what: 'Required for projects involving any potentially hazardous substances or conditions — including chemicals, electricity above household voltage, sharp instruments, extreme temperatures, lasers, or biological materials. Documents every hazard and your specific mitigation strategies.',
    how: [
      'List every chemical, biological agent, radioactive material, sharp tool, or physical hazard used',
      'For each hazard, specify the exact safety precautions and containment measures in place',
      'List all required personal protective equipment (PPE) for each hazard category',
      'Describe your disposal procedures for any hazardous waste generated',
      'Obtain a signature from a qualified scientist familiar with the specific hazards',
      'Complete this form before any experimentation begins',
    ],
  },
  {
    id: 'f4',
    tag: 'Form 4',
    title: 'Human Participants',
    what: 'Required whenever your project involves human subjects in any capacity — surveys, interviews, cognitive tasks, behavioral observations, physiological measurements, or use of pre-existing personal/medical data. Also required for projects examining existing datasets that contain identifiable human information.',
    how: [
      'Describe all procedures involving human participants in plain, non-technical language',
      'Confirm your research protocol was reviewed and approved before recruitment began',
      'Attach a signed Informed Consent form for every adult participant (18+)',
      'Attach signed Parental Consent AND participant Assent forms for minors',
      'Document how participant confidentiality and data security are maintained',
      'Specify how you will store, de-identify, and eventually destroy participant data',
      'Obtain IRB approval or qualified Adult Sponsor sign-off as required by your category',
    ],
  },
  {
    id: 'f5a',
    tag: 'Form 5A',
    title: 'Vertebrate Animals — Non-Regulated Site',
    what: 'Required for projects using vertebrate animals (including zebrafish, mice, rats, birds, reptiles, and all other vertebrates) conducted at a home, school, or field site that is NOT a regulated research institution. Must be completed and approved before any animals are acquired or handled.',
    how: [
      'Identify the species, number of animals, and their source (approved vendor or wild-caught)',
      'Describe housing conditions, feeding schedule, and daily care procedures',
      'Detail every experimental procedure and confirm it causes no more than momentary pain or distress',
      'Identify the supervising veterinarian or qualified scientist who reviewed the protocol',
      'Obtain SRC/IRB approval before acquiring any animals',
      'Document your humane endpoint criteria and euthanasia protocol if applicable',
    ],
  },
  {
    id: 'f5b',
    tag: 'Form 5B',
    title: 'Vertebrate Animals — Regulated Research Institution',
    what: 'Required when vertebrate animal research is conducted at a university, hospital, or government laboratory covered by the Animal Welfare Act or Public Health Service Policy. Replaces Form 5A for regulated settings and requires IACUC approval documentation.',
    how: [
      'Attach a copy of the institution\'s active IACUC (Institutional Animal Care and Use Committee) approval',
      'List the IACUC protocol number and approval date',
      'Confirm the student was listed as a participant on the approved IACUC protocol',
      'Have the supervising Qualified Scientist sign and certify the student\'s involvement',
      'All work must fall within the approved IACUC protocol scope — no unapproved deviations',
    ],
  },
  {
    id: 'f6a',
    tag: 'Form 6A',
    title: 'Potentially Hazardous Biological Agents — Risk Assessment',
    what: 'Required for any project using microorganisms (bacteria, fungi, parasites), recombinant DNA/RNA, prions, or any biological material that could pose a risk to human health or the environment. Requires Biosafety Level (BSL) classification and IBC or SRC review.',
    how: [
      'Identify every biological agent used by full scientific name and Biosafety Level (BSL-1, BSL-2, etc.)',
      'Describe containment procedures appropriate to each agent\'s BSL classification',
      'Detail sterilization, decontamination, and waste disposal protocols',
      'Obtain review and signature from an Institutional Biosafety Committee (IBC) member or qualified microbiologist',
      'All BSL-2 or higher work must be conducted at an approved regulated institution',
      'Complete before any biological materials are ordered or handled',
    ],
  },
  {
    id: 'f6b',
    tag: 'Form 6B',
    title: 'Human and Vertebrate Animal Tissue',
    what: 'Required when your project uses fresh or preserved human tissue, blood, body fluids, or primary cell cultures derived from humans or vertebrate animals — even commercially purchased or publicly archived samples. Covers both original collection and use of existing biobank specimens.',
    how: [
      'Specify the exact tissue type, source, and whether it is fresh, fixed, or archived',
      'Confirm the tissue was obtained through an IRB-approved protocol or is an exempt existing sample',
      'Attach documentation of the tissue source\'s IRB approval number if applicable',
      'Describe all Universal Precautions and PPE used when handling the material',
      'Obtain sign-off from a qualified scientist with expertise in the tissue type',
      'Detail your storage, labeling, and final disposal procedures',
    ],
  },
  {
    id: 'f7',
    tag: 'Form 7',
    title: 'Display and Safety Acknowledgment',
    what: 'Required for all ISEF-affiliated projects at the display and judging stage. Certifies that your project display complies with all ISEF physical size regulations, electrical requirements, and prohibited-item rules. Also required for middle-school projects continuing to a high school fair.',
    how: [
      'Verify your backboard meets ISEF maximums: 122 cm wide × 274 cm tall × 61 cm deep',
      'Confirm no prohibited items will be on your table (no living organisms, open flames, lasers >5 mW, soil samples, liquids in open containers)',
      'If using electricity: confirm all wiring is UL-listed and properly insulated',
      'If continuing from middle school: attach prior year\'s abstract and approval signatures',
      'Student and parent/guardian must both sign and date the acknowledgment',
      'Bring a copy to the fair — it may be requested at check-in',
    ],
  },
  {
    id: 'ncsef',
    tag: 'NCSEF',
    title: 'Parent / Guardian Release Form',
    what: 'North Carolina Science and Engineering Fair (NCSEF) specific form. Required for all student participants. Parent or guardian grants permission for the student to compete, authorizes use of the student\'s name and project information in fair materials, and acknowledges liability limitations for the duration of the event.',
    how: [
      'Print and complete the form — electronic signatures are not accepted at NCSEF',
      'Parent or legal guardian must sign (not the student)',
      'Student section must also be completed in full',
      'Include emergency contact information and any relevant medical/accommodation needs',
      'Submit to your club advisor or directly to NCSEF by the published deadline',
      'Retain a copy — you may be asked to present it at registration',
    ],
  },
]

const WIZARD_QUESTIONS = [
  {
    id: 'q1',
    text: 'Does your project involve human participants — surveys, interviews, cognitive tasks, behavioral observations, physiological measurements, or use of any existing personal or medical data?',
    required: ['Form 4'],
    note: 'Includes simulated scenarios, jury studies, and online surveys',
  },
  {
    id: 'q2',
    text: 'Does your project use vertebrate animals (mice, rats, zebrafish, birds, reptiles, or any other vertebrate) in any part of the experimental process?',
    required: ['Form 5A', 'Form 5B'],
    note: 'Includes school, home, field, and regulated institution research sites',
  },
  {
    id: 'q3',
    text: 'Does your project use microorganisms, recombinant DNA/RNA, human or animal tissue, blood, body fluids, or any hazardous biological, chemical, or radioactive materials?',
    required: ['Form 3', 'Form 6A', 'Form 6B'],
    note: 'Select Yes if any of these apply — you may not need all three',
  },
  {
    id: 'q4',
    text: 'Does your project involve a Qualified Scientist (PhD, MD, DVM) at a university, hospital, or government laboratory as your primary research supervisor?',
    required: ['Form 2'],
    note: 'Required when research is conducted at a regulated institution',
  },
  {
    id: 'q5',
    text: 'Is this project a continuation of research you submitted to an ISEF-affiliated fair in a previous competition year?',
    required: ['Form 1B'],
    note: 'New data and procedures from this year must be clearly documented',
  },
]

const INITIAL_DOCUMENTS = [
  {
    id: 1,
    student: 'Jacob Michael',
    type: 'NCSEF Parent Release',
    file: 'JacobMichaelNCSEFParentReleaseForm.pdf',
    size: '142 KB',
    status: 'Pending Review',
    feedback: null,
    date: 'May 19, 2026',
    studentId: 'u1',
  },
  {
    id: 2,
    student: 'Jacob Michael',
    type: 'Form 1 — Adult Sponsor Checklist',
    file: '1-Checklist-for-Adult-Sponsor-stemrcform1.pdf',
    size: '98 KB',
    status: 'Pending Review',
    feedback: null,
    date: 'May 19, 2026',
    studentId: 'u1',
  },
  {
    id: 3,
    student: 'Jacob Michael',
    type: 'Form 1A — Student Checklist & Research Plan',
    file: '1A-Student-Checklist-Research-Plan-Instructions1.pdf',
    size: '189 KB',
    status: 'Pending Review',
    feedback: null,
    date: 'May 19, 2026',
    studentId: 'u1',
  },
  {
    id: 4,
    student: 'Jacob Michael',
    type: 'Form 4 — Informed Consent',
    file: '4-Sample-Informed-Consent1.pdf',
    size: '203 KB',
    status: 'Pending Review',
    feedback: null,
    date: 'May 19, 2026',
    studentId: 'u1',
  },
  {
    id: 5,
    student: 'Jacob Michael',
    type: 'Form 4 — Human Participants',
    file: '4-Human-Participants3.pdf',
    size: '156 KB',
    status: 'Pending Review',
    feedback: null,
    date: 'May 19, 2026',
    studentId: 'u1',
  },
]

/* ================================================================
   ICONS (inline SVG, kept minimal)
   ================================================================ */

const Ico = {
  attendance: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  mentor: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  forms: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  research: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  logout: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  check: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  chevronDown: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  upload: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  download: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  file: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  location: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  logo: (cls) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
}

/* ================================================================
   SHARED COMPONENTS
   ================================================================ */

function Badge({ status }) {
  const map = {
    'Pending Review':     'bg-amber-50 text-amber-700 border-amber-200',
    'Approved':           'bg-green-50 text-green-700 border-green-200',
    'Changes Requested':  'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status === 'Approved' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
      {status === 'Pending Review' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
      {status === 'Changes Requested' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
      {status}
    </span>
  )
}

function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <svg className={`animate-spin ${s}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500)
    return () => clearTimeout(t)
  }, [onClose])

  const styles = {
    success: 'bg-gray-900 text-white',
    error:   'bg-red-600 text-white',
    info:    'bg-gray-700 text-white',
  }

  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl shadow-2xl max-w-xs animate-slide-in-right ${styles[type]}`}>
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-white/20' : type === 'error' ? 'bg-white/20' : 'bg-white/15'}`}>
        {type === 'success' && Ico.check('w-3 h-3 text-white')}
        {type === 'error'   && Ico.x('w-3 h-3 text-white')}
        {type === 'info'    && <span className="text-xs font-bold">i</span>}
      </div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition">
        {Ico.x('w-4 h-4')}
      </button>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-black">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-black">
            {Ico.x('w-4 h-4')}
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* ================================================================
   LOGIN PAGE
   ================================================================ */

function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const signIn = useCallback(async (e, overrideEmail, overridePassword) => {
    if (e) e.preventDefault()
    const em = overrideEmail   ?? email
    const pw = overridePassword ?? password
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 700))
    const user = DEMO_USERS[em]
    if (user && user.password === pw) {
      onLogin({ email: em, ...user })
    } else {
      setError('Invalid credentials. Use the quick-fill buttons below.')
    }
    setLoading(false)
  }, [email, password, onLogin])

  const quickFill = async (type) => {
    const creds = type === 'student'
      ? { email: 'student@stemrc.org', password: 'password123' }
      : { email: 'admin@stemrc.org',   password: 'adminsecure2026' }
    setEmail(creds.email)
    setPassword(creds.password)
    setError('')
    await signIn(null, creds.email, creds.password)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-5 shadow-lg">
            {Ico.logo('w-7 h-7 text-white')}
          </div>
          <h1 className="text-[22px] font-bold text-black tracking-tight">STEM Research Club</h1>
          <p className="text-sm text-gray-400 mt-1">Student Portal · Demo v1.0</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-fade-in">
          <h2 className="text-lg font-semibold text-black mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
              {Ico.x('w-4 h-4 text-red-500 mt-0.5 flex-shrink-0')}
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={signIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@stemrc.org"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 active:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          {/* Quick Fill */}
          <div className="mt-7 pt-6 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 text-center uppercase tracking-widest mb-3">
              Demo Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { type: 'student', label: 'Student',   sub: 'student@stemrc.org',  emoji: '🎓' },
                { type: 'admin',   label: 'Admin',     sub: 'admin@stemrc.org',    emoji: '🔑' },
              ].map(({ type, label, sub, emoji }) => (
                <button
                  key={type}
                  onClick={() => quickFill(type)}
                  disabled={loading}
                  className="flex flex-col items-center gap-0.5 px-3 py-3.5 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition text-center disabled:opacity-50 group"
                >
                  <span className="text-xl mb-0.5">{emoji}</span>
                  <span className="text-xs font-bold text-black">{label}</span>
                  <span className="text-[11px] text-gray-400">{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          STEM Research Club · Cary, NC · 2025–2026
        </p>
      </div>
    </div>
  )
}

/* ================================================================
   SIDEBAR
   ================================================================ */

const NAV_ITEMS = [
  { id: 'attendance', label: 'Attendance',     iconKey: 'attendance' },
  { id: 'mentor',     label: 'Mentor Sign-Up', iconKey: 'mentor'     },
  { id: 'forms',      label: 'ISEF Forms',     iconKey: 'forms'      },
  { id: 'research',   label: 'Research Hub',   iconKey: 'research'   },
]

function Sidebar({ activeTab, setActiveTab, user, activeRole, onLogout }) {
  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
            {Ico.logo('w-4 h-4 text-white')}
          </div>
          <div>
            <p className="text-sm font-bold text-black leading-tight">STEM Research</p>
            <p className="text-[11px] text-gray-400">Student Portal</p>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
            {user.initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-black truncate">{user.name}</p>
            <p className="text-[11px] text-gray-400 capitalize">{activeRole} account</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              {Ico[item.iconKey](
                `w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-black'}`
              )}
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 hover:text-black transition"
        >
          {Ico.logout('w-4 h-4 flex-shrink-0')}
          Sign Out
        </button>
      </div>
    </aside>
  )
}

/* ================================================================
   TAB 1 — ATTENDANCE
   ================================================================ */

function AttendanceTab({ logs, onAddLog }) {
  const [name, setName]     = useState('')
  const [date, setDate]     = useState(() => new Date().toISOString().split('T')[0])
  const [code, setCode]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [toast, setToast]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1100))
    if (code.trim().toUpperCase() === ACTIVE_CODE) {
      const now = new Date()
      onAddLog({
        id:   Date.now(),
        name: name.trim(),
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        code: ACTIVE_CODE,
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      })
      setToast({ message: 'Attendance logged successfully!', type: 'success' })
      setName('')
      setCode('')
    } else {
      setError('Incorrect code. Check with your meeting organizer, or use the demo code shown above.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-7">
        <h2 className="text-2xl font-bold text-black">Attendance</h2>
        <p className="text-sm text-gray-500 mt-1">Log your presence for today's club meeting</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <h3 className="text-sm font-semibold text-black">Submit Attendance</h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Demo tip — today's code:&nbsp;<strong>RESEARCH2026</strong>
          </span>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 animate-fade-in">
            {Ico.x('w-4 h-4 text-red-500 mt-0.5 flex-shrink-0')}
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Meeting Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Attendance Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Enter the code from today's meeting"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-black font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner /> Verifying code…</> : 'Log Attendance'}
          </button>
        </form>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-black">Recent Logs</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{logs.length} record{logs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">No attendance records yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...logs].reverse().map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm font-medium text-black">{log.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{log.date}</td>
                  <td className="px-6 py-3">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{log.code}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-400">{log.time || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   TAB 2 — MENTOR SIGN-UP
   ================================================================ */

function MentorTab() {
  const [shifts, setShifts]         = useState(INITIAL_SHIFTS)
  const [confirmId, setConfirmId]   = useState(null)
  const [toast, setToast]           = useState(null)

  const confirmShift = shifts.find(s => s.id === confirmId)

  const handleConfirm = () => {
    setShifts(prev =>
      prev.map(s => s.id === confirmId
        ? { ...s, remaining: s.remaining - 1, signedUp: true }
        : s
      )
    )
    setConfirmId(null)
    setToast({ message: "You're signed up! See you there.", type: 'success' })
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-7">
        <h2 className="text-2xl font-bold text-black">Mentor Sign-Up</h2>
        <p className="text-sm text-gray-500 mt-1">Volunteer mentoring shifts at Mills Park Middle School</p>
      </div>

      {/* Location chip */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5 flex items-start gap-3.5">
        <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
          {Ico.location('w-4 h-4 text-white')}
        </div>
        <div>
          <p className="text-sm font-semibold text-black">Mills Park Middle School — Science Lab, Rm 214</p>
          <p className="text-xs text-gray-500 mt-0.5">1100 Mills Park Dr, Cary, NC 27519</p>
          <p className="text-xs text-gray-400 mt-1">Point of contact: Ms. A. Torres · <span className="font-mono">atorres@wcpss.net</span></p>
        </div>
      </div>

      {/* Shifts table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-black">Available Shifts</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Click Sign Up to reserve your spot — limited availability</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Date', 'Time', 'Spots', 'Status', ''].map(h => (
                <th key={h} className={`px-6 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {shifts.map(shift => {
              const pct = ((shift.total - shift.remaining) / shift.total) * 100
              return (
                <tr key={shift.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-black whitespace-nowrap">{shift.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{shift.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: shift.remaining === 0 ? '#ef4444' : '#000',
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${shift.remaining === 0 ? 'text-red-500' : 'text-gray-600'}`}>
                        {shift.remaining}/{shift.total}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {shift.signedUp ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                        {Ico.check('w-3 h-3')} Signed Up
                      </span>
                    ) : shift.remaining === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium">Full</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-medium">Open</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {shift.signedUp || shift.remaining === 0 ? (
                      <button disabled className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
                        {shift.signedUp ? 'Signed Up' : 'Full'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmId(shift.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-black text-white hover:bg-gray-800 transition"
                      >
                        Sign Up
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {confirmShift && (
        <Modal title="Confirm Sign-Up" onClose={() => setConfirmId(null)}>
          <p className="text-sm text-gray-600 mb-3">You're registering to volunteer for:</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <p className="text-sm font-semibold text-black">{confirmShift.date}</p>
            <p className="text-sm text-gray-500">{confirmShift.time}</p>
            <p className="text-xs text-gray-400 mt-1">Mills Park Middle School · Science Lab Rm 214</p>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            By confirming, you commit to attending this shift. If you can't make it, please cancel at least 48 hours in advance.
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={() => setConfirmId(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ================================================================
   TAB 3 — ISEF FORMS
   ================================================================ */

function FormsTab() {
  const [wizardStarted, setWizardStarted] = useState(false)
  const [currentQ, setCurrentQ]           = useState(0)
  const [answers, setAnswers]             = useState({})
  const [wizardDone, setWizardDone]       = useState(false)
  const [expanded, setExpanded]           = useState(null)

  const requiredList = wizardDone
    ? [
        'Form 1',
        'Form 1A',
        'NCSEF',
        ...WIZARD_QUESTIONS
          .filter(q => answers[q.id] === 'yes')
          .flatMap(q => q.required),
      ]
    : []

  const answer = (qId, value) => {
    const next = { ...answers, [qId]: value }
    setAnswers(next)
    if (currentQ + 1 < WIZARD_QUESTIONS.length) {
      setCurrentQ(currentQ + 1)
    } else {
      setWizardDone(true)
    }
  }

  const reset = () => {
    setWizardStarted(false)
    setCurrentQ(0)
    setAnswers({})
    setWizardDone(false)
  }

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id)

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-black">ISEF Forms</h2>
        <p className="text-sm text-gray-500 mt-1">Find your required forms and learn exactly how to complete them</p>
      </div>

      {/* WIZARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-black">Form Requirement Wizard</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">5 questions · ~1 minute</p>
          </div>
          {wizardStarted && (
            <button onClick={reset} className="text-xs text-gray-400 hover:text-black transition">Start over</button>
          )}
        </div>

        {!wizardStarted && !wizardDone && (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-black mb-1">Not sure which forms you need?</p>
            <p className="text-sm text-gray-500 mb-5">Answer a few project-specific questions to get your personalized list.</p>
            <button
              onClick={() => { setWizardStarted(true); setCurrentQ(0) }}
              className="px-5 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
            >
              Start Wizard
            </button>
          </div>
        )}

        {wizardStarted && !wizardDone && (
          <div className="animate-fade-in">
            <div className="flex gap-1 mb-5">
              {WIZARD_QUESTIONS.map((_, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= currentQ ? 'bg-black' : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Question {currentQ + 1} of {WIZARD_QUESTIONS.length}
            </p>
            <p className="text-sm font-medium text-black mb-1.5">{WIZARD_QUESTIONS[currentQ].text}</p>
            {WIZARD_QUESTIONS[currentQ].note && (
              <p className="text-xs text-gray-400 italic mb-4">{WIZARD_QUESTIONS[currentQ].note}</p>
            )}
            <div className="flex gap-2.5">
              <button
                onClick={() => answer(WIZARD_QUESTIONS[currentQ].id, 'yes')}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-black hover:border-black hover:bg-gray-50 transition"
              >
                Yes
              </button>
              <button
                onClick={() => answer(WIZARD_QUESTIONS[currentQ].id, 'no')}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-black hover:border-black hover:bg-gray-50 transition"
              >
                No
              </button>
            </div>
          </div>
        )}

        {wizardDone && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                {Ico.check('w-3 h-3 text-green-600')}
              </div>
              <p className="text-sm font-semibold text-black">Your Required Forms</p>
            </div>

            <div className="mb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Required for all projects</p>
              <div className="flex flex-wrap gap-2">
                {['Form 1', 'Form 1A', 'NCSEF'].map(f => (
                  <span key={f} className="inline-flex items-center px-3 py-1.5 bg-black text-white rounded-xl text-xs font-semibold">{f}</span>
                ))}
              </div>
            </div>

            {requiredList.filter(f => !['Form 1', 'Form 1A', 'NCSEF'].includes(f)).length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Required based on your project</p>
                <div className="flex flex-wrap gap-2">
                  {requiredList.filter(f => !['Form 1', 'Form 1A', 'NCSEF'].includes(f)).map(f => (
                    <span key={f} className="inline-flex items-center px-3 py-1.5 bg-gray-800 text-white rounded-xl text-xs font-semibold">{f}</span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1">
              Forms marked <span className="font-semibold text-amber-600">Required</span> are highlighted in the library below.
            </p>
          </div>
        )}
      </div>

      {/* FORM LIBRARY */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-black">Form Library</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Click any form to see how to complete it</p>
        </div>
        <div>
          {ISEF_FORMS.map((form, i) => {
            const isExpanded = expanded === form.id
            const isRequired = requiredList.includes(form.tag)
            return (
              <div key={form.id} className={i > 0 ? 'border-t border-gray-100' : ''}>
                <button
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left"
                  onClick={() => toggleExpand(form.id)}
                >
                  <span className="text-[11px] font-bold bg-black text-white px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
                    {form.tag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-black">{form.title}</span>
                      {isRequired && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{form.what}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-black px-2.5 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                    >
                      {Ico.download('w-3.5 h-3.5')} PDF
                    </span>
                    {Ico.chevronDown(`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`)}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-50 bg-gray-50 animate-fade-in">
                    <div className="pt-5 grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">What It Is</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{form.what}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">How to Complete</p>
                        <ul className="space-y-2">
                          {form.how.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-5 h-5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-gray-700 leading-snug">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   TAB 4 — RESEARCH HUB
   ================================================================ */

function ResearchTab({ activeRole, documents, setDocuments }) {
  const [dragging, setDragging]     = useState(false)
  const [docType, setDocType]       = useState('Form 1A — Student Checklist')
  const [denyDocId, setDenyDocId]   = useState(null)
  const [denyReason, setDenyReason] = useState('')
  const [toast, setToast]           = useState(null)
  const fileRef                     = useRef(null)

  const myDocs = documents.filter(d => d.studentId === 'u1')

  const addDoc = (file) => {
    setDocuments(prev => [{
      id:        Date.now(),
      student:   'Jacob Michael',
      type:      docType,
      file:      file.name,
      size:      file.size > 1024 * 1024
                   ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                   : `${Math.round(file.size / 1024)} KB`,
      status:    'Pending Review',
      feedback:  null,
      date:      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      studentId: 'u1',
    }, ...prev])
    setToast({ message: `${file.name} uploaded — pending review.`, type: 'success' })
  }

  const handleFiles = (e) => {
    if (e.target.files[0]) addDoc(e.target.files[0])
    e.target.value = ''
  }
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files[0]) addDoc(e.dataTransfer.files[0])
  }

  const approve = (id) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'Approved', feedback: null } : d))
    setToast({ message: 'Document approved.', type: 'success' })
  }
  const submitDeny = () => {
    if (!denyReason.trim()) return
    setDocuments(prev => prev.map(d => d.id === denyDocId ? { ...d, status: 'Changes Requested', feedback: denyReason.trim() } : d))
    setToast({ message: 'Feedback sent to student.', type: 'info' })
    setDenyDocId(null)
    setDenyReason('')
  }

  const stats = [
    { label: 'Pending',  count: documents.filter(d => d.status === 'Pending Review').length,    color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Approved', count: documents.filter(d => d.status === 'Approved').length,           color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    { label: 'Revisions',count: documents.filter(d => d.status === 'Changes Requested').length,  color: 'text-red-600',   bg: 'bg-red-50 border-red-100' },
  ]

  return (
    <div className="max-w-4xl animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-7">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-black">Research Hub</h2>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${activeRole === 'admin' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {activeRole === 'admin' ? '⚙ Admin View' : '👤 Student View'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {activeRole === 'admin'
            ? 'Review student submissions, approve documents, or request changes'
            : 'Upload your research documents and track their review status'}
        </p>
      </div>

      {/* ─── STUDENT VIEW ─── */}
      {activeRole === 'student' && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
            <h3 className="text-sm font-semibold text-black mb-4">Upload Document</h3>

            {/* Type selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['Form 1 — Adult Sponsor', 'Form 1A — Student Checklist', 'Form 4 — Human Participants', 'Form 4 — Informed Consent', 'NCSEF Parent Release', 'Research Plan', 'Research Paper', 'Other ISEF Form'].map(t => (
                <button
                  key={t}
                  onClick={() => setDocType(t)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    docType === t ? 'bg-black text-white border-black' : 'text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragging ? 'border-black bg-gray-50 scale-[1.01]' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input ref={fileRef} type="file" className="hidden" onChange={handleFiles} />
              {Ico.upload('w-10 h-10 text-gray-300 mx-auto mb-3')}
              <p className="text-sm font-semibold text-black mb-1">
                {dragging ? 'Drop it!' : 'Drag & drop your file here'}
              </p>
              <p className="text-xs text-gray-400">or click to browse — PDF, DOCX, PNG up to 25 MB</p>
              <p className="text-xs text-gray-400 mt-1">
                Uploading as: <span className="font-semibold text-black">{docType}</span>
              </p>
            </div>
          </div>

          {/* My Docs */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-black">My Submissions</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{myDocs.length} document{myDocs.length !== 1 ? 's' : ''}</p>
            </div>
            {myDocs.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">No documents uploaded yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myDocs.map(doc => (
                  <div key={doc.id} className="px-6 py-4 animate-fade-in">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {Ico.file('w-4 h-4 text-gray-500')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-black truncate">{doc.file}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{doc.type} · {doc.date} · {doc.size}</p>
                        </div>
                      </div>
                      <Badge status={doc.status} />
                    </div>
                    {doc.feedback && (
                      <div className="mt-3 ml-12 bg-red-50 border border-red-100 rounded-xl p-3.5 animate-fade-in">
                        <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-1">Reviewer Feedback</p>
                        <p className="text-xs text-red-700 leading-relaxed">{doc.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── ADMIN VIEW ─── */}
      {activeRole === 'admin' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {stats.map(s => (
              <div key={s.label} className={`rounded-2xl border p-5 ${s.bg}`}>
                <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs font-medium text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Review Queue */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-black">Review Queue</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">All student document submissions</p>
            </div>
            <div className="divide-y divide-gray-50">
              {documents.map(doc => (
                <div key={doc.id} className="px-6 py-4 animate-fade-in">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {Ico.file('w-4 h-4 text-gray-500')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-black truncate">{doc.file}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          <span className="font-semibold text-gray-600">{doc.student}</span>
                          {' · '}{doc.type}{' · '}{doc.date}{doc.size ? ` · ${doc.size}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <Badge status={doc.status} />
                      {doc.status === 'Pending Review' && (
                        <>
                          <button
                            onClick={() => approve(doc.id)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setDenyDocId(doc.id); setDenyReason('') }}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition"
                          >
                            Deny
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {doc.feedback && (
                    <div className="mt-3 ml-12 bg-red-50 border border-red-100 rounded-xl p-3.5">
                      <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-1">Denial Reason Sent</p>
                      <p className="text-xs text-red-700 leading-relaxed">{doc.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Deny Modal */}
      {denyDocId !== null && (
        <Modal title="Request Changes" onClose={() => setDenyDocId(null)}>
          <p className="text-sm text-gray-600 mb-4">
            Provide specific, actionable feedback so the student knows exactly what to revise.
          </p>
          <textarea
            value={denyReason}
            onChange={e => setDenyReason(e.target.value)}
            placeholder="e.g. Please revise the methodology section — your control variables need clearer operational definitions. Section 2.3 should also justify your statistical test choice."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition"
          />
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => setDenyDocId(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={submitDeny}
              disabled={!denyReason.trim()}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send Feedback
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ================================================================
   ROOT APP
   ================================================================ */

export default function App() {
  const [user, setUser]           = useState(null)
  const [activeRole, setActiveRole] = useState('student')
  const [activeTab, setActiveTab]   = useState('attendance')
  const [attendanceLogs, setAttendanceLogs] = useState(INITIAL_ATTENDANCE)
  const [documents, setDocuments]   = useState(INITIAL_DOCUMENTS)

  const login = (u) => {
    setUser(u)
    setActiveRole(u.role)
    setActiveTab('attendance')
  }

  const logout = () => {
    setUser(null)
    setActiveRole('student')
    setActiveTab('attendance')
  }

  if (!user) return <LoginPage onLogin={login} />

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Role toggle — fixed bottom-right */}
      <div className="fixed bottom-5 right-5 z-50">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Demo Role</p>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['student', 'admin'].map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeRole === role
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        activeRole={activeRole}
        onLogout={logout}
      />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 pb-24">
          {activeTab === 'attendance' && (
            <AttendanceTab
              logs={attendanceLogs}
              onAddLog={log => setAttendanceLogs(prev => [...prev, log])}
            />
          )}
          {activeTab === 'mentor'   && <MentorTab />}
          {activeTab === 'forms'    && <FormsTab />}
          {activeTab === 'research' && (
            <ResearchTab
              activeRole={activeRole}
              documents={documents}
              setDocuments={setDocuments}
            />
          )}
        </div>
      </main>
    </div>
  )
}
