// This function should be called when your web app initializes
export function setupAuthCallbackListener() {
  if (typeof window !== 'undefined') {
    // Check if this is an auth callback page
    const url = window.location.href;
    console.log("url", url);
    if (url.includes('/auth-callback') && url.includes('token=')) {
      try {
        // Extract token
        const token = new URLSearchParams(window.location.search).get('token');
        console.log("token", token);
        if (token && window.opener) {
          // Send the token back to the opener window
          window.opener.postMessage(
            JSON.stringify({ type: 'auth-callback', token }),
            '*'  // In production, specify exact origin for security
          );
          
          // Close this popup window
          window.close();
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
      }
    }
  }
} 