import * as icons from '@hugeicons/core-free-icons';
const keys = Object.keys(icons);
const patterns = ['Search01', 'Search02', 'SearchIcon', 'ArrowLeft', 'Menu01Icon', 'Menu02Icon', 'HeadphonesIcon', 'HugeiconsIcon'];
patterns.forEach(p => {
  const matches = keys.filter(k => k === p || k.startsWith(p));
  console.log('--- ' + p + ' ---');
  matches.forEach(m => console.log(m));
});
// Also check the HugeiconsProvider
console.log('--- HugeiconsProvider check ---');
const providerKeys = keys.filter(k => k.includes('Provider') || k.includes('Hugeicons'));
providerKeys.forEach(m => console.log(m));
