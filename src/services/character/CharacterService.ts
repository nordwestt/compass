import { Character } from '@/src/types/core';
import { charactersAtom, syncToPolarisAtom } from '@/src/hooks/atoms';
import { getDefaultStore } from 'jotai';
import PolarisServer from '@/src/services/polaris/PolarisServer';
import { toastService } from '@/src/services/toastService';
import LogService from '@/utils/LogService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from '@/src/utils/platform';

/**
 * CharacterService provides a unified interface for managing characters,
 * abstracting whether they're stored locally or on the Polaris server.
 */
export class CharacterService {
  /**
   * Get all available characters
   */
  static async getCharacters(): Promise<Character[]> {
    try {
      const syncToPolaris = await getDefaultStore().get(syncToPolarisAtom);

      if(syncToPolaris && !PolarisServer.isServerConnected()){
        await PolarisServer.connect("http://localhost:3000", "your_api_key_here");
      }
      
      // If syncing to Polaris and connected, get characters from server
      if (syncToPolaris && PolarisServer.isServerConnected()) {
        return await PolarisServer.getCharacters();
      } else {
        // Just get local characters
        return await this.getLocalCharacters();
      }
    } catch (error: any) {
      LogService.log(error, { component: 'CharacterService', function: 'getCharacters' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to load characters'
      });
      return [];
    }
  }

  /**
   * Save a character (create or update)
   */
  static async saveCharacter(character: Character): Promise<Character | null> {
    try {
      const syncToPolaris = await getDefaultStore().get(syncToPolarisAtom);

      if(syncToPolaris && !PolarisServer.isServerConnected()){
        await PolarisServer.connect("http://localhost:3000", "your_api_key_here");
      }
      
      // If syncing to Polaris and connected, save to server
      if (syncToPolaris && PolarisServer.isServerConnected()) {
        if (character.isServerResource) {
          // Update existing server character
          return await PolarisServer.updateCharacter(character);
        } else {
          // Create new server character
          return await PolarisServer.createCharacter(character);
        }
      } else {
        // Save locally
        const localCharacters = await this.getLocalCharacters();
        
        // Generate ID if it's a new character
        if (!character.id) {
          character.id = Date.now().toString();
        }
        
        // Update or add the character
        const characterExists = localCharacters.some(c => c.id === character.id);
        const updatedCharacters = characterExists
          ? localCharacters.map(c => c.id === character.id ? character : c)
          : [...localCharacters, character];
        
        await this.saveLocalCharacters(updatedCharacters);
        return character;
      }
    } catch (error: any) {
      LogService.log(error, { component: 'CharacterService', function: 'saveCharacter' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to save character'
      });
      return null;
    }
  }

  /**
   * Delete a character
   */
  static async deleteCharacter(id: string): Promise<boolean> {
    try {
      const syncToPolaris = await getDefaultStore().get(syncToPolarisAtom);
      const localCharacters = await this.getLocalCharacters();
      const character = localCharacters.find(c => c.id === id);
      
      if (!character) {
        return false;
      }
      
      // If it's a server resource and we're syncing, delete from server
      if (syncToPolaris && PolarisServer.isServerConnected() && character.isServerResource) {
        const serverId = character.serverResourceId || character.id;
        const success = await PolarisServer.deleteCharacter(serverId);
        
        if(success){
          toastService.success({
            title: 'Deleted',
            description: 'Character deleted from server'
          });
          return true;
        }
        else {
          toastService.danger({
            title: 'Error',
            description: 'Failed to delete character from server'
          });
          return false;
        }
      }
      
      return true;
    } catch (error: any) {
      LogService.log(error, { component: 'CharacterService', function: 'deleteCharacter' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to delete character'
      });
      return false;
    }
  }

  /**
   * Sync a local character to the Polaris server
   */
  static async syncCharacterToServer(character: Character): Promise<Character | null> {
    if (!PolarisServer.isServerConnected()) {
      toastService.danger({
        title: 'Not Connected',
        description: 'Please connect to a Polaris server first'
      });
      return null;
    }
    
    try {
      // Create or update on server
      const serverCharacter = character.isServerResource
        ? await PolarisServer.updateCharacter(character)
        : await PolarisServer.createCharacter(character);
      
      if (serverCharacter) {
        // Update local storage
        const localCharacters = await this.getLocalCharacters();
        const updatedCharacters = localCharacters.map(c => 
          c.id === character.id ? serverCharacter : c
        );
        
        await this.saveLocalCharacters(updatedCharacters);
        
        toastService.success({
          title: 'Synced',
          description: 'Character successfully synced to server'
        });
        
        return serverCharacter;
      }
      
      return null;
    } catch (error: any) {
      LogService.log(error, { component: 'CharacterService', function: 'syncCharacterToServer' }, 'error');
      toastService.danger({
        title: 'Sync Failed',
        description: 'Failed to sync character to server'
      });
      return null;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Get characters from local storage
   */
  private static async getLocalCharacters(): Promise<Character[]> {
    try {
      // First try to get from Jotai store
      const jotaiCharacters = await getDefaultStore().get(charactersAtom);
      if (jotaiCharacters && jotaiCharacters.length > 0) {
        return jotaiCharacters;
      }
      
      // If not in Jotai, try AsyncStorage
      if (Platform.isMobile) {
        const storedCharacters = await AsyncStorage.getItem('characters');
        if (storedCharacters) {
          return JSON.parse(storedCharacters);
        }
      } else {
        // For web, try localStorage
        const storedCharacters = localStorage.getItem('characters');
        if (storedCharacters) {
          return JSON.parse(storedCharacters);
        }
      }
      
      return [];
    } catch (error: any) {
      LogService.log(error, { component: 'CharacterService', function: 'getLocalCharacters' }, 'error');
      return [];
    }
  }

  /**
   * Save characters to local storage
   */
  private static async saveLocalCharacters(characters: Character[]): Promise<void> {
    try {
      // Update Jotai store
      getDefaultStore().set(charactersAtom, characters);
      
      // Also update AsyncStorage/localStorage for persistence
      if (Platform.isMobile) {
        await AsyncStorage.setItem('characters', JSON.stringify(characters));
      } else {
        localStorage.setItem('characters', JSON.stringify(characters));
      }
    } catch (error: any) {
      LogService.log(error, { component: 'CharacterService', function: 'saveLocalCharacters' }, 'error');
      throw error;
    }
  }
}

export default CharacterService; 