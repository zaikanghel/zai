import React, { useState } from 'react';
import URLShortener from '../components/urlShortener/URLShortener';
import ShortenedURL from '../components/urlShortener/ShortenedURL';
import { useAuthStore } from "../store/authStore";
import Countdown from '../utils/Countdown';

const LogMyIp = () => {
  const { user } = useAuthStore();
  const [initialTime] = Countdown(user.time);
  const [shortUrl, setShortUrl] = useState('');

  return (
    <div>
      <URLShortener setShortUrl={setShortUrl} />
      <ShortenedURL shortUrl={shortUrl} />
    </div>
  );
};

export default LogMyIp;