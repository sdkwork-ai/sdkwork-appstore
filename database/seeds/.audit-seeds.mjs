import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function listingIdsFrom005(sql) {
  const section = sql.split('INSERT INTO appstore_listing')[1] ?? '';
  return new Set([...section.matchAll(/\('([^']+)',\s*'100001'/g)].map((m) => m[1]));
}

function listingIdsFromLocalization(sql) {
  return new Set([...sql.matchAll(/,\s*'([^']+)',\s*'(?:zh-CN|en-US)'/g)].map((m) => m[1]));
}

function extractChartListingIds(sql) {
  return new Set([...sql.matchAll(/"listingId": "([^"]+)"/g)].map((m) => m[1]));
}

function extractCollectionListingIds(sql) {
  return new Set(
    [...sql.matchAll(/,\s*'([^']+)',\s*\d+,\s*'\{/g)].map((m) => m[1]),
  );
}

function releaseNoteIdsFromLocale(sql) {
  return new Set([...sql.matchAll(/\('(note-[^']+)'/g)].map((m) => m[1]));
}

function countCompleteReleaseNoteRows(sql) {
  return [...sql.matchAll(/CURRENT_TIMESTAMP,\s*CURRENT_TIMESTAMP\)/g)].length;
}

function countBrokenReleaseNoteRows(sql) {
  return [...sql.matchAll(/^\s+\('note-[^']+'[\s\S]*?'• [^']*,\s*$/gm)].length;
}

function listingDisplayNames(sql) {
  const names = new Map();
  for (const match of sql.matchAll(
    /,\s*'([^']+)',\s*'(?:zh-CN|en-US)',\s*'([^']*)',\s*'([^']*)'/g,
  )) {
    names.set(match[1], match[2]);
  }
  return names;
}

function sha256Files(files) {
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(read(file));
  }
  return `sha256:${hash.digest('hex')}`;
}

import { createHash } from 'node:crypto';

const manifest = JSON.parse(read('seed.manifest.json'));
const listingsSql = read('common/005_storefront_listings.sql');
const allListings = listingIdsFrom005(listingsSql);
const zhLocale = listingIdsFromLocalization(read('locales/zh-CN/001_storefront_listings_zh.sql'));
const enLocale = listingIdsFromLocalization(read('locales/en-US/001_storefront_listings_en.sql'));
const zhLocaleReleaseSql = read('locales/zh-CN/002_storefront_releases_zh.sql');
const enLocaleReleaseSql = read('locales/en-US/002_storefront_releases_en.sql');
const zhLocaleReleaseNotes = releaseNoteIdsFromLocale(zhLocaleReleaseSql);
const enLocaleReleaseNotes = releaseNoteIdsFromLocale(enLocaleReleaseSql);

const releases = [...read('common/006_storefront_releases.sql').matchAll(/\('(rel-[^']+)'/g)].map(
  (m) => m[1],
);
const releaseNotes = [...zhLocaleReleaseNotes];

const catalogSql = read('common/007_storefront_catalog.sql');
const chartIds = extractChartListingIds(catalogSql);
const collIds = extractCollectionListingIds(catalogSql);

const libraryReleaseIds = [
  ...read('common/009_user_demo_data.sql').matchAll(/'installed',\s*'(rel-[^']+)'/g),
].map((m) => m[1]);
const badLibraryReleaseRefs = libraryReleaseIds.filter((id) => !releases.includes(id));

const downloadSql = read('common/010_download_capabilities.sql');
const downloadUserMismatch = downloadSql.includes("'demo-user-100001'");

const emptyListingComments = (listingsSql.match(/'4\+',\s*''/g) ?? []).length;
const emptyCollectionHighlights = (catalogSql.match(/,\s*'\{\}'/g) ?? []).length;
const emptyCollectionCovers = (catalogSql.match(/cover_media_resource_id, starts_at[\s\S]*?'', CURRENT_TIMESTAMP/g) ?? []).length;
const emptyListingDisplayNames = [...listingDisplayNames(listingsSql).values()].filter((name) => !name.trim()).length;
const brokenZhReleaseRows = countBrokenReleaseNoteRows(zhLocaleReleaseSql);
const brokenEnReleaseRows = countBrokenReleaseNoteRows(enLocaleReleaseSql);

const localeChecksumIssues = {};
for (const [locale, set] of Object.entries(manifest.localeSets)) {
  if (!set.files?.length) {
    localeChecksumIssues[locale] = 'empty locale file list';
    continue;
  }
  const expected = sha256Files(set.files);
  if (set.checksum !== expected) {
    localeChecksumIssues[locale] = { expected, actual: set.checksum };
  }
}

const standardLocales = manifest.profiles.standard.locales;
const missingStandardLocaleFiles = {};
for (const [locale, files] of Object.entries(standardLocales)) {
  const manifestFiles = manifest.localeSets[locale]?.files ?? [];
  const missingFromManifest = files.filter((file) => !manifestFiles.includes(file));
  if (missingFromManifest.length) {
    missingStandardLocaleFiles[locale] = missingFromManifest;
  }
}

const report = {
  listings: allListings.size,
  zhLocaleLocalization: zhLocale.size,
  enLocaleLocalization: enLocale.size,
  zhLocaleReleaseNotes: zhLocaleReleaseNotes.size,
  enLocaleReleaseNotes: enLocaleReleaseNotes.size,
  completeZhReleaseRows: countCompleteReleaseNoteRows(zhLocaleReleaseSql),
  completeEnReleaseRows: countCompleteReleaseNoteRows(enLocaleReleaseSql),
  missingZhCn: [...allListings].filter((id) => !zhLocale.has(id)).sort(),
  missingEnUs: [...allListings].filter((id) => !enLocale.has(id)).sort(),
  missingZhReleaseNotes: releaseNotes.filter((id) => !zhLocaleReleaseNotes.has(id)),
  missingEnReleaseNotes: releaseNotes.filter((id) => !enLocaleReleaseNotes.has(`${id}-en`)),
  missingReleaseNotes: releases.filter((id) => !releaseNotes.includes(id.replace(/^rel-/, 'note-'))),
  badChartRefs: [...chartIds].filter((id) => !allListings.has(id)),
  badCollectionRefs: [...collIds].filter((id) => !allListings.has(id)),
  badLibraryReleaseRefs,
  downloadUserMismatch,
  emptyListingComments,
  emptyCollectionHighlights,
  emptyCollectionCovers,
  emptyListingDisplayNames,
  brokenZhReleaseRows,
  brokenEnReleaseRows,
  localeChecksumIssues,
  missingStandardLocaleFiles,
  releases: releases.length,
  releaseNotes: releaseNotes.length,
};

console.log(JSON.stringify(report, null, 2));

const failures = [
  report.missingZhCn.length,
  report.missingEnUs.length,
  report.missingZhReleaseNotes.length,
  report.missingEnReleaseNotes.length,
  report.badChartRefs.length,
  report.badCollectionRefs.length,
  report.badLibraryReleaseRefs.length,
  report.downloadUserMismatch ? 1 : 0,
  report.emptyListingDisplayNames,
  report.brokenZhReleaseRows,
  report.brokenEnReleaseRows,
  report.completeZhReleaseRows !== report.releases ? 1 : 0,
  report.completeEnReleaseRows !== report.releases ? 1 : 0,
  Object.keys(report.localeChecksumIssues).length,
  Object.keys(report.missingStandardLocaleFiles).length,
].reduce((sum, n) => sum + n, 0);

if (failures > 0) {
  process.exitCode = 1;
}
