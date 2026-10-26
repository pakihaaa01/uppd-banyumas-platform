import type { ChatbotFAQ, FAQItem, ServiceLocation } from '../../types';

type KnowledgeAnswer = { question: string; answer: string; keywords?: string[] };
type AnswerSource = 'greeting' | 'chatbot' | 'faq' | 'locations' | 'unavailable';

export type ChatAnswer = { text: string; source: AnswerSource };

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

  // Prioritize an exact FAQ or managed chatbot question over a broad keyword hit.
  const exactChatbot = activeChatbot.find(item => normalize(item.question) === query);
  if (exactChatbot) return { source: 'chatbot', text: exactChatbot.answer };
  const exactFaq = activeFaq.find(item => normalize(item.question) === query);
  if (exactFaq) return { source: 'faq', text: exactFaq.answer };

  // Ambiguous requests about 'titik lokasi' should show real published locations
  // instead of incorrectly selecting one individual SAMSAT office.
  if (/\b(titik lokasi|titik layanan|daftar lokasi)\b/.test(query) && !query.includes('keliling')) {
    const available = serviceLocations.filter(item => item.name?.trim());
    if (available.length) {
      return {
        source: 'locations',
        text: 'Berikut beberapa titik pelayanan SAMSAT yang tercantum di website:\n' +
          available.slice(0, 6).map(item =>
            '• ' + item.name + (item.address?.trim() ? ' — ' + item.address : '') +
            (item.operatingHours?.trim() ? ' (' + item.operatingHours + ')' : '')
          ).join('\n') + '\n\nLihat halaman Layanan untuk daftar dan Google Maps selengkapnya.',
      };
    }
    return { source: 'locations', text: 'Informasi titik pelayanan tersedia pada halaman Layanan. Silakan buka bagian Lokasi Pelayanan untuk melihat daftar dan tautan Google Maps.' };
  }

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
