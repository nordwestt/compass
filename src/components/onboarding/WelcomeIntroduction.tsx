import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
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
    description: "First, you'll need to add an AI provider. I highly recommend setting up Ollama as it's free and private. Go to Settings > Help to see how to set it up. Alternatively, you can use OpenAI or other providers.",
    icon: 'server'
  },
  {
    title: 'Choose a Character',
    description: 'Select or create a character to chat with. There are 8 starter characters to choose from, each with their own personality.',
    icon: 'people'
  },
  {
    title: 'Start Chatting',
    description: "That's it! You're ready to start chatting. You can paste URLs into the chat to ask about it, or just start chatting with your computer. You can always revisit this onboarding by going to Settings > Help.",
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
      className={Platform.OS === 'web' ? "w-[70%] mx-auto" : "m-4"}
      position={Platform.OS === 'web' ? 'center' : 'bottom'}
    >
      <View className={`p-6 ${Platform.OS === 'web' ? 'max-h-[70vh]' : ''}`}>
        <TouchableOpacity 
          onPress={handleClose}
          className="absolute right-4 top-4"
        >
          <Text className="!text-primary">Skip</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Ionicons 
            name={ONBOARDING_PAGES[currentPage].icon as any} 
            size={64} 
            className={`!text-primary mb-4 ${
              Platform.OS === 'web' && currentPage === 0
                ? 'hover:rotate-180 transition-transform duration-[2000ms] ease-in-out animate-spin-once'
                : ''
            }`}
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
                <Ionicons name="arrow-back" size={20} className="!text-primary" />
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
              <Ionicons name="arrow-forward" size={20} className='!text-white' />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 