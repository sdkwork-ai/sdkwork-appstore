import { useTranslation } from 'react-i18next';

interface AppDescriptionProps {
  description: string;
}

export function AppDescription({ description }: AppDescriptionProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-10">
      <h3 className="text-2xl font-bold mb-3 text-[#1C1C1E] dark:text-[#F5F5F5]">{t('appDetail.description.title')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
        {description}
      </p>
    </div>
  );
}

