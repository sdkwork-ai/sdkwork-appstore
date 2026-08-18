import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';
import { UpdateItemNotes } from './UpdateItemNotes';

interface UpdateItemProps {
  app: AppItem;
  isUpdating: boolean;
  isExpanded: boolean;
  onUpdate: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export function UpdateItem({
  app,
  isUpdating,
  isExpanded,
  onUpdate,
  onToggleExpand,
}: UpdateItemProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col pb-6 border-b border-gray-100 dark:border-[#2C2C2E] last:border-0">
      <div className="flex items-start gap-4">
        <Link to={`/app/${app.id}`} className="flex-shrink-0">
          <div className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center shadow-md ${app.iconColor}`}>
            <DynamicIcon name={app.icon} className="text-white w-9 h-9" />
          </div>
        </Link>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <Link to={`/app/${app.id}`} className="hover:underline decoration-[#1C1C1E] dark:decoration-white">
                <h3 className="font-bold text-[17px] text-[#1C1C1E] dark:text-[#F5F5F5] truncate">{app.name}</h3>
              </Link>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{app.developer}</p>
            </div>
            <button 
              onClick={() => onUpdate(app.id)}
              disabled={isUpdating}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all disabled:opacity-50 min-w-[76px] flex items-center justify-center shadow-sm cursor-pointer"
            >
              {isUpdating ? (
                <div className="w-4 h-4 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : t('updates.item.update')}
            </button>
          </div>
          
          {/* Subcomponent: Update Item Release Notes */}
          <UpdateItemNotes
            appId={app.id}
            version={app.whatsNew?.version}
            date={app.whatsNew?.date}
            notes={app.whatsNew?.notes}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
          />
        </div>
      </div>
    </div>
  );
}


