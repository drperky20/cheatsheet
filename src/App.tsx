import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = lazy(() => import('./pages/Index'));

function App() {
  return (
    <AnimatePresence exitBeforeEnter>
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="skeleton w-24 h-24" />
          </div>
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          className="min-h-screen bg-[#121212] text-white p-4 rounded-xl border border-white/10 shadow-glass"
        >
          <Home />
        </motion.div>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
