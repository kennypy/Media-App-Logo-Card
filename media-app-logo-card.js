class MediaAppLogoCard extends HTMLElement {

  /**
   * Return the element for the visual editor
   */
  static getConfigElement() {
    return document.createElement('media-app-logo-card-editor');
  }

  /**
   * Return a stub configuration for the card picker
   */
  static getStubConfig() {
    return { entity: '' };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity is required");
    }
    this.config = {
      field: "source",       // default attribute to extract app name
      use_cdn_fallback: true,
      mappings: {},         // app name -> image map
      height: "120px",
      ...config
    };
  }

  async connectedCallback() {
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        .logo-card {
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${this.config.height};
          width: 100%;
        }
        img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
      </style>
      <div class="logo-card">
        <img id="logo" alt="${this.config.placeholder_alt || 'No media playing'}" role="img" />
      </div>
    `;
  }

  set hass(hass) {
    if (!this.shadowRoot) return;
    const logo = this.shadowRoot.getElementById("logo");
    
    const entity = hass.states[this.config.entity];
    if (!entity) {
      logo.alt = this.config.placeholder_alt || 'No media playing';
      logo.src = this.config.placeholder_image || '';
      return;
    }

    const raw = entity.attributes[this.config.field] || entity.state || "";
    const appName = raw.split('.').pop().toLowerCase().replace(/\s+/g, '');

    const mapped = this.config.mappings?.[appName];
    const mediaPath = `media-source://media/media-app-logos/${appName}.png`;
    const cdnPath = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/${appName}.svg`;

    let imageUrl = mapped || mediaPath;

    if (!mapped && this.config.use_cdn_fallback) {
      imageUrl = cdnPath;
    }

    logo.onerror = () => {
      // If the first image fails, try the CDN as a fallback if enabled
      if (imageUrl !== cdnPath && this.config.use_cdn_fallback) {
        logo.src = cdnPath;
      } else {
        // If it still fails, or no fallback, show placeholder
        logo.src = this.config.placeholder_image || '';
        logo.alt = this.config.placeholder_alt || `Logo for ${appName} not found`;
      }
    };
    logo.src = imageUrl;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define("media-app-logo-card", MediaAppLogoCard);

// Register in the Lovelace card picker with visual editor
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'media-app-logo-card',
  name: 'Media App Logo Card',
  preview: true,
  description: 'Displays a logo for the currently active app on any media_player',
  documentationURL: 'https:/%https://www.google.com/search?q=2Fgithub.com/kennypy/media-app-logo-card'
});