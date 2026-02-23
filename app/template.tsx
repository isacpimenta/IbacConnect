"use client";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} // Começa um pouco para a direita e invisível
      animate={{ x: 0, opacity: 1 }}  // Desliza para o centro e aparece
      transition={{ ease: "easeInOut", duration: 0.4 }} // Velocidade da transição
    >
      {children}
    </motion.div>
  );
}