#!/bin/bash

# Define variables
APP_NAME="Compass"
APP_EXEC_NAME="compass"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
DOWNLOAD_URL="https://github.com/nordwestt/compass/releases/download/0.0.3/compass.AppImage"

# Create necessary directories if they don't exist
mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

# Download AppImage
echo "Downloading $APP_NAME..."
if command -v curl &> /dev/null; then
    curl -L "$DOWNLOAD_URL" -o "$INSTALL_DIR/$APP_EXEC_NAME"
elif command -v wget &> /dev/null; then
    wget -O "$INSTALL_DIR/$APP_EXEC_NAME" "$DOWNLOAD_URL"
else
    echo "Error: Neither curl nor wget is installed. Please install one of them and try again."
    exit 1
fi

# Make AppImage executable
chmod +x "$INSTALL_DIR/$APP_EXEC_NAME"

# Create desktop entry
echo "Creating desktop entry..."
cat > "$DESKTOP_DIR/$APP_EXEC_NAME.desktop" << EOF
[Desktop Entry]
Name=$APP_NAME
Exec=$INSTALL_DIR/$APP_EXEC_NAME
Icon=$APP_EXEC_NAME
Type=Application
Categories=Utility;
Comment=Open source AI chat client compass
Terminal=false
EOF

# Download icon
echo "Downloading icon..."
if command -v curl &> /dev/null; then
    curl -L "https://raw.githubusercontent.com/nordwestt/compass/main/assets/compass.png" -o "$ICON_DIR/$APP_EXEC_NAME.png"
elif command -v wget &> /dev/null; then
    wget -O "$ICON_DIR/$APP_EXEC_NAME.png" "https://raw.githubusercontent.com/nordwestt/compass/main/assets/compass.png"
fi

# Update desktop database
update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true

echo "Installation completed successfully!"
echo "You can now launch $APP_NAME from your application menu or run '$APP_EXEC_NAME' in terminal"