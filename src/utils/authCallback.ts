// This function should be called when your web app initializes
export function setupAuthCallbackListener() {
  if (typeof window !== 'undefined') {
    // Check if this is an auth callback page
    const url = window.location.href;
    console.log("Checking URL for auth callback:", url);
    
    // Check if we're on the auth-callback route
    if (url.includes('/auth-callback')) {
      try {
        // Extract token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        console.log("Found token in URL:", token);
        
        if (token) {
          // If we have a token and an opener window (popup scenario)
          if (window.opener) {
            console.log("Sending token to opener window");
            // Send the token back to the opener window
            window.opener.postMessage(
              JSON.stringify({ type: 'auth-callback', token }),
              '*'  // In production, specify exact origin for security
            );
            
            // Close this popup window after a short delay
            setTimeout(() => window.close(), 1000);
          } else {
            // If no opener (direct navigation), store token in localStorage
            console.log("No opener window found, storing token in localStorage");
            localStorage.setItem('polaris_auth_token', token);
            
            // Redirect to the providers page
            window.location.href = '/settings/providers';
          }
        } else {
          console.error("No token found in URL");
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
      }
    }
  }
}

// Check for stored token on app initialization
export function checkStoredAuthToken() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('polaris_auth_token');
    if (token) {
      console.log("Found stored auth token");
      // You can dispatch an event or call a function to handle the token
      window.dispatchEvent(new CustomEvent('polaris-auth', { 
        detail: { token } 
      }));
      
      // Clear the token from storage after using it
      localStorage.removeItem('polaris_auth_token');
    }
  }
} 