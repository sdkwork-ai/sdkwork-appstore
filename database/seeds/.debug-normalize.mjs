import fs from 'node:fs';

const row = fs
  .readFileSync(new URL('./locales/zh-CN/001_storefront_listings_zh.sql', import.meta.url), 'utf8')
  .split('\n')
  .find((line) => line.includes('loc-app-kimi'));

function firstSentence(text) {
  const match = text.match(/^[^。！？]{12,140}[。！？]/);
  if (match) return match[0];
  return text.length <= 120 ? text : `${text.slice(0, 117)}...`;
}

const parts = row.trim().replace(/,$/, '').split("', '");
console.log('parts', parts.length);
console.log('short', parts[7]);
console.log('full', parts[8]);
console.log('fixed', firstSentence(parts[8]));
