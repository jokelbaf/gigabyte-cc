# AORUS Control Center

A desktop application for managing AORUS/Gigabyte laptops on Linux. Control fan speeds, battery charging, GPU boost, and monitor system temperatures through a modern graphical interface.

## Features

- **Fan Control**: Switch between fan modes (Normal, Silent, Gaming, Custom, Auto, Fixed) and set custom speeds
- **Power Management**: Configure battery charging modes and set charge limits (60-100%)
- **Performance**: Control GPU boost and view USB charging settings
- **Fan Curve**: Customize fan response to temperature with an interactive graph editor
- **System Monitor**: Real-time CPU/GPU/motherboard temperatures and fan speeds
- **Dark Mode**: Built-in theme switcher

## Requirements

- Linux (x86_64)
- [aorus-laptop kernel driver](https://github.com/tangalbert919/gigabyte-laptop-wmi) installed and loaded
- PolicyKit (polkit) for privilege management

## Installation

### Build from Source

```bash
# Install dependencies
pnpm install

# Build the helper binary
cd aorus-helper
cargo build --release
cd ..

# Build the Tauri app
pnpm tauri build
```

### Arch Linux

```bash
# Install the helper and polkit policy
sudo install -Dm755 aorus-helper/target/release/aorus-helper /usr/lib/aorus-cc/aorus-helper
sudo install -Dm644 polkit-policy/com.aorus.controlcenter.policy /usr/share/polkit-1/actions/

# Install the app via pacman (or use AppImage/binary)
cd src-tauri/target/release/bundle
sudo pacman -U aorus-control-center-*.pkg.tar.zst
```

Or use the AppImage:

```bash
chmod +x src-tauri/target/release/bundle/appimage/aorus-control-center_*.AppImage
./src-tauri/target/release/bundle/appimage/aorus-control-center_*.AppImage
```

### Debian/Ubuntu

```bash
# Install the helper and polkit policy
sudo install -Dm755 aorus-helper/target/release/aorus-helper /usr/lib/aorus-cc/aorus-helper
sudo install -Dm644 polkit-policy/com.aorus.controlcenter.policy /usr/share/polkit-1/actions/

# Install the app
sudo dpkg -i src-tauri/target/release/bundle/deb/aorus-control-center_*.deb
```

### Fedora/RHEL

```bash
# Install the helper and polkit policy
sudo install -Dm755 aorus-helper/target/release/aorus-helper /usr/lib/aorus-cc/aorus-helper
sudo install -Dm644 polkit-policy/com.aorus.controlcenter.policy /usr/share/polkit-1/actions/

# Install the app
sudo dnf install src-tauri/target/release/bundle/rpm/aorus-control-center-*.rpm
```

### How It Works

The app uses a privilege separation model:

1. **GUI (unprivileged)**: Runs as your normal user
2. **Helper (/usr/lib/aorus-cc/aorus-helper)**: Minimal root binary that only reads/writes specific sysfs nodes
3. **PolicyKit**: Manages authorization - prompts once per session (or auto-allows based on policy)

When you adjust a setting, the GUI calls `pkexec /usr/lib/aorus-cc/aorus-helper write <attribute> <value>`. PolicyKit checks permissions and the helper validates and writes to sysfs. No password is required after the first authorization (configurable via polkit rules).

## Development

### Prerequisites

- Node.js 18+
- pnpm
- Rust (via rustup)
- Tauri CLI dependencies

### Running

```bash
# Install dependencies
pnpm install

# Build the helper (for testing)
cd aorus-helper
cargo build --release
cd ..

# Install helper and policy for development
sudo install -Dm755 aorus-helper/target/release/aorus-helper /usr/lib/aorus-cc/aorus-helper
sudo install -Dm644 polkit-policy/com.aorus.controlcenter.policy /usr/share/polkit-1/actions/

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

### Project Structure

```
src/                   # React frontend (TypeScript + Tailwind)
src-tauri/             # Rust backend (Tauri)
aorus-helper/          # Privileged helper binary
polkit-policy/         # PolicyKit authorization rules
gigabyte-laptop-wmi/   # Kernel driver
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on your hardware
5. Submit a pull request

Please follow the existing code style and include clear commit messages.

## License

GPL-2.0-or-later (matching the kernel driver license)

## Credits

- Kernel driver by Albert Tang
- GUI built with Tauri, React, and TypeScript
- Icons from Lucide
