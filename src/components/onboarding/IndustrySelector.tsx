import React from 'react';
import { useConsultation } from '../../contexts/ConsultationContext';
import { INDUSTRY_TEMPLATES } from '../../lib/industryTemplates';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants, popHover } from '../../lib/animations';

export const IndustrySelector = () => {
  const { setActiveIndustry, setMode } = useConsultation();

  const handleSelect = (template: typeof INDUSTRY_TEMPLATES[0]) => {
    setActiveIndustry(template);
    setMode('consultation');
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-center mb-8 text-slate-800 dark:text-white"
      >
        Select Your Industry
      </motion.h2>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6"
      >
        {INDUSTRY_TEMPLATES.map((template) => {
          const IconComponent = (Icons as any)[template.icon] as LucideIcon;
          
          return (
            <motion.button
              key={template.id}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleSelect(template)}
              className={clsx(
                "group flex flex-col items-center justify-center p-6 rounded-xl border transition-colors duration-300",
                "bg-white dark:bg-slate-800",
                "border-slate-200 dark:border-slate-700"
              )}
            >
              <motion.div 
                variants={popHover}
                className={clsx(
                  "p-4 rounded-full mb-4 transition-colors",
                  `bg-${template.theme_color}/10 text-${template.theme_color}`
                )}
                style={{
                    backgroundColor: `var(--theme-${template.id}-bg, rgba(0,0,0,0.05))`,
                    color: `var(--theme-${template.id}-color, currentColor)`
                }}
              >
                {IconComponent ? <IconComponent className="w-8 h-8" /> : <Icons.Box className="w-8 h-8" />}
              </motion.div>
              <span className="font-semibold text-sm text-center text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                {template.name}
              </span>
            </motion.button>
          );
        })}
        
        {/* "Other" Button */}
        <motion.button
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
          className="group flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          onClick={() => console.log("Trigger Custom Flow")}
        >
          <motion.div 
            variants={popHover}
            className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 mb-4 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors"
          >
            <Icons.Plus className="w-8 h-8" />
          </motion.div>
          <span className="font-semibold text-sm text-center text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">
            Other / Custom
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
};
