import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  formatApiError,
  getPublisherUploads,
  publisherService,
  resolveOrganizationId,
  useListing,
  useListingMedia,
  useListingReleases,
  usePublisher,
} from '@sdkwork/appstore-publisher-console-core';
import { DriveUploadImage, DriveUploadImageList } from '@sdkwork/drive-mobile-react-upload-image';
import type {
  DriveUploadImageCopy,
  DriveUploadImageValue,
} from '@sdkwork/drive-upload-image-core';
import { LoadingSpinner, readString } from '@sdkwork/appstore-h5-commons';

const MEDIA_ROLES = [
  { value: 'ICON', label: '图标' },
  { value: 'SCREENSHOT', label: '截图' },
  { value: 'FEATURE_GRAPHIC', label: '特色图' },
] as const;

/** Chinese copy for the shared upload-image shells, matching this page's language. */
const UPLOAD_IMAGE_COPY: Partial<DriveUploadImageCopy> = {
  pickImage: '上传图片',
  replaceImage: '更换图片',
  removeImage: '移除图片',
  retryUpload: '重试上传',
  uploading: '上传中…',
  uploadFailed: '上传失败',
  invalidFileType: '仅支持图片文件。',
  fileTooLarge: '图片过大。',
  emptyFile: '文件为空。',
  tooManyFiles: '选择的图片过多。',
  fileTooLargeDetail: '图片必须小于 {max}。',
  previewUnavailable: '预览不可用',
  chooseFromAlbum: '从相册选择',
  takePhoto: '拍照',
  cancel: '取消',
};

export function PublisherListingManagePage() {
  const { listingId = '' } = useParams();
  const {
    data: listing,
    loading: listingLoading,
    error: listingError,
    execute: refreshListing,
  } = useListing(listingId);
  const {
    data: mediaData,
    loading: mediaLoading,
    error: mediaError,
    execute: refreshMedia,
  } = useListingMedia(listingId);
  const {
    data: releasesData,
    loading: releasesLoading,
    error: releasesError,
    execute: refreshReleases,
  } = useListingReleases(listingId);
  const { data: publisher } = usePublisher();

  const organizationId = useMemo(() => resolveOrganizationId(publisher), [publisher]);
  const listingRow = (listing ?? {}) as unknown as unknown as Record<string, unknown>;
  const title =
    readString(listingRow, 'displayName', 'display_name') ||
    readString(listingRow, 'listingSlug', 'listing_slug') ||
    listingId;

  const [locale, setLocale] = useState('zh-CN');
  const [displayName, setDisplayName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [localizationSeeded, setLocalizationSeeded] = useState(false);
  const [savingLocalization, setSavingLocalization] = useState(false);
  const [localizationMessage, setLocalizationMessage] = useState<string | null>(null);

  const [mediaRole, setMediaRole] = useState<(typeof MEDIA_ROLES)[number]['value']>('ICON');
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);
  const listingImageService = useMemo(() => getPublisherUploads().createListingImageService(), []);
  const attachedMediaNodeIds = useRef<Set<string>>(new Set());

  const [channelCode, setChannelCode] = useState('production');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState('100');
  const [creatingRelease, setCreatingRelease] = useState(false);
  const [selectedReleaseId, setSelectedReleaseId] = useState('');
  const [platform, setPlatform] = useState('ANDROID');
  const [architecture, setArchitecture] = useState('ARM64');
  const [packageFormat, setPackageFormat] = useState('APK');
  const [artifactUploading, setArtifactUploading] = useState(false);
  const [artifactMessage, setArtifactMessage] = useState<string | null>(null);

  const [submissionType, setSubmissionType] = useState<'INITIAL' | 'METADATA' | 'RELEASE'>('INITIAL');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const mediaItems = mediaData?.items ?? [];
  const releaseItems = releasesData?.items ?? [];
  const loading = listingLoading || mediaLoading || releasesLoading;
  const error = listingError ?? mediaError ?? releasesError;
  const mediaRoleLabel = MEDIA_ROLES.find((role) => role.value === mediaRole)?.label ?? mediaRole;

  useEffect(() => {
    if (!listing || localizationSeeded) {
      return;
    }
    const row = listing as unknown as Record<string, unknown>;
    const defaultLocale = readString(row, 'defaultLocale', 'default_locale');
    if (defaultLocale) {
      setLocale(defaultLocale);
    }
    const name = readString(row, 'displayName', 'display_name');
    if (name) {
      setDisplayName(name);
    }
    setLocalizationSeeded(true);
  }, [listing, localizationSeeded]);

  async function handleSaveLocalization() {
    if (!displayName.trim() || !shortDescription.trim() || !fullDescription.trim()) {
      setLocalizationMessage('请填写显示名称、简短描述和完整描述。');
      return;
    }
    setSavingLocalization(true);
    setLocalizationMessage(null);
    try {
      await publisherService.upsertLocalization(listingId, locale.trim(), {
        displayName: displayName.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
      });
      setLocalizationMessage('商店文案已保存。');
      await refreshListing();
    } catch (err) {
      setLocalizationMessage(formatApiError(err as Error));
    } finally {
      setSavingLocalization(false);
    }
  }

  /** Attach one uploaded Drive image to the listing as listing media, then refresh the media list. */
  async function attachUploadedImage(value: DriveUploadImageValue) {
    const nodeId = value.metadata?.drive?.nodeId;
    if (nodeId === undefined || nodeId === '' || attachedMediaNodeIds.current.has(nodeId)) {
      return;
    }
    try {
      await getPublisherUploads().attachListingMedia({
        listingId,
        mediaRole,
        mediaResourceId: nodeId,
        platformScope: 'ALL',
      });
      attachedMediaNodeIds.current.add(nodeId);
      setMediaMessage('媒体已上传并关联。');
      await refreshMedia();
    } catch (err) {
      setMediaMessage(formatApiError(err as Error));
    }
  }

  /** Attach every newly uploaded image exactly once (list onChange carries the full value list). */
  async function handleUploadedValues(values: readonly DriveUploadImageValue[]) {
    for (const value of values) {
      await attachUploadedImage(value);
    }
  }

  async function handleCreateRelease() {
    setCreatingRelease(true);
    try {
      const created = (await publisherService.createRelease(listingId, {
        channelCode: channelCode.trim(),
        versionName: versionName.trim(),
        versionCode: versionCode.trim(),
      })) as unknown as Record<string, unknown>;
      const releaseId = readString(created, 'id');
      if (releaseId) {
        setSelectedReleaseId(releaseId);
      }
      await refreshReleases();
    } catch (err) {
      setArtifactMessage(formatApiError(err as Error));
    } finally {
      setCreatingRelease(false);
    }
  }

  async function handleArtifactUpload(file: File) {
    if (!selectedReleaseId || !organizationId) {
      setArtifactMessage('请先选择版本并确保已登录组织上下文。');
      return;
    }
    setArtifactUploading(true);
    setArtifactMessage(null);
    try {
      await getPublisherUploads().uploadReleaseArtifact({
        file,
        organizationId,
        releaseId: selectedReleaseId,
        platform,
        architecture,
        packageFormat,
      });
      setArtifactMessage('安装包已上传。');
      await refreshReleases();
    } catch (err) {
      setArtifactMessage(formatApiError(err as Error));
    } finally {
      setArtifactUploading(false);
    }
  }

  async function handleSubmitForReview() {
    if (submissionType === 'RELEASE' && !selectedReleaseId) {
      setSubmissionMessage('提交版本审核前请先选择版本。');
      return;
    }
    setSubmittingReview(true);
    setSubmissionMessage(null);
    try {
      const result = await publisherService.createSubmission(listingId, {
        submissionType,
        ...(submissionType === 'RELEASE' ? { releaseId: selectedReleaseId } : {}),
      });
      setSubmissionMessage(`已提交审核（${result.submissionStatus ?? 'accepted'}）。`);
      await refreshListing();
    } catch (err) {
      setSubmissionMessage(formatApiError(err as Error));
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <header className="page-header">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/publisher" className="flex h-10 w-10 items-center justify-center" aria-label="返回">
            <ArrowLeft className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <h1 className="text-lg font-bold truncate text-[var(--text-primary)]">{title}</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {formatApiError(error)}
          </div>
        )}

        <section className="card p-4 space-y-3">
          <h2 className="font-semibold text-[var(--text-primary)]">商店文案</h2>
          <input
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="语言（zh-CN）"
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          />
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="显示名称"
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          />
          <textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="简短描述"
            rows={2}
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          />
          <textarea
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="完整描述"
            rows={4}
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          />
          <button
            type="button"
            onClick={() => void handleSaveLocalization()}
            disabled={savingLocalization}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium disabled:opacity-60"
          >
            {savingLocalization ? '保存中…' : '保存文案'}
          </button>
          {localizationMessage && <p className="text-xs text-[var(--text-tertiary)]">{localizationMessage}</p>}
        </section>

        <section className="card p-4 space-y-3">
          <h2 className="font-semibold text-[var(--text-primary)]">媒体资源</h2>
          <select
            value={mediaRole}
            onChange={(e) => setMediaRole(e.target.value as (typeof MEDIA_ROLES)[number]['value'])}
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          >
            {MEDIA_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {mediaRole === 'SCREENSHOT' ? (
            <DriveUploadImageList
              key={mediaRole}
              service={listingImageService}
              appResourceId={listingId}
              sources={['album', 'camera']}
              maxFiles={8}
              label={mediaRoleLabel}
              copy={UPLOAD_IMAGE_COPY}
              onUploadError={() => setMediaMessage('上传失败，请重试。')}
              onChange={(values) => {
                void handleUploadedValues(values);
              }}
            />
          ) : (
            <DriveUploadImage
              key={mediaRole}
              service={listingImageService}
              appResourceId={listingId}
              sources={['album', 'camera']}
              shape="rounded"
              sizePx={80}
              label={mediaRoleLabel}
              copy={UPLOAD_IMAGE_COPY}
              onUploadError={() => setMediaMessage('上传失败，请重试。')}
              onChange={(value) => {
                if (value !== null) {
                  void attachUploadedImage(value);
                }
              }}
            />
          )}
          {mediaMessage && <p className="text-xs text-[var(--text-tertiary)]">{mediaMessage}</p>}
          <p className="text-xs text-[var(--text-tertiary)]">已关联 {mediaItems.length} 项媒体</p>
        </section>

        <section className="card p-4 space-y-3">
          <h2 className="font-semibold text-[var(--text-primary)]">版本与安装包</h2>
          <input
            value={channelCode}
            onChange={(e) => setChannelCode(e.target.value)}
            placeholder="渠道（stable）"
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          />
          <input
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder="版本名"
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          />
          <input
            value={versionCode}
            onChange={(e) => setVersionCode(e.target.value)}
            placeholder="版本号"
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          />
          <button
            type="button"
            onClick={() => void handleCreateRelease()}
            disabled={creatingRelease}
            className="w-full py-2.5 bg-purple-500 text-white rounded-xl text-sm font-medium disabled:opacity-60"
          >
            {creatingRelease ? '创建中…' : '创建版本'}
          </button>
          {releaseItems.length > 0 && (
            <select
              value={selectedReleaseId}
              onChange={(e) => setSelectedReleaseId(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
            >
              <option value="">选择版本</option>
              {releaseItems.map((item, index) => {
                const row = (item ?? {}) as unknown as Record<string, unknown>;
                const id = readString(row, 'id') || String(index);
                return (
                  <option key={id} value={id}>
                    {readString(row, 'versionName', 'version_name') || id}
                  </option>
                );
              })}
            </select>
          )}
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="平台"
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          />
          <label className="block w-full py-2.5 text-center bg-purple-500 text-white rounded-xl text-sm font-medium">
            {artifactUploading ? '上传中…' : '上传安装包'}
            <input
              type="file"
              className="hidden"
              disabled={artifactUploading || !selectedReleaseId}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleArtifactUpload(file);
                }
                e.target.value = '';
              }}
            />
          </label>
          {artifactMessage && <p className="text-xs text-[var(--text-tertiary)]">{artifactMessage}</p>}
        </section>

        <section className="card p-4 space-y-3">
          <h2 className="font-semibold text-[var(--text-primary)]">提交审核</h2>
          <select
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value as 'INITIAL' | 'METADATA' | 'RELEASE')}
            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
          >
            <option value="INITIAL">首次上架</option>
            <option value="METADATA">元数据更新</option>
            <option value="RELEASE">版本发布</option>
          </select>
          <button
            type="button"
            onClick={() => void handleSubmitForReview()}
            disabled={submittingReview}
            className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium disabled:opacity-60"
          >
            {submittingReview ? '提交中…' : '提交审核'}
          </button>
          {submissionMessage && <p className="text-xs text-[var(--text-tertiary)]">{submissionMessage}</p>}
        </section>
      </div>
    </div>
  );
}
