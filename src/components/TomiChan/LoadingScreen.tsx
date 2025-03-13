import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
          <div className="relative">
            {/* Icon with optimized animations */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="mb-8 flex justify-center relative"
            >
              <motion.div
                animate={{
                  filter: [
                    "drop-shadow(0 0 30px rgba(255,215,0,0.3))",
                    "drop-shadow(0 0 40px rgba(147,112,219,0.3))",
                    "drop-shadow(0 0 30px rgba(255,215,0,0.3))",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Image
                  src="/tomichan-icon.png"
                  alt="TomiChan"
                  width={126}
                  height={126}
                  priority
                  className="relative z-10"
                />
              </motion.div>
            </motion.div>

            {/* Text with simplified animation */}
            <motion.div
              className="text-4xl md:text-6xl font-bold relative"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-transparent bg-clip-text font-bold tracking-wider dark:drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                {displayText}
              </span>
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: isComplete ? 0 : 1 }}
                transition={{
                  duration: 0.5,
                  repeat: isComplete ? 0 : Infinity,
                  repeatType: "reverse",
                }}
                className="inline-block ml-1 text-black dark:text-white"
              >
                |
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
