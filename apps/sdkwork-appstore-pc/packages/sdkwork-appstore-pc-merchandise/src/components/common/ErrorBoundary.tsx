import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function DefaultErrorFallback({ error, onReset }: { error?: Error; onReset: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-store-surface rounded-store-card border border-store-line m-4 shadow-sm ">
      <div className="w-14 h-14 bg-store-danger-soft text-store-danger rounded-store-card flex items-center justify-center mb-4 ">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-store-ink mb-2 ">
        {t('common.error.renderTitle', '页面渲染遇到异常')}
      </h3>
      <p className="text-xs text-store-ink-faint max-w-md mb-6 leading-relaxed ">
        {error?.message || t('common.error.renderDesc', '组件加载出现未捕获异常，系统已自动隔离防护。您可以重试或刷新此视图。')}
      </p>
      <button
        id="error-boundary-retry-btn"
        onClick={onReset}
        className="px-5 py-2.5 bg-store-brand hover:bg-store-brand text-white rounded-store-control text-xs font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>{t('common.error.reloadModule', '重新加载模块')}</span>
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
