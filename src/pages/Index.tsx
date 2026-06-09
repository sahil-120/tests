import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNepalTime, useCountdown } from "@/hooks/useNepalTime";
import { practiceSubjects, motivationalQuotes } from "@/data/questions";
import { calculateBSAge, bsMonthNames, toNepaliDigits, type BSDate } from "@/lib/nepaliCalendar";
import QuestionOfTheDay from "@/components/QuestionOfTheDay";
import StudyProgress from "@/components/StudyProgress";
import PersonalizedDashboard from "@/components/PersonalizedDashboard";
import DailyMCQCard from "@/components/DailyMCQCard";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Zap, BookOpen, Trophy, ArrowRight, ExternalLink } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

// Ashad 7, 2082 BS ≈ June 22, 2026 AD
const EXAM_DATE = new Date("2026-06-22T10:00:00+05:45");

const quickAccess = [
  { label: "MCQ Practice", icon: "❓", path: "/practice", color: "from-red-500 to-rose-600" },
  { label: "Old Sets", icon: "🏆", path: "/old-is-gold", color: "from-green-500 to-emerald-600" },
  { label: "Online Exam", icon: "📝", path: "/online-exam", color: "from-teal-500 to-cyan-600" },
  { label: "Subjective", icon: "📖", path: "/subjective", color: "from-blue-500 to-indigo-600" },
  { label: "Syllabus", icon: "📋", path: "/syllabus", color: "from-purple-500 to-fuchsia-600" },
  { label: "Typing", icon: "⌨️", path: "/typing", color: "from-amber-500 to-orange-600" },
  { label: "Notes", icon: "📒", path: "/notes", color: "from-slate-600 to-slate-800" },
  { label: "Downloads", icon: "📰", path: "/downloads", color: "from-pink-500 to-rose-600" },
];

const importantLinks = [
  { name: "PSC Nepal", desc: "psc.gov.np — Official Commission", url: "https://psc.gov.np", icon: "🏛️" },
  { name: "MoCIT Nepal", desc: "Ministry of Communications & IT", url: "https://mocit.gov.np", icon: "🏢" },
  { name: "NITC Nepal", desc: "National IT Center", url: "https://nitc.gov.np", icon: "🖥️" },
  { name: "DoIT", desc: "Department of IT", url: "https://doit.gov.np", icon: "📡" },
  { name: "NTA", desc: "Nepal Telecom Authority", url: "https://nta.gov.np", icon: "📶" },
];

const heroStats = [
  { value: "2000+", label: "Questions", icon: "❓" },
  { value: "50+", label: "Old Sets", icon: "📚" },
  { value: "Free", label: "Always", icon: "✨" },
  { value: "24/7", label: "Available", icon: "🌐" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
};

const Index = () => {
  const { timeStr, dateStr, bsDate } = useNepalTime();
  const countdown = useCountdown(EXAM_DATE);
  const { user } = useAuth();
  const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);

  // BS Age converter
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [ageResult, setAgeResult] = useState<string | null>(null);

  const calculateAge = () => {
    if (!birthYear || !birthMonth || !birthDay) return;
    const birthBS: BSDate = { year: parseInt(birthYear), month: parseInt(birthMonth), day: parseInt(birthDay) };
    const age = calculateBSAge(birthBS, bsDate);
    setAgeResult(`तपाईँको उमेर: ${toNepaliDigits(age.years)} वर्ष, ${toNepaliDigits(age.months)} महिना, ${toNepaliDigits(age.days)} दिन`);
  };

  return (
    <PageTransition>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-64 -right-64 w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              x: [0, -100, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Left: Title + subtitle */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 text-center md:text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-6 backdrop-blur-md shadow-xl"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                नेपाल सरकार — PSC Preparation
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight mb-4 tracking-tight drop-shadow-lg">
                <span className="text-white">🏛️ लोकसेवा</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Practice Dashboard
                </span>
              </h1>
              
              <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl font-medium leading-relaxed">
                Computer Operator & IT Officer Preparation — Free, Complete & Up-to-date
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link to="/practice">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/30 text-base"
                  >
                    Start Practice <ArrowRight size={18} />
                  </motion.button>
                </Link>
                <Link to="/online-exam">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 font-bold px-8 py-3.5 rounded-2xl backdrop-blur-sm transition-all text-base"
                  >
                    Take Mock Exam
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Live clock + stats */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col gap-5 w-full md:w-auto"
            >
              {/* Clock */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm font-semibold mb-2 uppercase tracking-widest">
                  <Clock size={14} /> Nepal Standard Time
                </div>
                <div className="text-5xl md:text-6xl font-heading font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-md">
                  {timeStr}
                </div>
                <div className="text-cyan-300/80 text-sm mt-3 font-semibold tracking-wide">{dateStr}</div>
              </div>
              
              {/* Mini stats */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-4 gap-3"
              >
                {heroStats.map((s) => (
                  <motion.div key={s.label} variants={itemVariants} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl py-3 text-center hover:bg-white/10 transition-colors cursor-default group">
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{s.icon}</div>
                    <div className="text-white font-bold text-sm leading-none">{s.value}</div>
                    <div className="text-white/50 text-[10px] mt-1 uppercase font-bold tracking-wider">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-12 space-y-12">

        {/* Personalized dashboard (signed in only) */}
        {user && <PersonalizedDashboard />}

        {/* Daily MCQ */}
        <DailyMCQCard />

        {/* Question of the Day */}
        <QuestionOfTheDay />

        {/* ── Quick Access ── */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-6"
          >
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Zap size={24} /></div>
            Quick Access
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4"
          >
            {quickAccess.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-shadow border border-white/20`}
                >
                  <span className="text-4xl drop-shadow-md">{item.icon}</span>
                  <span className="text-white text-xs font-bold tracking-wide text-center">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </section>

        {/* ── Countdown + Links ── */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Countdown */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3 text-lg font-bold text-gray-800">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Trophy size={20} /></div>
                Exam Countdown
              </div>
              <span className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs px-3 py-1.5 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live
              </span>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-b-3xl">
              <p className="text-white/80 text-sm font-medium mb-6 flex items-center gap-2">
                💻 Computer Operator (5th Level) — Written Exam
              </p>
              {countdown.expired ? (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
                  <p className="text-2xl font-bold text-emerald-400">परीक्षा सकियो! 🎉</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { val: countdown.days, label: "DAYS" },
                    { val: countdown.hours, label: "HRS" },
                    { val: countdown.minutes, label: "MIN" },
                    { val: countdown.seconds, label: "SEC" },
                  ].map((t) => (
                    <div key={t.label} className="bg-white/10 border border-white/10 rounded-2xl py-4 text-center backdrop-blur-sm">
                      <div className="text-3xl md:text-4xl font-heading font-black text-white drop-shadow-md">
                        {t.val.toString().padStart(2, "0")}
                      </div>
                      <div className="text-cyan-300 text-[11px] mt-1 font-bold tracking-widest">{t.label}</div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-white/40 text-xs mt-5 text-center font-medium">आसार ७, २०८२ — Update once PSC announces officially.</p>
            </div>
          </motion.section>

          {/* Important Links */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 text-lg font-bold text-gray-800 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><ExternalLink size={20} /></div>
              Important Links
            </div>
            <div className="space-y-3">
              {importantLinks.map((link) => (
                <motion.a
                  whileHover={{ scale: 1.02, x: 5 }}
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors group"
                >
                  <span className="text-3xl drop-shadow-sm">{link.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 group-hover:text-indigo-700 transition-colors">{link.name}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{link.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white text-gray-400 transition-colors">
                    <ExternalLink size={14} />
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ── Motivational Quote ── */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-10 text-center relative overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px"
          }} />
          <motion.p 
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            className="relative text-xl md:text-2xl font-heading font-bold italic leading-relaxed drop-shadow-md"
          >
            "{quote}"
          </motion.p>
          <p className="relative text-white/70 text-sm mt-4 font-bold tracking-widest uppercase">— Keep going! 💪</p>
        </motion.section>

      </div>
    </PageTransition>
  );
};

export default Index;
