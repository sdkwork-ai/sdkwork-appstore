import { useTranslation } from 'react-i18next';
import { DEMAND_APP_FORMS, type DemandAppForm } from '@sdkwork/appstore-pc-core';

interface DemandsAppFormPickerProps {
  /** Selected application forms, in selection order. */
  value: readonly DemandAppForm[];
  /** Disables every chip while the surrounding form submits. */
  disabled?: boolean;
  /** Receives the next complete selection. */
  onChange: (forms: DemandAppForm[]) => void;
}

/**
 * Application-form multi-select for the publish-demand form: one toggle chip
 * per SDKWork application architecture standard. A demand may commission more
 * than one delivery form (for example a PC admin app plus its H5 companion);
 * the codes are the wire values and each label names the delivery form.
 *
 * @param props - the selected forms, disabled state, and change callback.
 * @returns the toggle-button group of form chips.
 */
export function DemandsAppFormPicker({
  value,
  disabled = false,
  onChange,
}: DemandsAppFormPickerProps) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t('demands.publish.appFormLabel')}
      data-demands-app-form-picker
      className="flex flex-wrap gap-2"
    >
      {DEMAND_APP_FORMS.map((form) => {
        const checked = value.includes(form);
        return (
          <button
            key={form}
            type="button"
            aria-pressed={checked}
            disabled={disabled}
            onClick={() => {
              onChange(checked ? value.filter((item) => item !== form) : [...value, form]);
            }}
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
