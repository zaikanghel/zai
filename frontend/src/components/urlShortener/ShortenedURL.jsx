import React from 'react';

const ShortenedURL = ({ shortUrl }) => {
  return (
    shortUrl && (
      <div>
        <h2>Short URL</h2>
        <p>{shortUrl}</p>
      </div>
    )
  );
};

export default ShortenedURL;