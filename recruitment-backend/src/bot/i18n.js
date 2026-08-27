const STATUS_LABELS = {
  en: {
    submitted: 'Submitted',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Scheduled',
    interviewed: 'Interviewed',
    passed: 'Passed',
    hired: 'Hired',
    rejected: 'Not selected',
  },
  kh: {
    submitted: 'បានដាក់ស្នើ',
    shortlisted: 'បញ្ជីខ្លី',
    interview_scheduled: 'បានកំណត់សំភាសន៍',
    interviewed: 'បានសំភាសន៍',
    passed: 'ជាប់',
    hired: 'ជាប់ការងារ',
    rejected: 'មិនត្រូវបានជ្រើសរើស',
  },
};

function statusLabel(lang, status) {
  return (STATUS_LABELS[lang] || STATUS_LABELS.en)[status] || status || '';
}

const STRINGS = {
  en: {
    chooseLanguage: 'Please choose your language:',
    languageSet: 'Language set to English ✅',
    mainMenuPrompt: 'What would you like to do?',
    btnSubmitCv: '📄 Submit CV',
    btnMyApplication: '📋 My Application',
    btnInterviewInfo: '🗓️ Interview Information',
    btnInterviewStatus: '📊 Interview Status',
    btnContactHelp: '💬 Contact / Help',
    btnChangeLanguage: '🌐 Change Language',
    notLinkedYet: ({ formUrl }) => `We don't have an application on file for you yet. Please apply here first: ${formUrl}`,
    submitCvPrompt: ({ formUrl }) =>
      `You can submit your CV and information here: ${formUrl}\n\nOnce submitted, you'll be automatically connected to updates.`,
    connectedWelcome: ({ name }) => `Hi ${name}! You're connected. Use the menu below anytime.`,
    myApplication: ({ position, status }) => `Position: ${position || 'Not specified'}\nStatus: ${statusLabel('en', status)}`,
    interviewScheduled: ({ date, time, location }) =>
      `Your interview is scheduled:\n📅 ${date}\n🕐 ${time}\n📍 ${location || 'To be confirmed'}`,
    interviewNotScheduled: "Your interview hasn't been scheduled yet. We'll message you here as soon as it is.",
    interviewStatus: ({ status }) => `Current status: ${statusLabel('en', status)}`,
    contactHelp: 'Need help? Just reply here and a recruiter will follow up with you.',
    draftInterviewInvite: ({ name, interview }) => {
      if (interview && interview.scheduled_at) {
        const d = new Date(interview.scheduled_at);
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `Hi ${name}! Good news — you've been shortlisted. Your interview is scheduled for ${d.toLocaleDateString()} at ${time}${interview.location ? ` at ${interview.location}` : ''}. See you then!`;
      }
      return `Hi ${name}! Good news — you've been shortlisted. We'd like to invite you for an interview. Our recruiter will follow up shortly with the time and place.`;
    },
    draftOrientationInvite: ({ name, link }) =>
      `Congratulations ${name}! You've passed the interview. Please fill out this short form so we can prepare your orientation: ${link}`,
    draftNotPassed: ({ name }) =>
      `Hi ${name}, thank you for interviewing with us. After careful consideration, we won't be moving forward at this time. We appreciate your interest and wish you the best.`,
    draftFurtherInterview: ({ name }) =>
      `Hi ${name}, thank you for your interview. We'd like to invite you for a further round. Our recruiter will follow up with details.`,
    draftSelected: ({ name }) =>
      `Congratulations ${name}! You've been selected. Welcome aboard — our team will be in touch with next steps.`,
  },
  kh: {
    chooseLanguage: 'សូមជ្រើសរើសភាសារបស់អ្នក៖',
    languageSet: 'បានកំណត់ភាសាជាភាសាខ្មែរ ✅',
    mainMenuPrompt: 'តើអ្នកចង់ធ្វើអ្វី?',
    btnSubmitCv: '📄 ដាក់ស្នើ CV',
    btnMyApplication: '📋 ពាក្យសុំរបស់ខ្ញុំ',
    btnInterviewInfo: '🗓️ ព័ត៌មានសំភាសន៍',
    btnInterviewStatus: '📊 ស្ថានភាពសំភាសន៍',
    btnContactHelp: '💬 ទំនាក់ទំនង / ជំនួយ',
    btnChangeLanguage: '🌐 ប្តូរភាសា',
    notLinkedYet: ({ formUrl }) => `យើងមិនទាន់មានពាក្យសុំរបស់អ្នកនៅឡើយទេ។ សូមដាក់ពាក្យសុំនៅទីនេះជាមុន៖ ${formUrl}`,
    submitCvPrompt: ({ formUrl }) =>
      `អ្នកអាចដាក់ស្នើ CV និងព័ត៌មានរបស់អ្នកនៅទីនេះ៖ ${formUrl}\n\nបន្ទាប់ពីដាក់ស្នើ អ្នកនឹងភ្ជាប់ដោយស្វ័យប្រវត្តិ។`,
    connectedWelcome: ({ name }) => `សួស្តី ${name}! អ្នកបានភ្ជាប់ហើយ។ ប្រើម៉ឺនុយខាងក្រោមបានគ្រប់ពេល។`,
    myApplication: ({ position, status }) => `តួនាទី៖ ${position || 'មិនបានបញ្ជាក់'}\nស្ថានភាព៖ ${statusLabel('kh', status)}`,
    interviewScheduled: ({ date, time, location }) =>
      `សំភាសន៍របស់អ្នកត្រូវបានកំណត់ពេល៖\n📅 ${date}\n🕐 ${time}\n📍 ${location || 'នឹងបញ្ជាក់ក្រោយ'}`,
    interviewNotScheduled: 'សំភាសន៍របស់អ្នកមិនទាន់ត្រូវបានកំណត់ពេលទេ។ យើងនឹងផ្ញើសារជូនអ្នកនៅទីនេះនៅពេលកំណត់រួច។',
    interviewStatus: ({ status }) => `ស្ថានភាពបច្ចុប្បន្ន៖ ${statusLabel('kh', status)}`,
    contactHelp: 'ត្រូវការជំនួយ? សូមឆ្លើយតបនៅទីនេះ ហើយអ្នកជ្រើសរើសនឹងទាក់ទងអ្នក។',
    draftInterviewInvite: ({ name, interview }) => {
      if (interview && interview.scheduled_at) {
        const d = new Date(interview.scheduled_at);
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `សួស្តី ${name}! ដំណឹងល្អ — អ្នកត្រូវបានជ្រើសរើសចូលបញ្ជីខ្លី។ សំភាសន៍របស់អ្នកត្រូវបានកំណត់ថ្ងៃទី ${d.toLocaleDateString()} ម៉ោង ${time}${interview.location ? ` នៅ ${interview.location}` : ''}។ ជួបគ្នាពេលនោះ!`;
      }
      return `សួស្តី ${name}! ដំណឹងល្អ — អ្នកត្រូវបានជ្រើសរើសចូលបញ្ជីខ្លី។ យើងចង់អញ្ជើញអ្នកមកសំភាសន៍។ អ្នកជ្រើសរើសនឹងទាក់ទងអ្នកឆាប់ៗនេះ។`;
    },
    draftOrientationInvite: ({ name, link }) =>
      `សូមអបអរសាទរ ${name}! អ្នកបានជាប់សំភាសន៍។ សូមបំពេញទម្រង់នេះដើម្បីរៀបចំការតម្រង់ទិសរបស់អ្នក៖ ${link}`,
    draftNotPassed: ({ name }) =>
      `សួស្តី ${name} សូមអរគុណសម្រាប់ការសំភាសន៍ជាមួយយើង។ បន្ទាប់ពីពិចារណាដោយប្រុងប្រយ័ត្ន យើងនឹងមិនបន្តទៅមុខទៀតទេនៅពេលនេះ។ សូមអរគុណចំពោះចំណាប់អារម្មណ៍របស់អ្នក។`,
    draftFurtherInterview: ({ name }) =>
      `សួស្តី ${name} សូមអរគុណសម្រាប់ការសំភាសន៍។ យើងចង់អញ្ជើញអ្នកសម្រាប់វគ្គបន្ថែម។ អ្នកជ្រើសរើសនឹងទាក់ទងជាមួយព័ត៌មានលម្អិត។`,
    draftSelected: ({ name }) =>
      `សូមអបអរសាទរ ${name}! អ្នកត្រូវបានជ្រើសរើស។ សូមស្វាគមន៍ — ក្រុមការងាររបស់យើងនឹងទាក់ទងជាមួយជំហានបន្ទាប់។`,
  },
};

export function t(lang, key, vars = {}) {
  const dict = STRINGS[lang] || STRINGS.en;
  const entry = dict[key] ?? STRINGS.en[key];
  if (typeof entry === 'function') return entry(vars);
  return entry;
}