import { useTranslation } from 'react-i18next';
import { DEMAND_APP_FORMS, type DemandAppForm } from '@sdkwork/appstore-pc-core';

interface DemandsAppFormPickerProps {
  /** Selected application form, when the publisher already chose one. */
  value?: DemandAppForm;
  /** Disables every chip while the surrounding form submits. */
  disabled?: boolean;
  /** Receives the picked form. */
  onChange: (form: DemandAppForm) => void;
}

/**
 * Application-form chooser for the publish-demand form: one exclusive chip per
 * SDKWork application architecture standard. The codes are the wire values and
 * each label names the delivery form the provider commits to.
 *
 * @param props - the selected form, disabled state, and change callback.
 * @returns the radiogroup of form chips.
 */
export function DemandsAppFormPicker({
  value,
  disabled = false,
  onChange,
}: DemandsAppFormPickerProps) {
  const { t } = useTranslation();
  return (
    <div
      role="radiogroup"
      aria-label={t('demands.publish.appFormLabel')}
      data-demands-app-form-picker
      className="flex flex-wrap gap-2"
    >
      {DEMAND_APP_FORMS.map((form) => {
        const checked = value === form;
        return (
          <button
            key={form}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(form)}
            className={`px-3 py-1.5 rounded-store-control text-xs font-medium border transition-all ${
              checked
                ? 'bg-store-brand text-white border-store-brand shadow-sm'
                : 'bg-store-field text-store-ink-soft border-store-line hover:text-store-ink hover:border-store-brand/40'
            } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            {t(`demands.appForms.${form}`)}
          </button>
        );
      })}
    </div>
  );
}

export default DemandsAppFormPicker;
