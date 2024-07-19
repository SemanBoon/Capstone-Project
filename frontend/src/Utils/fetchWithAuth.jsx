//IMPORTANT BASE CODE FOR JWT TOKEN (STRETCH FEATURE)

// const fetchWithAuth = async (url, options = {}) => {
//     const accessToken = localStorage.getItem("access_token");
//     const refreshToken = localStorage.getItem("refreshToken");

//     if (!accessToken || !refreshToken) {
//         throw new Error('No access token or refresh token found');
//     }

//     const headers = {
//         ...options.headers,
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${accessToken}`,
//     };

//     let response = await fetch(url,{...options, headers});

//     if (response.status === 401) {
//         const refreshedToken = await refreshAccessToken(refreshToken);
//         localStorage.setItem('access_token', refreshedToken);

//         const retryHeaders = {
//             ...options.headers,
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${refreshedToken}`,
//         };

//         response = await fetch(url,{...options, headers: retryHeaders});
//     }
//     return response;
// };

// const refreshAccessToken = async (refreshToken) => {
//     const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/token`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ refreshToken }),
//     });
//     if (!response.ok) {
//         throw new Error('Failed to refresh access token');
//     }

//     const data = await response.json();
//     return data.accessToken;
// };


// export default fetchWithAuth;
