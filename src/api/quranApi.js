// src/api/quranApi.js
import axios from 'axios';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

// src/api/quranApi.js

export const getVersesByPage = async (page) => {
  const response = await axios.get(
    `${QURAN_API_BASE}/verses/by_page/${page}`,
    {
      params: {
        fields: 'text_uthmani,page_number,verse_key,juz_number,hizb_number',
        chapter_number: true
      }
    }
  );

  return response.data.verses;
};

export const getChapters = async () => {
  const response = await axios.get(`${QURAN_API_BASE}/chapters`);
  return response.data.chapters;
};

