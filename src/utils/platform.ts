export const Platform = {
  OS: process.env.EXPO_PUBLIC_PLATFORM || 'web',
  
  // Check if running in Tauri
  isTauri: typeof window !== 'undefined' && !!(window as any).__TAURI__,
  
  // Check if running in browser (web but not Tauri)
  isWeb: typeof window !== 'undefined' && !(window as any).__TAURI__,
  
  // Check if running on mobile (iOS/Android)
  isMobile: ['ios', 'android'].includes(process.env.EXPO_PUBLIC_PLATFORM || ''),
  
  // Specific platform checks
  isIOS: process.env.EXPO_PUBLIC_PLATFORM === 'ios',
  isAndroid: process.env.EXPO_PUBLIC_PLATFORM === 'android',
  
  // Helper method to get platform type
  getPlatformType(): 'mobile' | 'web' | 'tauri' {
    if (this.isMobile) return 'mobile';
    if (this.isTauri) return 'tauri';
    return 'web';
  }
}; 