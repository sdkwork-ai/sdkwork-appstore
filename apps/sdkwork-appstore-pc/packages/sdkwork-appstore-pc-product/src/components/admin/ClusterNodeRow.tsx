import React from 'react';
import { RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ClusterNode } from '../../services/api';

interface ClusterNodeRowProps {
  node: ClusterNode;
  onRestart?: (nodeId: string) => void;
}

export const ClusterNodeRow: React.FC<ClusterNodeRowProps> = ({ node, onRestart }) => {
  const { t } = useTranslation();

  const statusStr = node.status as string;
  const statusColor =
    statusStr === '运行良好' || statusStr === 'Healthy'
      ? 'bg-emerald-500/10 text-emerald-500'
      : statusStr === '高负载' || statusStr === 'High Load'
      ? 'bg-amber-500/10 text-amber-500'
      : 'bg-red-500/10 text-red-500';

  const formatStatus = (s: string) => {
    if (s === '运行良好' || s === 'Healthy') return t('admin.cluster.healthy', '运行良好');
    if (s === '高负载' || s === 'High Load') return t('admin.cluster.highLoad', '高负载');
    return s;
  };

  return (
    <tr>
      <td className="py-3 font-bold text-gray-900 dark:text-gray-100">{node.name}</td>
      <td className="text-gray-400 font-mono text-[11px]">{node.id}</td>
      <td className="font-mono text-gray-400">{node.region}</td>
      <td>
        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${statusColor}`}>
          {formatStatus(node.status)}
        </span>
      </td>
      <td className="text-gray-400 font-mono">{node.cpu} ({node.memory})</td>
      <td className="py-3 text-right">
        {onRestart && (
          <button
            onClick={() => onRestart(node.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-[#282c38] rounded text-gray-400 hover:text-cyan-500 transition-colors cursor-pointer"
            title={t('admin.cluster.restartNode', '重启集群节点')}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
};


