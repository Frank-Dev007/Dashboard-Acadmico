import { GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <GraduationCap className="w-20 h-20 text-indigo-600" />
        </div>
        <h1 className="text-white text-center">Dashboard Académico PWA</h1>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        />
      </motion.div>
    </div>
  );
}
