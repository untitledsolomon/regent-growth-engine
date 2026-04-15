import React from 'react';
import { LeadCaptureForm } from './LeadCaptureForm';

interface CTAButtonProps {
  client: any;
  source: string;
  postId?: string;
  text: string;
  variant?: 'primary' | 'outline';
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  client,
  source,
  postId,
  text,
  variant = 'primary'
}) => {
  const [open, setOpen] = React.useState(false);

  const baseStyles = "px-6 py-3 rounded-full font-bold transition-all inline-flex items-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${baseStyles} ${variants[variant]}`}
      >
        {text}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-in zoom-in duration-200">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-200"
            >
              Close
            </button>
            <LeadCaptureForm
              client={client}
              source={source}
              postId={postId}
              onSuccess={() => setTimeout(() => setOpen(false), 3000)}
            />
          </div>
        </div>
      )}
    </>
  );
};
