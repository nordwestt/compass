import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomHeader() {
  const navigation = useNavigation();
  const route = useRoute();
  const canGoBack = navigation.canGoBack();
  const { top } = useSafeAreaInsets();

  let segments = route.name.split('/').filter(Boolean);
  if(segments.length > 1) {
    segments = [segments[segments.length - 2]];
  }


  const Title = () => (
    <View className="flex-row items-center">
      {segments.map((segment, index) => (
        <View key={segment} className="flex-row items-center">
          {index > 0 && (
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              className="!text-secondary mx-1" 
            />
          )}
          <Text className="text-primary capitalize font-semibold pt-1">
            {segment.replace('-', ' ')}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View className="flex-row items-center px-4 py-3 bg-surface" style={{ paddingTop: top }}>
      <View className="flex-row items-center flex-1">
        {canGoBack && (
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Ionicons name="chevron-back" size={24} className="!text-primary" />
          </TouchableOpacity>
        )}
        
        <Title />
      </View>
      
      {/* Add any right-side buttons here */}
      {/* Example:
      <TouchableOpacity className="ml-auto">
        <Ionicons name="settings-outline" size={24} className="!text-primary" />
      </TouchableOpacity>
      */}
    </View>
  );
} 