export const getLatestMFData = async (code) => {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${code}/latest`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching MF data:', error);
    throw error;
  }
};