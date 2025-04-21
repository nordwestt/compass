import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAtom } from 'jotai';
import { localeAtom, changeLocale, t } from '../../i18n';
import { Dropdown } from './ui/Dropdown';

export function LanguageSelector({ className }: { className?: string }) {
  const [currentLocale] = useAtom(localeAtom);

  const languages = [
    { code: 'en', name: 'English', title: '🇬🇧', id: 'en' },
    { code: 'it', name: 'Italiano', title: '🇮🇹', id: 'it' },
    { code: 'da', name: 'Dansk', title: '🇩🇰', id: 'da' },
  ];

  return (
    <View className={className}>
      <Dropdown
      iconOpen=''
      iconClosed=''
        children={languages}
        selected={languages.find((lang) => lang.code === currentLocale) || null}
        onSelect={(value) => changeLocale(value.id)}
        className='bg-surface w-full'
        dropdownOptionClassName=''
        openUpwards={true}
      />
    </View>
  );
};

export default LanguageSelector; 