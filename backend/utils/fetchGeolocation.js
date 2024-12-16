import axios from 'axios';

export const fetchGeolocation = async (ip) => {
    try {
        const response = await axios.get(`https://api.ipstack.com/${ip}?access_key=${process.env.GEOLOCATION_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching geolocation data:', error);
        return {};
    }
};
