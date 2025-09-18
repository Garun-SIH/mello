import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

// Translation data
const translations = {
  en: {
    // Common
    welcome: "Welcome",
    dashboard: "Dashboard",
    logout: "Logout",
    login: "Login",
    register: "Register",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    
    // Navigation
    moodTracker: "Mood Tracker",
    aiChatSupport: "AI Chat Support",
    bookCounselor: "Book Counselor",
    peerSupport: "Peer Support",
    wellnessResources: "Wellness Resources",
    selfAssessments: "Self Assessments",
    newsletter: "Newsletter",
    giveFeedback: "Give Feedback",
    
    // Dashboard
    welcomeBack: "Welcome back",
    howAreYouFeeling: "How are you feeling today?",
    chatWithAI: "Chat with AI",
    bookSession: "Book Session",
    moodStreak: "Mood Streak",
    weeklyChatCount: "Weekly Chats",
    upcomingSessions: "Upcoming Sessions",
    moodTrend: "Mood Trend",
    todaysMoodCheck: "Today's Mood Check",
    logMood: "Log Mood",
    noMoodData: "No mood data for today",
    logFirstMoodEntry: "Log your first mood entry",
    quickAccess: "Quick Access",
    resourceLibrary: "Resource Library",
    peerForum: "Peer Forum",
    assessmentTools: "Assessment Tools",
    mentalHealthInsights: "Your Mental Health Insights",
    averageMood: "Average Mood",
    averageEnergy: "Average Energy",
    averageStress: "Average Stress",
    
    // Mood Tracker
    moodScore: "Mood Score",
    energyLevel: "Energy Level",
    stressLevel: "Stress Level",
    sleepHours: "Sleep Hours",
    notes: "Notes",
    
    // Registration
    joinMello: "Join Mello",
    createAccount: "Create your account to get started",
    completeRegistration: "Complete Your Registration",
    completeProfileInfo: "Please provide additional information to complete your account setup",
    registeringAs: "I am registering as:",
    studentUser: "Student/User",
    counselor: "Counselor",
    fullName: "Full Name",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    studentInformation: "Student Information",
    age: "Age",
    language: "Language",
    universityCollege: "University/College",
    professionalInformation: "Professional Information",
    specialization: "Specialization",
    licenseNumber: "License Number",
    phoneNumber: "Phone Number",
    address: "Address",
    createAccountBtn: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    signInHere: "Sign in here",
    
    // Languages
    english: "English",
    hindi: "Hindi",
    kashmiri: "Kashmiri",
    dogri: "Dogri",
    urdu: "Urdu"
  },
  
  hi: {
    // Common
    welcome: "स्वागत है",
    dashboard: "डैशबोर्ड",
    logout: "लॉग आउट",
    login: "लॉग इन",
    register: "पंजीकरण",
    loading: "लोड हो रहा है...",
    save: "सेव करें",
    cancel: "रद्द करें",
    submit: "जमा करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    search: "खोजें",
    
    // Navigation
    moodTracker: "मूड ट्रैकर",
    aiChatSupport: "AI चैट सहायता",
    bookCounselor: "काउंसलर बुक करें",
    peerSupport: "साथी सहायता",
    wellnessResources: "कल्याण संसाधन",
    selfAssessments: "स्व-मूल्यांकन",
    newsletter: "न्यूज़लेटर",
    giveFeedback: "फीडबैक दें",
    
    // Dashboard
    welcomeBack: "वापस स्वागत है",
    howAreYouFeeling: "आज आप कैसा महसूस कर रहे हैं?",
    chatWithAI: "AI के साथ चैट करें",
    bookSession: "सेशन बुक करें",
    moodStreak: "मूड स्ट्रीक",
    weeklyChatCount: "साप्ताहिक चैट",
    upcomingSessions: "आगामी सेशन",
    moodTrend: "मूड ट्रेंड",
    todaysMoodCheck: "आज का मूड चेक",
    logMood: "मूड लॉग करें",
    noMoodData: "आज के लिए कोई मूड डेटा नहीं",
    logFirstMoodEntry: "अपनी पहली मूड एंट्री लॉग करें",
    quickAccess: "त्वरित पहुंच",
    resourceLibrary: "संसाधन पुस्तकालय",
    peerForum: "साथी फोरम",
    assessmentTools: "मूल्यांकन उपकरण",
    mentalHealthInsights: "आपकी मानसिक स्वास्थ्य अंतर्दृष्टि",
    averageMood: "औसत मूड",
    averageEnergy: "औसत ऊर्जा",
    averageStress: "औसत तनाव",
    
    // Mood Tracker
    moodScore: "मूड स्कोर",
    energyLevel: "ऊर्जा स्तर",
    stressLevel: "तनाव स्तर",
    sleepHours: "नींद के घंटे",
    notes: "नोट्स",
    
    // Registration
    joinMello: "मेलो में शामिल हों",
    createAccount: "शुरू करने के लिए अपना खाता बनाएं",
    completeRegistration: "अपना पंजीकरण पूरा करें",
    completeProfileInfo: "कृपया अपना खाता सेटअप पूरा करने के लिए अतिरिक्त जानकारी प्रदान करें",
    registeringAs: "मैं इस रूप में पंजीकरण कर रहा हूं:",
    studentUser: "छात्र/उपयोगकर्ता",
    counselor: "काउंसलर",
    fullName: "पूरा नाम",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    studentInformation: "छात्र जानकारी",
    age: "उम्र",
    language: "भाषा",
    universityCollege: "विश्वविद्यालय/कॉलेज",
    professionalInformation: "व्यावसायिक जानकारी",
    specialization: "विशेषज्ञता",
    licenseNumber: "लाइसेंस नंबर",
    phoneNumber: "फोन नंबर",
    address: "पता",
    createAccountBtn: "खाता बनाएं",
    alreadyHaveAccount: "क्या आपका पहले से खाता है?",
    signInHere: "यहां साइन इन करें",
    
    // Languages
    english: "अंग्रेजी",
    hindi: "हिंदी",
    kashmiri: "कश्मीरी",
    dogri: "डोगरी",
    urdu: "उर्दू"
  },
  
  ks: {
    // Common (Kashmiri)
    welcome: "خوش آمدید",
    dashboard: "ڈیش بورڈ",
    logout: "لاگ آؤٹ",
    login: "لاگ ان",
    register: "رجسٹر",
    loading: "لوڈ ہو رہا ہے...",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    submit: "جمع کریں",
    edit: "ترمیم",
    delete: "حذف کریں",
    search: "تلاش",
    
    // Navigation
    moodTracker: "موڈ ٹریکر",
    aiChatSupport: "AI چیٹ سپورٹ",
    bookCounselor: "کاؤنسلر بک کریں",
    peerSupport: "ہم عمر سپورٹ",
    wellnessResources: "تندرستی کے وسائل",
    selfAssessments: "خود تشخیص",
    newsletter: "نیوز لیٹر",
    giveFeedback: "رائے دیں",
    
    // Dashboard
    welcomeBack: "واپس خوش آمدید",
    howAreYouFeeling: "آج آپ کیسا محسوس کر رہے ہیں؟",
    chatWithAI: "AI کے ساتھ چیٹ کریں",
    bookSession: "سیشن بک کریں",
    moodStreak: "موڈ سٹریک",
    weeklyChatCount: "ہفتہ وار چیٹس",
    upcomingSessions: "آنے والے سیشنز",
    moodTrend: "موڈ ٹرینڈ",
    todaysMoodCheck: "آج کا موڈ چیک",
    logMood: "موڈ لاگ کریں",
    noMoodData: "آج کے لیے کوئی موڈ ڈیٹا نہیں",
    logFirstMoodEntry: "اپنی پہلی موڈ انٹری لاگ کریں",
    quickAccess: "فوری رسائی",
    resourceLibrary: "وسائل کی لائبریری",
    peerForum: "ہم عمر فورم",
    assessmentTools: "تشخیصی ٹولز",
    mentalHealthInsights: "آپ کی ذہنی صحت کی بصیرت",
    averageMood: "اوسط موڈ",
    averageEnergy: "اوسط توانائی",
    averageStress: "اوسط تناؤ",
    
    // Languages
    english: "انگریزی",
    hindi: "ہندی",
    kashmiri: "کشمیری",
    dogri: "ڈوگری",
    urdu: "اردو"
  },
  
  doi: {
    // Common (Dogri)
    welcome: "स्वागत",
    dashboard: "डैशबोर्ड",
    logout: "लॉग आउट",
    login: "लॉग इन",
    register: "रजिस्टर",
    loading: "लोड होआ...",
    save: "सेव करो",
    cancel: "रद्द करो",
    submit: "जमा करो",
    edit: "संपादन",
    delete: "मिटाओ",
    search: "खोजो",
    
    // Navigation
    moodTracker: "मूड ट्रैकर",
    aiChatSupport: "AI चैट सहायता",
    bookCounselor: "काउंसलर बुक करो",
    peerSupport: "साथी सहायता",
    wellnessResources: "कल्याण संसाधन",
    selfAssessments: "स्व-मूल्यांकन",
    newsletter: "न्यूजलेटर",
    giveFeedback: "फीडबैक दो",
    
    // Dashboard
    welcomeBack: "वापस स्वागत",
    howAreYouFeeling: "अज्ज तुसां कियां महसूस करा?",
    chatWithAI: "AI कन्ने चैट करो",
    bookSession: "सेशन बुक करो",
    moodStreak: "मूड स्ट्रीक",
    weeklyChatCount: "हफ्तावार चैट",
    upcomingSessions: "आने आळे सेशन",
    moodTrend: "मूड ट्रेंड",
    todaysMoodCheck: "अज्ज दा मूड चेक",
    logMood: "मूड लॉग करो",
    noMoodData: "अज्ज लेई कोई मूड डेटा नेईं",
    logFirstMoodEntry: "अपनी पैहली मूड एंट्री लॉग करो",
    quickAccess: "तुरंत पहुंच",
    resourceLibrary: "संसाधन पुस्तकालय",
    peerForum: "साथी फोरम",
    assessmentTools: "मूल्यांकन उपकरण",
    mentalHealthInsights: "तुंदी मानसिक स्वास्थ्य अंतर्दृष्टि",
    averageMood: "औसत मूड",
    averageEnergy: "औसत ऊर्जा",
    averageStress: "औसत तनाव",
    
    // Languages
    english: "अंग्रेजी",
    hindi: "हिंदी",
    kashmiri: "कश्मीरी",
    dogri: "डोगरी",
    urdu: "उर्दू"
  },
  
  ur: {
    // Common (Urdu)
    welcome: "خوش آمدید",
    dashboard: "ڈیش بورڈ",
    logout: "لاگ آؤٹ",
    login: "لاگ ان",
    register: "رجسٹر",
    loading: "لوڈ ہو رہا ہے...",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    submit: "جمع کریں",
    edit: "ترمیم",
    delete: "حذف کریں",
    search: "تلاش",
    
    // Navigation
    moodTracker: "موڈ ٹریکر",
    aiChatSupport: "AI چیٹ سپورٹ",
    bookCounselor: "کاؤنسلر بک کریں",
    peerSupport: "ہم عمر سپورٹ",
    wellnessResources: "تندرستی کے وسائل",
    selfAssessments: "خود تشخیص",
    newsletter: "نیوز لیٹر",
    giveFeedback: "رائے دیں",
    
    // Dashboard
    welcomeBack: "واپس خوش آمدید",
    howAreYouFeeling: "آج آپ کیسا محسوس کر رہے ہیں؟",
    chatWithAI: "AI کے ساتھ چیٹ کریں",
    bookSession: "سیشن بک کریں",
    moodStreak: "موڈ سٹریک",
    weeklyChatCount: "ہفتہ وار چیٹس",
    upcomingSessions: "آنے والے سیشنز",
    moodTrend: "موڈ ٹرینڈ",
    todaysMoodCheck: "آج کا موڈ چیک",
    logMood: "موڈ لاگ کریں",
    noMoodData: "آج کے لیے کوئی موڈ ڈیٹا نہیں",
    logFirstMoodEntry: "اپنی پہلی موڈ انٹری لاگ کریں",
    quickAccess: "فوری رسائی",
    resourceLibrary: "وسائل کی لائبریری",
    peerForum: "ہم عمر فورم",
    assessmentTools: "تشخیصی ٹولز",
    mentalHealthInsights: "آپ کی ذہنی صحت کی بصیرت",
    averageMood: "اوسط موڈ",
    averageEnergy: "اوسط توانائی",
    averageStress: "اوسط تناؤ",
    
    // Mood Tracker
    moodScore: "موڈ سکور",
    energyLevel: "توانائی کی سطح",
    stressLevel: "تناؤ کی سطح",
    sleepHours: "نیند کے گھنٹے",
    notes: "نوٹس",
    
    // Registration
    joinMello: "میلو میں شامل ہوں",
    createAccount: "شروع کرنے کے لیے اپنا اکاؤنٹ بنائیں",
    completeRegistration: "اپنی رجسٹریشن مکمل کریں",
    completeProfileInfo: "براہ کرم اپنا اکاؤنٹ سیٹ اپ مکمل کرنے کے لیے اضافی معلومات فراہم کریں",
    registeringAs: "میں اس طور پر رجسٹر کر رہا ہوں:",
    studentUser: "طالب علم/صارف",
    counselor: "کاؤنسلر",
    fullName: "پورا نام",
    emailAddress: "ای میل ایڈریس",
    password: "پاس ورڈ",
    confirmPassword: "پاس ورڈ کی تصدیق کریں",
    studentInformation: "طالب علم کی معلومات",
    age: "عمر",
    language: "زبان",
    universityCollege: "یونیورسٹی/کالج",
    professionalInformation: "پیشہ ورانہ معلومات",
    specialization: "تخصص",
    licenseNumber: "لائسنس نمبر",
    phoneNumber: "فون نمبر",
    address: "پتہ",
    createAccountBtn: "اکاؤنٹ بنائیں",
    alreadyHaveAccount: "کیا آپ کا پہلے سے اکاؤنٹ ہے؟",
    signInHere: "یہاں سائن ان کریں",
    
    // Languages
    english: "انگریزی",
    hindi: "ہندی",
    kashmiri: "کشمیری",
    dogri: "ڈوگری",
    urdu: "اردو"
  }
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('mello-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('mello-language', languageCode);
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر' },
      { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
