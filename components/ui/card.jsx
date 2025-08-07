import { motion } from 'framer-motion';

export const Card = ({ children, className }) => (
  <motion.div 
    className={`rounded-xl border bg-white/80 backdrop-blur-sm text-slate-900 shadow-lg transition-shadow hover:shadow-xl ${className}`}
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
// The rest of the Card components (Header, Content, etc.) remain the same
export const CardHeader = ({ children, className }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
export const CardTitle = ({ children, className }) => <h3 className={`text-xl font-semibold tracking-tight ${className}`}>{children}</h3>;
export const CardDescription = ({ children, className }) => <p className={`text-sm text-slate-500 ${className}`}>{children}</p>;
export const CardContent = ({ children, className }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
export const CardFooter = ({ children, className }) => <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;