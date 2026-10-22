export const install = {
  modal: {
    title: '安装应用至 PC 客户端',
    subtitle: '配置安装目录与桌面快捷方式',
    targetPath: '目标安装目录',
    browse: '浏览选择...',
    createDesktopShortcut: '创建桌面快捷方式',
    createStartMenuShortcut: '添加到系统开始菜单',
    autoStart: '开机自动启动',
    confirmInstall: '开始安装',
    installing: '正在向本地磁盘写入并配置安装包...',
    completed: '应用安装成功！',
    launchNow: '立即运行应用',
    runningNotice: '应用【{{name}}】正在本地桌面沙盒环境运行中...',
    installFailed: '安装失败，请稍后重试',
    platformNote: '已识别当前系统，将安装 {{platform}}',
    platformNoteGeneric: '将安装 {{platform}}',
    compatibilityNote: '该安装包在当前设备上以兼容模式运行',
    qrTitle: '扫码获取',
    qrScanHint: '使用手机或对应客户端扫描二维码继续',
    artifactNote: '安装包 {{format}} · {{size}}',
    downloadStarted: '安装包下载已开始，请按安装程序引导完成安装'
  },
  download: {
    started: '已开始下载 {{platform}}',
    pending: '该安装包尚未发布',
    unavailable: '下载链接暂不可用，请稍后重试',
    failed: '下载失败，请稍后重试'
  }
};
