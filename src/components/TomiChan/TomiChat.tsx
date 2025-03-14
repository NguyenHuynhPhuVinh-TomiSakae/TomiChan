import React from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";

interface TomiChatProps {
  isMagicMode?: boolean;
}

export default function TomiChat({ isMagicMode = false }: TomiChatProps) {
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  return (
    <motion.h1
      className={`text-3xl font-bold mb-2 text-center mx-2 ${
        isMagicMode && isTablet
          ? "text-2xl"
          : isMagicMode
          ? ""
          : "sm:text-4xl sm:mb-4"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      Mình có thể giúp gì cho bạn?
    </motion.h1>
  );
}
