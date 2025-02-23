import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modal } from '@/src/components/ui/Modal';
import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import { hasSeenOnboardingAtom } from '@/src/hooks/atoms';

const ONBOARDING_PAGES = [
  {
    title: 'Welcome to Compass',
    description: 'Your personal AI chat companion. Let\'s get you started with the basics.',
    icon: 'compass'
  },
  {
    title: 'Add a Provider',
    description: 'First, you\'ll need to add an AI provider. Go to Settings > Providers to add Ollama, OpenAI, or other supported services.',
    icon: 'server'
  },
  {
    title: 'Choose a Character',
    description: 'Select or create a character to chat with. Each character has their own personality and expertise.',
    icon: 'people'
  },
  {
    title: 'Start Chatting',
    description: 'That\'s it! You\'re ready to start chatting. Use @ to mention other characters in your conversation.',
    icon: 'chatbubbles'
  }
];

export function WelcomeIntroduction() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [, setHasSeenOnboarding] = useAtom(hasSeenOnboardingAtom);

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenOnboarding(true);
  };

  const handleNext = () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={handleClose}
      className="m-4"
    >
      <View className="p-6">
        <TouchableOpacity 
          onPress={handleClose}
          className="absolute right-4 top-4"
        >
          <Text className="text-primary">Skip</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Ionicons 
            name={ONBOARDING_PAGES[currentPage].icon as any} 
            size={64} 
            className="text-primary mb-4" 
          />
          <Text className="text-2xl font-bold text-text mb-2">
            {ONBOARDING_PAGES[currentPage].title}
          </Text>
          <Text className="text-center text-secondary">
            {ONBOARDING_PAGES[currentPage].description}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-2">
            {ONBOARDING_PAGES.map((_, index) => (
              <View 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentPage ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
          
          <View className="flex-row gap-2">
            {currentPage > 0 && (
              <TouchableOpacity
                onPress={handleBack}
                className="border border-primary px-6 py-3 rounded-lg flex-row items-center"
              >
                <Ionicons name="arrow-back" size={20} className="text-primary" />
                <Text className="text-primary font-medium ml-2">
                  Back
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={handleNext}
              className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
            >
              <Text className="text-white font-medium mr-2">
                {currentPage === ONBOARDING_PAGES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 