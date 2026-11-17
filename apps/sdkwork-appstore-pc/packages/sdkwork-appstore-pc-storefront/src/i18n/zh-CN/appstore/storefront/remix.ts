export const remix = {
  action: 'Remix',
  title: '创建本地项目',
  subtitle: '将《{{name}}》的源码取到本地项目中。',
  close: '完成',
  form: {
    projectName: '项目名称',
    device: '设备',
    deviceThisComputer: '此电脑',
    sourceFolder: '源文件夹',
    chooseFolder: '选择文件夹',
    noFolder: '尚未选择文件夹',
    fallbackNotice:
      '当前浏览器无法直接写入文件夹（不支持 File System Access API），将改为下载源码压缩包（.zip）。',
    cancel: '取消',
    confirm: '创建项目',
    download: '下载压缩包'
  },
  running: {
    loading: '正在获取 Remix 信息…',
    downloading: '正在下载源码压缩包…',
    verifying: '正在校验压缩包…',
    writing: '正在写入项目文件…'
  },
  git: {
    description: '网页无法直接执行 git，请在终端中执行以下命令创建项目。',
    copy: '复制命令',
    copied: '已复制',
    subPath: '应用位于仓库内的 {{subPath}} 目录。',
    repository: '打开仓库',
    archiveNotice:
      '本商店不提供 Git 源码的仓库压缩包下载，请通过上方的仓库链接在代码托管平台下载压缩包。'
  },
  written: {
    description: '已将 {{count}} 个文件写入 {{folder}}。'
  },
  downloaded: {
    description: '{{fileName}} 已由浏览器保存，解压后即可完成项目创建。'
  },
  error: {
    'not-remixable': '该应用当前不提供 Remix 下载。',
    'deploy-unavailable': '暂时无法连接部署服务，无法确认 Remix 可用性，请稍后重试。',
    'download-failed': '源码压缩包下载失败。',
    'checksum-failed': '源码压缩包校验失败，已丢弃下载内容。',
    'unsupported-archive': '不支持该源码压缩包格式。',
    'unsafe-archive': '源码压缩包包含不安全的路径，已拒绝写入。',
    'write-failed': '无法将项目文件写入所选文件夹。',
    'payload-invalid': 'Remix 信息不完整。',
    unknown: 'Remix 过程中发生未知错误。',
    retry: '重试',
    close: '关闭'
  },
  validation: {
    'project-name-required': '请输入项目名称。',
    'folder-required': '请选择源文件夹。',
    'device-unsupported': '只有此电脑可以接收项目文件。'
  }
};
