import type { ChatbotFAQ, FAQItem, ServiceLocation } from '../../types';

type KnowledgeAnswer = { question: string; answer: string; keywords?: string[] };
type AnswerSource = 'greeting' | 'chatbot' | 'faq' | 'locations' | 'unavailable';

export type ChatAnswer = { text: string; source: AnswerSource; links?: { label: string; url: string }[]; choices?: string[] };

// Deterministic matching of previously reviewed and published content.
// Does not generate schedules, fees or contact information.
const normalize = (value: string) => value.toLocaleLowerCase('id-ID')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const ignored = new Set([
  'apa', 'apakah', 'yang', 'dan', 'atau', 'untuk', 'dari', 'saja', 'di',
  'mana', 'dimana', 'bagaimana', 'berapa', 'pada', 'saya', 'mau', 'ingin',
  'tolong', 'bisa', 'dapat', 'kah', 'nya', 'ini', 'itu', 'ada', 'ke',
  'banyumas', 'samsat', 'cara',
]);

const words = (value: string) => [...new Set(normalize(value).split(' ').filter(w => w.length >= 3 && !ignored.has(w)))];

function matchScore(query: string, entry: KnowledgeAnswer): number {
  const question = normalize(entry.question);
  if (!question) return 0;
  if (query === question) return 1000;
  if (query.length > 9 && (query.includes(question) || question.includes(query))) return 120;
  const qWords = words(query);
  const titleWords = words(entry.question);
  const overlap = qWords.filter(token => titleWords.includes(token)).length;
  let score = overlap * 4;
  // Require at least two meaningful question tokens, except for exact keyword matches.
  if (overlap >= 2) score += 5;
  for (const keyword of entry.keywords ?? []) {
    const keywordValue = normalize(keyword);
    if (!keywordValue) continue;
    const tokenMatch = (' ' + query + ' ').includes(' ' + keywordValue + ' ');
    if (tokenMatch) score += keywordValue.includes(' ') ? 12 : 3;
  }
  return score;
}

// Use only locations returned by the public API; never invent opening hours.
function resolveLocationAnswer(query: string, locations: ServiceLocation[]): ChatAnswer | null {
  const canonical = (value: string) => normalize(value)
    .replace(/drive (through|thru|tru)/g, 'drivethru')
    .replace(/super mall/g, 'supermall');
  const q = canonical(query);
  const generic = new Set(['samsat', 'banyumas', 'kabupaten', 'kantor', 'pelayanan', 'layanan', 'gerai']);
  const nameWords = (name: string) => canonical(name).split(' ').filter(w => !generic.has(w));
  const available = locations.filter(item => item.name?.trim());
  const queryWords = q.split(' ');
  const vocabulary = new Set(available.flatMap(item => nameWords(item.name)));
  const identifiers = queryWords.filter(word => vocabulary.has(word));
  const locationIntent = /\b(jam|jadwal|operasional|buka|bukanya|tutup|alamat|lokasi|maps|map|peta|kantor|titik)\b/.test(q);
  const namedOffice = identifiers.length > 0 && (q.includes('samsat') || available.some(item => canonical(item.name) === q));
  if (!locationIntent && !namedOffice) return null;

  if (!available.length) return { source: 'locations', text: 'Data lokasi dan jam pelayanan belum tersedia. Silakan coba lagi atau hubungi petugas melalui halaman Kontak.' };
  // Match all supplied identifiers: "Cepat Wangon" must not select Pembantu Wangon.
  const matches = identifiers.length
    ? available.filter(item => identifiers.every(word => nameWords(item.name).includes(word)))
    : [];
  if (matches.length !== 1) {
    const candidates = matches.length ? matches : available;
    return {
      source: 'locations',
      text: matches.length > 1
        ? 'Ada beberapa titik pelayanan yang sesuai. Pilih lokasi untuk melihat jam pelayanan dan Google Maps:'
        : 'Jam pelayanan berbeda pada setiap lokasi. Silakan pilih titik pelayanan yang dimaksud:',
      choices: candidates.map(item => item.name),
    };
  }
  const location = matches[0]!;
  const mapsSearch = (name: string) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name);
  let mapsUrl = mapsSearch(location.name + ' ' + (location.address || 'Banyumas'));
  try {
    const url = new URL(location.mapsUrl);
    if (url.protocol === 'https:' && ['maps.google.com', 'google.com', 'www.google.com', 'maps.app.goo.gl', 'goo.gl'].includes(url.hostname)) mapsUrl = url.href;
  } catch { /* Fall back to a Google Maps place search. */ }
  const links = /samsat\s+malam\s+minggu/i.test(location.name)
    ? [
      { label: 'Google Maps: Alun-Alun Banyumas', url: mapsSearch('Alun-Alun Banyumas, Kabupaten Banyumas, Jawa Tengah') },
      { label: 'Google Maps: Taman Kebokura, Sumpiuh', url: mapsSearch('Taman Kebokura, Sumpiuh, Kabupaten Banyumas, Jawa Tengah') },
    ]
    : [{ label: 'Buka ' + location.name + ' di Google Maps', url: mapsUrl }];
  return {
    source: 'locations',
    text: location.name + '\n\nAlamat: ' + (location.address?.trim() || 'Belum tersedia') +
      '\n\nJam pelayanan:\n' + (location.operatingHours?.trim().replace(/\s*\|\s*/g, '\n') || 'Belum tersedia. Silakan konfirmasi kepada petugas.') +
      (location.type === 'keliling' && location.description?.trim() ? '\n\n' + location.description.trim() : ''),
    links,
  };
}

export function resolveChatAnswer(
  userInput: string,
  chatbotFaqs: ChatbotFAQ[],
  publicFaqs: FAQItem[],
  serviceLocations: ServiceLocation[],
): ChatAnswer {
  const query = normalize(userInput);
  if (!query) return { source: 'unavailable', text: 'Silakan tulis pertanyaan terlebih dahulu.' };

  if (/^(halo|hai|hi|hello|pagi|siang|sore|malam|assalamualaikum|permisi)( semuanya| mas sajak)?$/.test(query)) {
    return { source: 'greeting', text: 'Halo! Saya Mas Sajak, asisten virtual UPPD Kabupaten Banyumas. Silakan tanya tentang lokasi pelayanan, jadwal, persyaratan pajak, atau layanan digital SAMSAT.' };
  }

  const activeChatbot = chatbotFaqs.filter(item => item.isEnabled);
  const activeFaq = publicFaqs.filter(item => item.isEnabled);

  const locationAnswer = resolveLocationAnswer(query, serviceLocations);
  if (locationAnswer) return locationAnswer;

  // Prioritize an exact FAQ or managed chatbot question over a broad keyword hit.
  const exactChatbot = activeChatbot.find(item => normalize(item.question) === query);
  if (exactChatbot) return { source: 'chatbot', text: exactChatbot.answer };
  const exactFaq = activeFaq.find(item => normalize(item.question) === query);
  if (exactFaq) return { source: 'faq', text: exactFaq.answer };

  const entries: { entry: KnowledgeAnswer; source: 'chatbot' | 'faq'; score: number }[] = [
    ...activeChatbot.map(entry => ({ entry, source: 'chatbot' as const, score: matchScore(query, entry) })),
    ...activeFaq.map(entry => ({ entry, source: 'faq' as const, score: matchScore(query, entry) })),
  ];
  const winner = entries.sort((a, b) => b.score - a.score)[0];
  if (winner && winner.score >= 8) return { source: winner.source, text: winner.entry.answer };

  return {
    source: 'unavailable',
    text: 'Maaf, saya belum menemukan jawaban yang sesuai. Silakan lihat halaman FAQ atau hubungi petugas melalui halaman Kontak.',
  };
}

