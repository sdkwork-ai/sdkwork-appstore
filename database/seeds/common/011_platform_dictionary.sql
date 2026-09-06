-- 011_platform_dictionary.sql
-- Seeds appstore_platform_dictionary with the industry-aligned platform matrix:
-- mobile (iOS/iPadOS/Android/HarmonyOS), desktop (Windows/macOS/Linux),
-- web (PWA/browser app), browser extensions, and multi-platform mini programs.

INSERT INTO appstore_platform_dictionary
  (id, tenant_id, platform_code, platform_family, os_vendor, package_formats, identity_field, requires_store_review, platform_status, sort_order)
VALUES
  -- Mobile
  ('plat_ios', '0', 'ios', 'mobile', 'apple', '["ipa"]', 'bundle_id', 1, 'active', 10),
  ('plat_ipados', '0', 'ipados', 'mobile', 'apple', '["ipa"]', 'bundle_id', 1, 'active', 20),
  ('plat_android', '0', 'android', 'mobile', 'google', '["apk", "aab"]', 'package_name', 1, 'active', 30),
  ('plat_harmonyos', '0', 'harmonyos', 'mobile', 'huawei', '["hap", "app"]', 'bundle_name', 1, 'active', 40),
  -- Desktop
  ('plat_windows', '0', 'windows', 'desktop', 'microsoft', '["msix", "exe", "zip"]', 'msix_identity', 1, 'active', 50),
  ('plat_macos', '0', 'macos', 'desktop', 'apple', '["dmg", "pkg"]', 'bundle_id', 1, 'active', 60),
  ('plat_linux', '0', 'linux', 'desktop', 'linux', '["appimage", "deb", "rpm", "tar_gz"]', 'none', 0, 'active', 70),
  -- Web / browser
  ('plat_web', '0', 'web', 'web', 'w3c', '["webmanifest"]', 'start_url', 0, 'active', 80),
  ('plat_ext_chrome', '0', 'browser-extension-chrome', 'browser-extension', 'google', '["crx", "zip"]', 'extension_id', 1, 'active', 90),
  ('plat_ext_edge', '0', 'browser-extension-edge', 'browser-extension', 'microsoft', '["crx", "zip"]', 'extension_id', 1, 'active', 100),
  ('plat_ext_firefox', '0', 'browser-extension-firefox', 'browser-extension', 'mozilla', '["xpi"]', 'extension_id', 1, 'active', 110),
  ('plat_ext_safari', '0', 'browser-extension-safari', 'browser-extension', 'apple', '["app"]', 'bundle_id', 1, 'active', 120),
  -- Mini programs
  ('plat_mp_wechat', '0', 'miniprogram-wechat', 'miniprogram', 'tencent', '["mp_bundle"]', 'appid', 1, 'active', 130),
  ('plat_mp_alipay', '0', 'miniprogram-alipay', 'miniprogram', 'alibaba', '["mp_bundle"]', 'appid', 1, 'active', 140),
  ('plat_mp_qq', '0', 'miniprogram-qq', 'miniprogram', 'tencent', '["mp_bundle"]', 'appid', 1, 'active', 150),
  ('plat_mp_douyin', '0', 'miniprogram-douyin', 'miniprogram', 'bytedance', '["mp_bundle"]', 'appid', 1, 'active', 160),
  ('plat_mp_baidu', '0', 'miniprogram-baidu', 'miniprogram', 'baidu', '["mp_bundle"]', 'appid', 1, 'active', 170),
  ('plat_mp_taobao', '0', 'miniprogram-taobao', 'miniprogram', 'alibaba', '["mp_bundle"]', 'appid', 1, 'active', 180)
ON CONFLICT (tenant_id, platform_code) DO NOTHING;
