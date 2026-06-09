import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo.png";
import {
  Menu, X, BookOpen, LogIn, LogOut, Shield,
  Home, Calendar, HelpCircle, Trophy, FileText,
  BookMarked, Medal, BookCheck, Keyboard, StickyNote,
  Download, ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";

const navItems = [
  { label: "Home",        path: "/",            icon: <Home size={15} /> },
  { label: "Daily MCQ",   path: "/daily-mcq",   icon: <Calendar size={15} /> },
  { label: "MCQ",         path: "/practice",    icon: <HelpCircle size={15} /> },
  { label: "Old Sets",    path: "/old-is-gold", icon: <Trophy size={15} /> },
  { label: "Exam",        path: "/online-exam", icon: <FileText size={15} /> },
  { label: "Subjective",  path: "/subjective",  icon: <BookMarked size={15} /> },
  { label: "Leaderboard", path: "/leaderboard", icon: <Medal size={15} /> },
  { label: "Syllabus",    path: "/syllabus",    icon: <BookCheck size={15} /> },
  { label: "Typing",      path: "/typing",      icon: <Keyboard size={15} /> },
  { label: "Notes",       path: "/notes",       icon: <StickyNote size={15} /> },
  { label: "Downloads",   path: "/downloads",   icon: <Download size={15} /> },
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(15, 23, 42, 0.85)" : "rgba(15, 23, 42, 1)",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled
            ? "0 4px 24px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05)"
            : "0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="px-4 mx-auto max-w-screen-2xl">
          <div className="flex items-center h-16 gap-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group mr-4">
              <motion.img
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                src={logoImg}
                alt="Loksewa Pro Logo"
                className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-500/20"
              />
              <div className="hidden sm:block leading-tight">
                <span className="font-bold text-white text-base tracking-tight block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  लोकसेवा Pro
                </span>
                <span className="text-blue-400 text-[10px] tracking-widest font-bold">NEPAL</span>
              </div>
            </Link>

            {/* ── Desktop Nav (horizontally scrollable) ── */}
            <div className="flex-1 hidden md:block overflow-hidden relative">
              <div
                className="flex items-center gap-1 overflow-x-auto py-2 px-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold
                        whitespace-nowrap flex-shrink-0 transition-colors z-10
                        ${active ? "text-white" : "text-white/60 hover:text-white"}
                      `}
                    >
                      {active && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className={active ? "text-blue-400" : "text-white/40"}>
                        {item.icon}
                      </span>
                      {item.label}
                      {active && (
                        <motion.span 
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full" 
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── Desktop Actions ── */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-auto">
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin-panel")}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/25 px-4 py-2 rounded-full transition-all duration-200"
                >
                  <Shield size={14} /> Admin
                </motion.button>
              )}
              {user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  title={user.email || ""}
                  className="flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 rounded-full transition-all duration-200"
                >
                  <LogOut size={14} /> Sign out
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 rounded-full shadow-lg shadow-blue-600/30 transition-all duration-200"
                >
                  <LogIn size={14} /> Sign in
                </motion.button>
              )}
            </div>

            {/* ── Mobile: actions + hamburger ── */}
            <div className="flex md:hidden items-center gap-3 ml-auto">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-white/60 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-full shadow shadow-blue-600/30 transition-all"
                >
                  <LogIn size={12} /> Sign in
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setDrawerOpen(true)}
                className="text-white p-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>

          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      </motion.nav>

      {/* ── Mobile Drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden pointer-events-auto"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-[70] h-full w-[280px] flex flex-col md:hidden"
              style={{
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(20px)",
                borderRight: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "8px 0 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={logoImg}
                    alt="Loksewa Pro Logo"
                    className="w-10 h-10 rounded-xl object-cover shadow-md"
                  />
                  <div>
                    <p className="font-bold text-white text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      लोकसेवा Pro
                    </p>
                    <p className="text-blue-400 text-[10px] tracking-widest font-bold">NEPAL</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-white/50 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto py-4 px-3">
                <p className="text-white/40 text-[11px] font-bold tracking-widest px-3 mb-3">NAVIGATION</p>
                {navItems.map((item, i) => {
                  const active = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        className={`
                          flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold mb-1
                          transition-all duration-200 group
                          ${active
                            ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border border-blue-500/30 shadow-inner"
                            : "text-white/70 hover:text-white hover:bg-white/10 border border-transparent"
                          }
                        `}
                      >
                        <span className={`flex-shrink-0 ${active ? "text-blue-400" : "text-white/40 group-hover:text-white/80"}`}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight size={16} className="text-blue-400 flex-shrink-0" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Drawer footer: Admin + Sign out */}
              <div className="px-4 py-5 border-t border-white/10 space-y-3 bg-white/5">
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin-panel")}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-amber-300 bg-amber-500/15 border border-amber-400/25 hover:bg-amber-500/25 transition-all"
                  >
                    <Shield size={16} /> Admin Panel
                  </button>
                )}
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/15 transition-all"
                  >
                    <LogOut size={16} /> Sign out
                    <span className="ml-auto text-white/40 text-xs truncate max-w-[120px] font-medium">{user.email}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30 transition-all"
                  >
                    <LogIn size={16} /> Sign in to Continue
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
