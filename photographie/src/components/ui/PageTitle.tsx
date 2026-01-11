import { motion } from "framer-motion";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  showSeparator?: boolean;
  className?: string;
}

export default function PageTitle({
  title,
  subtitle,
  showSeparator = false,
  className = "",
}: PageTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center mb-12 text-center ${className}`}
    >
      <h1 className="hero-title !mb-0 !ml-0 !mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight break-words">
        <span className="hero-title-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f]">
          {title}
        </span>
      </h1>

      {showSeparator && (
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#ffe992] to-transparent mx-auto mt-6 mb-6 opacity-50" />
      )}

      {subtitle && (
        <p
          className={`text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed ${
            !showSeparator ? "mt-4" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
