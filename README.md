# Pocket Familiar

An experimental educational game prototype combining virtual-pet care, creature growth, portable battle-toy interaction, and rank-based progression in a mobile-friendly 3D handheld.

> **Prototype notice:** This project is a test created for education, experimentation, and demonstration. It is not a finished or production-ready game.

## Current features

- Three.js handheld rendered from runtime geometry and shaders
- Hardware-derived egg seed
- Pixel-art habitat and frame-based animations
- Feeding, training, resting, gates, and step tracking
- Procedurally generated Web Audio sound effects
- Three-pass QR breeding prototype
- Local save data and CRT-style power controls
- Responsive mobile and desktop presentation

## Run locally

The application requires the .NET 10 SDK.

```powershell
dotnet run
```

Open the local address printed by ASP.NET Core.

## GitHub Pages

The static client in `wwwroot` is deployed through the included GitHub Actions workflow. The ASP.NET Core host is used only for local development.

## Educational and unofficial status

This project explores interaction and game-design ideas associated with virtual pets, handheld creature games, collection RPGs, and progression fantasy. It is an original, unofficial prototype and is not affiliated with, endorsed by, or sponsored by Bandai, The Pokémon Company, Nintendo, Solo Leveling's rights holders, or their partners.

Referenced product and franchise names belong to their respective owners. No third-party character art, music, logos, or game assets are included.

## License

The original source code in this repository is available under the [MIT License](LICENSE). The prototype/educational description above explains the project's purpose; it does not replace or restrict the MIT license terms.
