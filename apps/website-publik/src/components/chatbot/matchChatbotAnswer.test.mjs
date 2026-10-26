import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveChatAnswer } from './matchChatbotAnswer.ts';

const chatbot = [{
  id: 'bot-2', question: 'Lokasi SAMSAT',
  answer: 'Jawaban terbit dari Portal Pegawai.',
  category: 'Lokasi', keywords: ['lokasi', 'alamat'], isEnabled: true, clickCount: 0,
}];
const faqs = [{
  id: 'faq-5',
  question: 'Dimana saja lokasi SAMSAT Keliling Banyumas dan jam berapa bukanya?',
  answer: 'Jawaban FAQ terbit dari database.',
  category: 'Lokasi & Jadwal', isEnabled: true, isPopular: true, viewCount: 0,
}];
const locations = [{
  id: 'loc-1', name: 'SAMSAT Induk', address: 'Alamat contoh lokasi dari database',
  operatingHours: '08.00–14.00 WIB',
}];

test('sapaan halo mendapat respons Mas Sajak', () => {
  const answer = resolveChatAnswer('halo', [], [], []);
  assert.equal(answer.source, 'greeting');
  assert.match(answer.text, /Mas Sajak/);
});

test('titik lokasi memakai data lokasi yang tersedia', () => {
  const answer = resolveChatAnswer('titik lokasi', chatbot, faqs, locations);
  assert.equal(answer.source, 'locations');
  assert.match(answer.text, /SAMSAT Induk/);
});

test('pertanyaan FAQ lengkap memakai jawaban FAQ aktif', () => {
  const answer = resolveChatAnswer(
    'dimana saja lokasi samsat keliling banyumas dan jam berapa bukanya',
    chatbot, faqs, locations,
  );
  assert.equal(answer.source, 'faq');
  assert.equal(answer.text, 'Jawaban FAQ terbit dari database.');
});

test('jawaban chatbot aktif diutamakan saat pertanyaan cocok', () => {
  const answer = resolveChatAnswer('Lokasi SAMSAT', chatbot, faqs, locations);
  assert.equal(answer.source, 'chatbot');
  assert.equal(answer.text, 'Jawaban terbit dari Portal Pegawai.');
});

test('jawaban nonaktif tidak bocor ke website publik', () => {
  const answer = resolveChatAnswer('Lokasi SAMSAT', [{ ...chatbot[0], isEnabled: false }], [], []);
  assert.equal(answer.source, 'unavailable');
});
