import React from 'react';

interface HeaderUserBadgeProps {
  initials?: string;
  userName?: string;
  onClick?: () => void;
}

export const HeaderUserBadge: React.FC<HeaderUserBadgeProps> = ({
  initials = "CL",
  userName = "Developer Account",
  onClick
}) => {
  return (
    <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-[#22252c]">
      <button
        type="button"
        onClick={onClick}
        title={userName}
        className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700 shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all select-none"
      >
        {initials}
      </button>
    </div>
  );
};
