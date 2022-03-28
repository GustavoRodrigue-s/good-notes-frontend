export const getCookies = () => {
   const cookies = document.cookie.split('; ').join('=').split('=');

   const accessToken = cookies[cookies.indexOf('accessToken') + 1];
   const refreshToken = cookies[cookies.indexOf('refreshToken') + 1];
   const apiKey = '' || cookies[cookies.indexOf('apiKey') + 1];

   return { accessToken, refreshToken, apiKey }
}

export const createCookies = ({ accessToken, refreshToken }, apiKey) => {
   document.cookie = `apiKey = ${apiKey} ; path=/`;
   document.cookie = `accessToken = ${accessToken} ; path=/`;
   document.cookie = `refreshToken = ${refreshToken} ; path=/`;

   window.open('./index.html', '_self');
}

export const deleteCookies = () => {
   document.cookie = `accessToken = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
   document.cookie = `refreshToken = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
   document.cookie = `apiKey = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

   localStorage.removeItem('keepConnected');
   sessionStorage.clear();
}