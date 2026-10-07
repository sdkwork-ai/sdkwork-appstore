import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, ShieldAlert } from 'lucide-react';
import {
  consoleSettingsService,
  type ConsolePublisherProfile,
} from '../services/consoleSettingsService';
import { LoadingSpinner } from '@sdkwork/appstore-h5-commons';

/**
 * 控制台设置页（/console/settings，console.system.settings.index）。
 * 发布者资料查看与编辑（publishers.me.retrieve / publishers.update）；
 * API 凭证与安全策略由 app-api 之外的平台面提供，这里如实说明。
 */
export function ConsoleSettingsPage() {
  const [profile, setProfile] = useState<ConsolePublisherProfile | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', supportEmail: '', websiteUrl: '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    consoleSettingsService()
      .getPublisherProfile()
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          if (data) {
            setForm({
              displayName: data.displayName,
              supportEmail: data.supportEmail ?? '',
              websiteUrl: data.websiteUrl ?? '',
            });
          }
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : '加载失败，请稍后重试。');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!profile || !form.displayName.trim() || saving) {
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const updated = await consoleSettingsService().updateProfile(profile.id, {
        displayName: form.displayName.trim(),
        supportEmail: form.supportEmail.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
      });
      setProfile(updated);
      setEditing(false);
      setNotice('资料已保存。');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : '保存失败，请稍后重试。');
    } finally {
      setSaving(false);
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
    <div className="animate-fade-in pb-6">
      <header className="page-header">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/settings" className="flex h-10 w-10 items-center justify-center" aria-label="返回设置">
            <ArrowLeft className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">开发者设置</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {loadError && (
          <div className="card p-6 text-center" role="alert">
            <p className="text-sm text-[var(--text-secondary)]">{loadError}</p>
          </div>
        )}

        {notice && <p className="text-xs text-[var(--text-tertiary)]">{notice}</p>}

        {profile && (
          <section className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--text-primary)]">发布者资料</h2>
              {profile.verificationStatus === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  已实名认证
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  认证审核中
                </span>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <input
                  value={form.displayName}
                  onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="发布者名称"
                  aria-label="发布者名称"
                  className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
                />
                <input
                  value={form.supportEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, supportEmail: e.target.value }))}
                  placeholder="联系邮箱（选填）"
                  type="email"
                  aria-label="联系邮箱"
                  className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
                />
                <input
                  value={form.websiteUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="官网地址（选填）"
                  type="url"
                  aria-label="官网地址"
                  className="w-full px-3 py-2 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-surface)]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving || !form.displayName.trim()}
                    className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium disabled:opacity-60"
                  >
                    {saving ? '保存中…' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 py-2.5 border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-sm font-medium"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-[var(--text-primary)]">{profile.displayName}</p>
                {profile.supportEmail && (
                  <p className="text-xs text-[var(--text-tertiary)]">{profile.supportEmail}</p>
                )}
                {profile.websiteUrl && (
                  <p className="text-xs text-[var(--text-tertiary)]">{profile.websiteUrl}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      displayName: profile.displayName,
                      supportEmail: profile.supportEmail ?? '',
                      websiteUrl: profile.websiteUrl ?? '',
                    });
                    setEditing(true);
                  }}
                  className="w-full py-2.5 border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-sm font-medium"
                >
                  编辑资料
                </button>
              </div>
            )}
          </section>
        )}

        <section className="card p-4 space-y-2">
          <h2 className="font-semibold text-[var(--text-primary)]">API 凭证</h2>
          <p className="text-xs leading-relaxed text-[var(--text-tertiary)]">
            应用 API 暂不提供 store API 凭证管理；凭证由平台侧统一签发与轮换。
          </p>
        </section>

        <section className="card p-4 space-y-2">
          <h2 className="font-semibold text-[var(--text-primary)]">安全策略</h2>
          <p className="text-xs leading-relaxed text-[var(--text-tertiary)]">
            租户安全策略（MFA、访问白名单、限流）由平台安全面统一管理，暂不在此页开放配置。
          </p>
        </section>
      </div>
    </div>
  );
}
