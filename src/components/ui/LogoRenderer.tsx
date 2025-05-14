import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Image } from 'react-native';

interface LogoRendererProps {
    logo: string | React.ReactNode;
    size?: number;
    className?: string;
}
  
const LogoRenderer: React.FC<LogoRendererProps> = ({ logo, className, size = 48 }) => {
    if (typeof logo === 'string') {
        // check if logo is a valid url
        if (logo.startsWith('http')) {
            return (
                <Image
                style={{ width: size, height: size }}
                source={{ uri: logo }}
                className={`rounded-full ${className}`}
                />
            );  
        }
        else {
            return <Ionicons name={logo as any} size={size} className={`rounded-full ${className}`} />;
        }
    }
    

    // If logo is a React element, render it directly
    
    // If logo is a React element, render it directly
    return <View className={`${className}`}>{logo}</View>;
};

export default LogoRenderer; 