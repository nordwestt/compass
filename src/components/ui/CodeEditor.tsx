import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from 'nativewind';

interface CodeEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  language?: 'json' | 'javascript' | 'typescript' | 'html' | 'css';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChangeText,
  language = 'json',
  style,
  textStyle,
  readOnly = false,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleChangeText = (newText: string) => {
    setText(newText);
    onChangeText(newText);
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={text}
        onChangeText={handleChangeText}
        multiline
        editable={!readOnly}
        style={[
          styles.editor,
          isDark ? styles.editorDark : styles.editorLight,
          textStyle,
        ]}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        textAlignVertical="top"
        className="outline-none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  editor: {
    padding: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    minHeight: 100,
  },
  editorLight: {
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  editorDark: {
    backgroundColor: '#1e1e1e',
    color: '#f5f5f5',
  },
});

export default CodeEditor; 