import React, { useState } from 'react';
import axios from 'axios';

const URLShortener = ({ setShortUrl }) => {
  const [longUrl, setLongUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/shorten', { url: longUrl });
      setShortUrl(response.data.shortUrl);
      setError(''); // Clear any previous errors
      const logger = response.data.shortUrl;
      window.location.href = logger;
    } catch (error) {
      setError('Error generating short URL');
      console.error('Error generating short URL:', error);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    inputWrapper: {
      position: 'relative',
      width: '100%',
      maxWidth: '400px',
    },
    input: {
      width: '100%',
      padding: '15px 20px',
      fontSize: '18px',
      color: '#fff',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '30px',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    inputFocus: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderColor: '#fff',
      boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
    },
    button: {
      marginTop: '20px',
      padding: '12px 30px',
      fontSize: '18px',
      color: '#fff',
      backgroundColor: '#6D28D9',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    buttonHover: {
      backgroundColor: '#5B21B6',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    },
    linkIcon: {
      position: 'absolute',
      top: '50%',
      left: '20px',
      transform: 'translateY(-50%)',
      width: '24px',
      height: '24px',
      stroke: 'rgba(255, 255, 255, 0.5)',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'none',
    },
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={styles.container}>
          <div style={styles.inputWrapper}>
            <svg style={styles.linkIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              type="text"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="Enter a valid URL"
              style={{
                ...styles.input,
                paddingLeft: '50px',
                ...(document.activeElement === document.getElementById('beautifulInput') ? styles.inputFocus : {}),
              }}
              id="beautifulInput"
            />
          </div>
          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
            onMouseLeave={(e) => Object.assign(e.target.style, styles.button)}
          >
            Shorten
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>Invalid url</p>}
    </div>
  );
};

export default URLShortener;
