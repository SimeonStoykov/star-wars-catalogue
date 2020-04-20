import { useEffect, useState } from 'react';
import axios from 'axios';
import config from './config';

function setAccessTokens(response) {
  if (response && response.data) {
    response.data.access_token && localStorage.setItem('accessToken', response.data.access_token);
    response.data.refresh_token && localStorage.setItem('refreshToken', response.data.refresh_token);
  }
}

export function useAuth() {
  const { apiUrlBase } = config;
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    const getAuthToken = async () => {
      setIsAuthLoading(true);
      try {
        const response = await axios.post(`${apiUrlBase}auth`, {
          method: 'apk',
          key: process.env.REACT_APP_API_KEY,
          secret: process.env.REACT_APP_API_SECRET
        });
        setAccessTokens(response);
      } catch (error) {
        setIsAuthError(true);
      }
      setIsAuthLoading(false);
    };

    if (!localStorage.getItem('accessToken')) getAuthToken();
  }, [apiUrlBase]);

  return { isAuthLoading, isAuthError };
}

export function useReAuth() {
  const { apiUrlBase } = config;
  const [isReAuthLoading, setIsReAuthLoading] = useState(false);
  const [isReAuthError, setIsReAuthError] = useState(false);
  const [doReAuth, setDoReAuth] = useState(false);

  useEffect(() => {
    const getAuthToken = async () => {
      setIsReAuthLoading(true);
      try {
        const response = await axios.post(`${apiUrlBase}auth/refresh`, { refresh_token: localStorage.getItem('refreshToken') });
        setAccessTokens(response);
      } catch (error) {
        setIsReAuthError(true);
      }
      setIsReAuthLoading(false);
    };

    if (doReAuth) getAuthToken();
  }, [doReAuth, apiUrlBase]);

  return { isReAuthLoading, isReAuthError, setDoReAuth };
}
