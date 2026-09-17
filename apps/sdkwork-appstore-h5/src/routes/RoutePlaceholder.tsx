import { useLocation } from 'react-router-dom';

export interface RoutePlaceholderProps {
  readonly routeId: string;
  readonly titleKey: string;
}

/**
 * Route placeholder for a canonical route id whose capability screen is not
 * implemented yet.
 *
 * Route assembly is a root responsibility
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1); the id and title key
 * come from the shared route table so this page can never drift from the
 * cross-client contract.
 */
export function RoutePlaceholder({ routeId, titleKey }: RoutePlaceholderProps) {
  const location = useLocation();
  return (
    <section className="px-4 py-10" data-route-id={routeId} data-title-key={titleKey}>
      <h1 className="text-lg font-semibold text-[var(--text)]">{titleKey}</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {location.pathname}
      </p>
    </section>
  );
}
