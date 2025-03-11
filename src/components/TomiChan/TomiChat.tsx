import React from "react";
import { motion } from "framer-motion";

export default function TomiChat() {
  return (
    <motion.h1
      className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      Mình có thể giúp gì cho bạn?
    </motion.h1>
  );
}
