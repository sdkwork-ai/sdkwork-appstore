/**
 * Canonical error model for the App Store backend-admin surface.
 *
 * The generated backend SDK surfaces every failure as an SDK error carrying a
 * stable `ErrorCode`, an HTTP status, and the RFC 9457 problem detail
 * (`API_SPEC.md`, `I18N_SPEC.md` §9). Operator consoles must branch on those
 * stable machine fields — never on localized copy — so this module projects
 * transport errors into one normalized shape that capability packages and
 * pages can switch on.
 */

export type AppstoreAdminErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'rateLimited'
  | 'server'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'runtimeUnconfigured'
  | 'unknown';

export interface AppstoreAdminFieldError {
  field: string;
  /** Stable numeric or symbolic validation code; never localized. */
  code?: string;
  /** Localization key supplied by the backend when a safe message exists. */
  i18nKey?: string;
  constraint?: string;
}

export interface AppstoreAdminServiceErrorShape {
  kind: AppstoreAdminErrorKind;
  /** `ProblemDetail.code` — stable machine state, never localized. */
  problemCode?: string;
  httpStatus?: number;
  traceId?: string;
  /** `ProblemDetail.i18nKey` — preferred presentation key when present. */
  i18nKey?: string;
  /** Diagnostic only. UI presentation must use `kind`, `problemCode`, or `i18nKey`. */
  message: string;
  /** `operationId` from `docs/api/operation-catalog.md`, when known. */
  operationId?: string;
  fieldErrors: AppstoreAdminFieldError[];
  cause?: unknown;
}

/** Normalized backend-admin failure thrown by every service port method. */
export class AppstoreAdminServiceError extends Error implements AppstoreAdminServiceErrorShape {
  public readonly kind: AppstoreAdminErrorKind;
  public readonly problemCode: string | undefined;
  public readonly httpStatus: number | undefined;
  public readonly traceId: string | undefined;
  public readonly i18nKey: string | undefined;
  public readonly operationId: string | undefined;
  public readonly fieldErrors: AppstoreAdminFieldError[];
  public readonly cause: unknown;

  constructor(shape: AppstoreAdminServiceErrorShape) {
    super(shape.message);
    this.name = 'AppstoreAdminServiceError';
    this.kind = shape.kind;
    this.problemCode = shape.problemCode;
    this.httpStatus = shape.httpStatus;
    this.traceId = shape.traceId;
    this.i18nKey = shape.i18nKey;
    this.operationId = shape.operationId;
    this.fieldErrors = shape.fieldErrors;
    this.cause = shape.cause;
  }

  /** `true` when the operator's credential is missing, expired, or rejected. */
  get isUnauthorized(): boolean {
    return this.kind === 'unauthorized';
  }

  /** `true` when the credential is valid but the permission set is insufficient. */
  get isForbidden(): boolean {
    return this.kind === 'forbidden';
  }

  /**
   * `true` when a retry may succeed without operator intervention. Mutation
   * commands must still reuse the original `Idempotency-Key`.
   */
  get isRetryable(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server'
      || this.kind === 'rateLimited';
  }
}

/** Thrown when a capability calls the admin runtime before bootstrap wiring. */
export class AppstoreAdminRuntimeUnconfiguredError extends Error {
  constructor(detail = 'The App Store backend-admin runtime is not configured.') {
    super(detail);
    this.name = 'AppstoreAdminRuntimeUnconfiguredError';
  }
}

const ERROR_KIND_BY_CODE: Record<string, AppstoreAdminErrorKind> = {
  UNAUTHORIZED: 'unauthorized',
  TOKEN_EXPIRED: 'unauthorized',
  TOKEN_INVALID: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'notFound',
  VALIDATION_ERROR: 'validation',
  CONFLICT: 'conflict',
  RATE_LIMIT: 'rateLimited',
  SERVER_ERROR: 'server',
  BAD_GATEWAY: 'server',
  SERVICE_UNAVAILABLE: 'server',
  GATEWAY_TIMEOUT: 'server',
  NETWORK_ERROR: 'network',
  TIMEOUT: 'timeout',
  CANCELLED: 'cancelled',
  BUSINESS_ERROR: 'unknown',
  UNKNOWN: 'unknown',
};

function kindFromHttpStatus(httpStatus: number | undefined): AppstoreAdminErrorKind | undefined {
  if (httpStatus === undefined) {
    return undefined;
  }
  if (httpStatus === 401) {
    return 'unauthorized';
  }
  if (httpStatus === 403) {
    return 'forbidden';
  }
  if (httpStatus === 404) {
    return 'notFound';
  }
  if (httpStatus === 409) {
    return 'conflict';
  }
  if (httpStatus === 400 || httpStatus === 422) {
    return 'validation';
  }
  if (httpStatus === 429) {
    return 'rateLimited';
  }
  if (httpStatus >= 500) {
    return 'server';
  }
  return undefined;
}

function readErrorCode(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
}

interface SdkErrorLike {
  code?: unknown;
  httpStatus?: unknown;
  message?: unknown;
  traceId?: unknown;
  problem?: unknown;
  details?: unknown;
}

function isSdkErrorLike(value: unknown): value is SdkErrorLike {
  return Boolean(value) && typeof value === 'object' && 'code' in (value as Record<string, unknown>);
}

function readFieldErrors(details: unknown): AppstoreAdminFieldError[] {
  if (!Array.isArray(details)) {
    return [];
  }
  const fieldErrors: AppstoreAdminFieldError[] = [];
  for (const entry of details) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const field = typeof record.field === 'string' ? record.field.trim() : '';
    if (!field) {
      continue;
    }
    const code = readErrorCode(record.code);
    const i18nKey = typeof record.i18nKey === 'string' ? record.i18nKey : undefined;
    const constraint = typeof record.constraint === 'string' ? record.constraint : undefined;
    fieldErrors.push({
      field,
      ...(code === undefined ? {} : { code }),
      ...(i18nKey === undefined ? {} : { i18nKey }),
      ...(constraint === undefined ? {} : { constraint }),
    });
  }
  return fieldErrors;
}

/**
 * Project any thrown value into {@link AppstoreAdminServiceError}.
 * @param error - value thrown by a generated backend SDK operation.
 * @param operationId - catalog operation id for diagnostics, when known.
 */
export function toAppstoreAdminServiceError(
  error: unknown,
  operationId?: string,
): AppstoreAdminServiceError {
  if (error instanceof AppstoreAdminServiceError) {
    return operationId === undefined || error.operationId !== undefined
      ? error
      : new AppstoreAdminServiceError({
          kind: error.kind,
          ...(error.problemCode === undefined ? {} : { problemCode: error.problemCode }),
          ...(error.httpStatus === undefined ? {} : { httpStatus: error.httpStatus }),
          ...(error.traceId === undefined ? {} : { traceId: error.traceId }),
          ...(error.i18nKey === undefined ? {} : { i18nKey: error.i18nKey }),
          message: error.message,
          operationId,
          fieldErrors: error.fieldErrors,
          cause: error.cause,
        });
  }

  if (error instanceof AppstoreAdminRuntimeUnconfiguredError) {
    return new AppstoreAdminServiceError({
      kind: 'runtimeUnconfigured',
      message: error.message,
      ...(operationId === undefined ? {} : { operationId }),
      fieldErrors: [],
      cause: error,
    });
  }

  const sdkError = isSdkErrorLike(error) ? error : undefined;
  const problem = sdkError && sdkError.problem && typeof sdkError.problem === 'object'
    ? (sdkError.problem as Record<string, unknown>)
    : undefined;

  const sdkCode = readErrorCode(sdkError?.code);
  const problemCode = readErrorCode(problem?.code) ?? sdkCode;
  const httpStatus = typeof sdkError?.httpStatus === 'number'
    ? sdkError.httpStatus
    : (typeof problem?.status === 'number' ? problem.status : undefined);

  const i18nKey = typeof problem?.i18nKey === 'string' && problem.i18nKey.trim()
    ? problem.i18nKey.trim()
    : undefined;
  const traceId = (typeof sdkError?.traceId === 'string' && sdkError.traceId)
    || (typeof problem?.traceId === 'string' && problem.traceId)
    || undefined;

  let kind: AppstoreAdminErrorKind = 'unknown';
  // Prefer the HTTP status: 400/401/403 are authoritative for the failure class,
  // while `ErrorCode` collapses several transports into `BUSINESS_ERROR`.
  const kindByStatus = kindFromHttpStatus(httpStatus);
  const kindByCode = sdkCode === undefined ? undefined : ERROR_KIND_BY_CODE[sdkCode];
  kind = kindByStatus ?? kindByCode ?? 'unknown';

  const message = typeof sdkError?.message === 'string' && sdkError.message
    ? sdkError.message
    : error instanceof Error && error.message
      ? error.message
      : 'App Store backend-admin request failed.';

  // The generated transport refuses to dispatch without an Access-Token and
  // raises a bare `Error` instead of an SDK error. Treat that guard as an
  // authorization failure so operators see the sign-in/permission state rather
  // than a generic transport fault.
  if (kind === 'unknown' && message.includes('requires Access-Token')) {
    kind = 'unauthorized';
  }

  return new AppstoreAdminServiceError({
    kind,
    ...(problemCode === undefined ? {} : { problemCode }),
    ...(httpStatus === undefined ? {} : { httpStatus }),
    ...(traceId === undefined ? {} : { traceId }),
    ...(i18nKey === undefined ? {} : { i18nKey }),
    message,
    ...(operationId === undefined ? {} : { operationId }),
    fieldErrors: readFieldErrors(sdkError?.details),
    cause: error,
  });
}

/**
 * Run one backend-admin operation and normalize any failure.
 * @param operationId - catalog operation id recorded on the resulting error.
 * @param operation - deferred generated SDK call.
 */
export async function executeAdminOperation<TResult>(
  operationId: string,
  operation: () => Promise<TResult>,
): Promise<TResult> {
  try {
    return await operation();
  } catch (error) {
    throw toAppstoreAdminServiceError(error, operationId);
  }
}

/**
 * Guard a required path parameter before dispatch. Empty identifiers would
 * otherwise produce a request against a malformed backend path.
 */
export function requireAdminIdentifier(value: string | undefined, label: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new AppstoreAdminServiceError({
      kind: 'validation',
      message: `${label} is required.`,
      fieldErrors: [{ field: label }],
    });
  }
  return trimmed;
}
