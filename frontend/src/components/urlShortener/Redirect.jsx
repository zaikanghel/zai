import React, { useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Redirect = () => {
  const { shortUrl } = useParams();
  const homePage = "/";
  
  useEffect(() => {
    const fetchOriginalUrl = async () => {
      try {
        const response = await axios.get(`/api/${shortUrl}`);
        const originalUrl = response.data.originalUrl;
        window.location.href = originalUrl;
      } catch (error) {
        window.location.href = homePage;
      }
    };

    fetchOriginalUrl();
  }, [shortUrl]);

  return <div>Redirecting...</div>;
};

export default Redirect;