# Media App Logo Card

A Home Assistant Lovelace card that displays the native logo of the currently playing media app.

## Features

- Automatic logo based on media_player attributes (source, app_id, media_title)
- CDN fallback for missing logos
- Custom mappings for proprietary apps
- Placeholder image and text support
- Configuration validation and defaults

## Installation

### HACS

1. Add this repository to HACS under Frontend.
2. Install "Media App Logo Card".
3. Restart Home Assistant.
4. Add the card to your dashboard.

### Manual

1. Copy the folder `media-app-logo-card` to your `config/www/community` directory.
2. Add the following to your Lovelace resources:
\`\`\`yaml
resources:
  - url: /community_media/media-app-logo-card/media-app-logo-card.js
    type: module
\`\`\`
3. Restart Home Assistant.

## Usage

\`\`\`yaml
type: custom:media-app-logo-card
entity: media_player.living_room
field: source                # optional, default: source
use_cdn_fallback: true       # optional, default: true
mappings:
  netflix: /local/netflix.png
height: "100px"              # optional, default: 120px
placeholder_image: /local/blank.png  # optional
placeholder_alt: "No media"  # optional
\`\`\`

## Editor

<details>
<summary>Editor component</summary>

Uses the \`media-app-logo-card-editor\` custom element for the Lovelace UI editor.

</details>

## Development

\`\`\`bash
npm install
npm run build
\`\`\`

## License

MIT
