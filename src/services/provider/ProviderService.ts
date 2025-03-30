import { Provider } from '@/src/types/core';
import { availableProvidersAtom, syncToPolarisAtom } from '@/src/hooks/atoms';
import { getDefaultStore } from 'jotai';
import PolarisServer from '@/src/services/polaris/PolarisServer';
import { toastService } from '@/src/services/toastService';
import LogService from '@/utils/LogService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from '@/src/utils/platform';

/**
 * ProviderService provides a unified interface for managing providers,
 * abstracting whether they're stored locally or on the Polaris server.
 */
export class ProviderService {
  /**
   * Get all available providers
   */
  static async getProviders(): Promise<Provider[]> {
    try {
      const syncToPolaris = await getDefaultStore().get(syncToPolarisAtom);

      if(syncToPolaris && !PolarisServer.isServerConnected()){
        await PolarisServer.connect("http://localhost:3000", "your_api_key_here");
      }
      
      return await PolarisServer.getProviders();
    } catch (error: any) {
      LogService.log(error, { component: 'ProviderService', function: 'getProviders' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to load providers'
      });
      return [];
    }
  }

  /**
   * Save a provider (create or update)
   */
  static async saveProvider(provider: Provider): Promise<Provider | null> {
    try {
      const syncToPolaris = await getDefaultStore().get(syncToPolarisAtom);
      
      // If syncing to Polaris and connected, save to server
      if (syncToPolaris && PolarisServer.isServerConnected()) {
        let serverProvider;
        
        if (provider.isServerResource) {
          // Update existing server provider
          serverProvider = await PolarisServer.updateProvider(provider);
        } else {
          // Create new server provider
          serverProvider = await PolarisServer.createProvider(provider);
        }
        
        if (serverProvider) {
          // Update local storage with the server provider
          const localProviders = await this.getLocalProviders();
          const updatedProviders = localProviders.map(p => 
            p.id === provider.id ? serverProvider : p
          );
          
          if (!updatedProviders.some(p => p.id === provider.id)) {
            updatedProviders.push(serverProvider);
          }
          
          await this.saveLocalProviders(updatedProviders);
          return serverProvider;
        }
        return null;
      } else {
        // Save locally
        const localProviders = await this.getLocalProviders();
        
        // Generate ID if it's a new provider
        if (!provider.id) {
          provider.id = Date.now().toString();
        }
        
        // Update or add the provider
        const providerExists = localProviders.some(p => p.id === provider.id);
        const updatedProviders = providerExists
          ? localProviders.map(p => p.id === provider.id ? provider : p)
          : [...localProviders, provider];
        
        await this.saveLocalProviders(updatedProviders);
        return provider;
      }
    } catch (error: any) {
      LogService.log(error, { component: 'ProviderService', function: 'saveProvider' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to save provider'
      });
      return null;
    }
  }

  /**
   * Delete a provider
   */
  static async deleteProvider(id: string): Promise<boolean> {
    try {
      
      console.log('deleting provider', id);
      return true;
      // If it's a server resource and we're syncing, delete from server
      const success = await PolarisServer.deleteProvider(id);
      
      if (!success) {
        toastService.danger({
          title: 'Error',
          description: 'Failed to delete provider from server'
        });
        return false;
      }
      
      return true;
    } catch (error: any) {
      LogService.log(error, { component: 'ProviderService', function: 'deleteProvider' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to delete provider'
      });
      return false;
    }
  }

  /**
   * Sync a local provider to the Polaris server
   */
  static async syncProviderToServer(provider: Provider): Promise<Provider | null> {
    if (!PolarisServer.isServerConnected()) {
      toastService.danger({
        title: 'Not Connected',
        description: 'Please connect to a Polaris server first'
      });
      return null;
    }
    
    try {
      // Create or update on server
      const serverProvider = provider.isServerResource
        ? await PolarisServer.updateProvider(provider)
        : await PolarisServer.createProvider(provider);
      
      if (serverProvider) {
        // Update local storage
        const localProviders = await this.getLocalProviders();
        const updatedProviders = localProviders.map(p => 
          p.id === provider.id ? serverProvider : p
        );
        
        await this.saveLocalProviders(updatedProviders);
        
        toastService.success({
          title: 'Synced',
          description: 'Provider successfully synced to server'
        });
        
        return serverProvider;
      }
      
      return null;
    } catch (error: any) {
      LogService.log(error, { component: 'ProviderService', function: 'syncProviderToServer' }, 'error');
      toastService.danger({
        title: 'Sync Failed',
        description: 'Failed to sync provider to server'
      });
      return null;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Get providers from local storage
   */
  private static async getLocalProviders(): Promise<Provider[]> {
    try {
      // First try to get from Jotai store
      const jotaiProviders = await getDefaultStore().get(availableProvidersAtom);
      if (jotaiProviders && jotaiProviders.length > 0) {
        return jotaiProviders;
      }
      
      // If not in Jotai, try AsyncStorage
      if (Platform.isMobile) {
        const storedProviders = await AsyncStorage.getItem('providers');
        if (storedProviders) {
          return JSON.parse(storedProviders);
        }
      } else {
        // For web, try localStorage
        const storedProviders = localStorage.getItem('providers');
        if (storedProviders) {
          return JSON.parse(storedProviders);
        }
      }
      
      return [];
    } catch (error: any) {
      LogService.log(error, { component: 'ProviderService', function: 'getLocalProviders' }, 'error');
      return [];
    }
  }

  /**
   * Save providers to local storage
   */
  private static async saveLocalProviders(providers: Provider[]): Promise<void> {
    try {
      // Update Jotai store
      getDefaultStore().set(availableProvidersAtom, providers);
      
      // Also update AsyncStorage/localStorage for persistence
      if (Platform.isMobile) {
        await AsyncStorage.setItem('providers', JSON.stringify(providers));
      } else {
        localStorage.setItem('providers', JSON.stringify(providers));
      }
    } catch (error: any) {
      LogService.log(error, { component: 'ProviderService', function: 'saveLocalProviders' }, 'error');
      throw error;
    }
  }
}

export default ProviderService; 