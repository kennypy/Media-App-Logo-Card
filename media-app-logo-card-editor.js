class MediaAppLogoCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot) this._render();
  }

  _render() {
    this.attachShadow({ mode: "open" });
    const root = this.shadowRoot;

    root.innerHTML = `
      <style>
        .editor {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .section {
          border: 1px solid var(--divider-color);
          padding: 12px;
          border-radius: 4px;
        }
        .section-header {
          font-weight: bold;
          margin-bottom: 8px;
        }
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
        }
        label {
          display: block;
          margin-bottom: 4px;
        }
        input, select, textarea {
          width: 100%;
          box-sizing: border-box;
        }
      </style>
      <div class="editor">
        <div>
          <label for="entity">Entity (Required)</label>
          <ha-entity-picker id="entity"
            .hass=${this._hass}
            .value=${this._config.entity || ""}
            include-domains='["media_player"]'
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <div>
          <label for="field">App Name Field</label>
          <select id="field">
            <option value="source">source</option>
            <option value="app_id">app_id</option>
            <option value="media_title">media_title</option>
          </select>
        </div>

        <div class="section">
          <div class="section-header">Default Platform Logos</div>
          <div class="checkbox-grid">
            <label><input type="checkbox" class="platform-toggle" value="netflix"> Netflix</label>
            <label><input type="checkbox" class="platform-toggle" value="youtube"> YouTube</label>
            <label><input type="checkbox" class="platform-toggle" value="spotify"> Spotify</label>
            <label><input type="checkbox" class="platform-toggle" value="disney+"> Disney+</label>
          </div>
          <p style="font-size: 12px; color: var(--secondary-text-color);">Select to auto-add logos from <a href="https://dashboardicons.com/icons" target="_blank">dashboardicons.com</a>. This will add to the mappings below.</p>
        </div>
        
        <div>
          <label for="mappings">Custom Mappings (app → image URL)</label>
          <textarea id="mappings" rows="5" placeholder="e.g.\nnetflix: /local/logos/netflix.png\nplex: /local/logos/plex.png"></textarea>
        </div>
        
        <label>
          <input type="checkbox" id="cdn_fallback" /> Use CDN fallback for non-mapped apps
        </label>
        
        <div>
          <label for="placeholder_image">Placeholder Image URL</label>
          <input id="placeholder_image" type="text" />
        </div>
        
        <div>
          <label for="placeholder_alt">Placeholder Alt Text</label>
          <input id="placeholder_alt" type="text" />
        </div>
      </div>
    `;

    // --- Entity Picker ---
    const entityPicker = root.getElementById("entity");
    entityPicker.addEventListener("value-changed", e => this._update('entity', e.detail.value));

    // --- Field Selector ---
    const select = root.getElementById("field");
    select.value = this._config.field || "source";
    select.addEventListener("change", () => this._update("field", select.value));

    // --- CDN Fallback ---
    const cdn = root.getElementById("cdn_fallback");
    cdn.checked = this._config.use_cdn_fallback ?? true;
    cdn.addEventListener("change", () => this._update("use_cdn_fallback", cdn.checked));
    
    // --- Placeholders ---
    const placeholderImage = root.getElementById("placeholder_image");
    placeholderImage.value = this._config.placeholder_image || '';
    placeholderImage.addEventListener("change", e => this._update('placeholder_image', e.target.value));

    const placeholderAlt = root.getElementById("placeholder_alt");
    placeholderAlt.value = this._config.placeholder_alt || 'No media playing';
    placeholderAlt.addEventListener("change", e => this._update('placeholder_alt', e.target.value));

    // --- Platform Toggles ---
    const platformToggles = root.querySelectorAll(".platform-toggle");
    const defaultPlatforms = new Set(this._config.default_platforms || []);
    platformToggles.forEach(checkbox => {
      checkbox.checked = defaultPlatforms.has(checkbox.value);
      checkbox.addEventListener("change", e => this._togglePlatform(e.target.value, e.target.checked));
    });

    // --- Mappings Text Area ---
    this._mapInput = root.getElementById("mappings");
    this._updateMappingsUI(); // Initial population
    this._mapInput.addEventListener("change", () => {
      const lines = this._mapInput.value.split("\n");
      const obj = {};
      for (const line of lines) {
        const [k, v] = line.split(/:(.*)/s).map(x => x?.trim()); // Split only on the first colon
        if (k && v) obj[k.toLowerCase()] = v;
      }
      this._config.mappings = obj; // Directly update config before dispatch
      this._update("mappings", obj);
    });
  }

  _update(key, value) {
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config } }));
  }

  _togglePlatform(platform, checked) {
    this._config.default_platforms = Array.isArray(this._config.default_platforms) ? this._config.default_platforms : [];
    this._config.mappings = this._config.mappings || {};
    
    const arr = new Set(this._config.default_platforms);
    if (checked) {
      arr.add(platform);
      this._config.mappings[platform] = `https://cdn.jsdelivr.net/gh/dashboard-icons/dashboard-icons/png/${platform}.png`;
    } else {
      arr.delete(platform);
      delete this._config.mappings[platform];
    }
    this._config.default_platforms = Array.from(arr);
    this._updateMappingsUI();
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }
    }));
  }

  _updateMappingsUI() {
    if (this._config.mappings) {
      const mapStr = Object.entries(this._config.mappings).map(([k, v]) => `${k}: ${v}`).join("\n");
      this._mapInput.value = mapStr;
    }
  }
}

customElements.define("media-app-logo-card-editor", MediaAppLogoCardEditor);