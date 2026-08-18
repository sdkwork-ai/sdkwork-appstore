import React from 'react';
import { Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ClusterNodeRow } from './ClusterNodeRow';
import { ClusterNode } from '../../services/api';

interface ClusterNodesTableProps {
  nodes: ClusterNode[];
  onRestartNode?: (nodeId: string) => void;
}

export const ClusterNodesTable: React.FC<ClusterNodesTableProps> = ({ nodes, onRestartNode }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-100/50 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl p-5">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <Server className="w-4 h-4 text-blue-500" />
        {t('admin.cluster.title', '集群服务节点状态')}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#282c38] text-gray-400 pb-2">
              <th className="py-2.5 font-semibold">{t('admin.cluster.thService', '服务组件')}</th>
              <th className="py-2.5 font-semibold">{t('admin.cluster.thNodeId', '集群节点 ID')}</th>
              <th className="py-2.5 font-semibold">{t('admin.cluster.thPort', '端口')}</th>
              <th className="py-2.5 font-semibold">{t('admin.cluster.thStatus', '状态')}</th>
              <th className="py-2.5 font-semibold">{t('admin.cluster.thLatency', '延迟')}</th>
              <th className="py-2.5 font-semibold text-right">{t('admin.cluster.thActions', '运维操作')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 dark:divide-[#252834]">
            {nodes.map((node) => (
              <ClusterNodeRow key={node.id} node={node} onRestart={onRestartNode} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


