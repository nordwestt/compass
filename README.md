# Welcome to Compass

Compass is a modern, open-source Large Language Model (LLM) client designed to provide a seamless AI chat experience across multiple platforms. Built with React Native and Expo, it offers a rich set of features while maintaining high performance and user experience.

<p align="center">
<img src="https://github.com/user-attachments/assets/f95389af-4378-466f-87e2-142638c1f422" alt="Compass Desktop" height="300" />
   &nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://github.com/user-attachments/assets/02f206c1-9522-4264-bb18-c6f3cde8e152" alt="Compass Mobile" height="300"/>
</p>


## Features

- 🌐 **Cross-Platform**: Available on iOS, Android, and Linux
- 🤖 **Multiple LLM Providers**: Support for OpenAI, Anthropic, Ollama, and more
- 👥 **Character System**: Built-in characters and support for custom character creation
- 💬 **Chat History**: Persistent conversation tracking and management
- 🤝 **Inter-Character Communication**: Tag (@) characters in chats for multi-agent interactions
- 🎨 **Modern UI**: Clean, responsive interface with multiple themes built in
- 🔍 **Web search**: Web search integration using SearxNg
- 🗣️ **Text-to-Speech (TTS)**: Natural voice output for AI responses (currently only supports ElevenLabs, more coming soon)
- 🖼️ **Image Generation**: Generate images from text prompts (currently only supports Replicate, more coming soon)
- 📁 **Image Gallery**: View images that have been generated
- 🖥️ **Desktop Shortcut**: Alt + N to open a new chat
## Roadmap

- 🎤 **Speech-to-Text (STT)**: Voice input capabilities
- 📞 **Voice Calls**: Real-time voice conversations with AI
- 📸 **Vision Integration**: Camera support for vision model capabilities
- 🔍 **RAG Support**: Document analysis
- ⚙️ **Custom Filters**: Self-programmable filters and data processing pipes

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   nvm use 18.19.0
   npx expo start
   ```

You can run the app using:

- [Development Build](https://docs.expo.dev/develop/development-builds/introduction/) - Full feature access
- [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/) - For Android development
- [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/) - For iOS development
- [Expo Go](https://expo.dev/go) - Quick testing and development

## Building app for Linux

First install the prerequisites: https://v2.tauri.app/start/prerequisites/

Then run:

```bash
nvm use 18.19.0
npm run build:linux
```

## Contributing

I don't currently accept contributions since I'm still working on the core functionality, but I welcome feedback and suggestions for now!
