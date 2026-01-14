import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_PAGE_KEY = 'QURAN_LAST_PAGE';

export const saveLastPage = async (page) => {
  try {
    await AsyncStorage.setItem(LAST_PAGE_KEY, String(page));
  } catch (e) {
    console.log('Save last page error', e);
  }
};

export const getLastPage = async () => {
  try {
    const page = await AsyncStorage.getItem(LAST_PAGE_KEY);
    return page ? Number(page) : 1;
  } catch (e) {
    return 1;
  }
};
