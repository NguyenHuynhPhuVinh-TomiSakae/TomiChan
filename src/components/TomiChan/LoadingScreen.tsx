import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({
  onLoadingComplete,
}: LoadingScreenProps) {
  const text = "TomiChan";
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        setTimeout(() => {
          setShouldExit(true);
          setTimeout(onLoadingComplete, 500);
        }, 1000);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {!shouldExit && (
        <motion.div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white dark:bg-black flex-col gap-4"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="text-4xl md:text-6xl font-bold text-black dark:text-white relative">
            {displayText}
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: isComplete ? 0 : 1 }}
              transition={{
                duration: 0.5,
                repeat: isComplete ? 0 : Infinity,
                repeatType: "reverse",
              }}
              className="inline-block ml-1"
            >
              |
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
