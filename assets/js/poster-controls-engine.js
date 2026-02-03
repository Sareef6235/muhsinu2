/**
 * Poster Control Engine
 * An Elementor-style property manager for the Poster Builder
 */
class PosterControlEngine {
    constructor(builder) {
        this.builder = builder;
        this.container = document.getElementById('active-properties');
        this.activeTab = 'content';
    }

    render(element) {
        if (!element) return;
        this.activeElement = element;
        this.container.style.display = 'block';

        const type = element.getAttribute('data-editable') || 'general';
        const config = this.getWidgetConfig(type, element);

        this.container.innerHTML = `
            <div class="panel-top-bar">
                <div class="panel-widget-info">
                    <i class="ph ph-cube"></i>
                    <span>${type.toUpperCase()}</span>
                </div>
                <div class="responsive-toggles">
                    <button class="active"><i class="ph ph-desktop"></i></button>
                    <button><i class="ph ph-tablet"></i></button>
                    <button><i class="ph ph-device-mobile"></i></button>
                </div>
                <div class="panel-actions">
                    <button onclick="builder.deselectElement()"><i class="ph ph-x"></i></button>
                </div>
            </div>
            <div class="panel-tabs">
                <button class="panel-tab-btn ${this.activeTab === 'content' ? 'active' : ''}" data-tab="content">Content</button>
                <button class="panel-tab-btn ${this.activeTab === 'style' ? 'active' : ''}" data-tab="style">Style</button>
                <button class="panel-tab-btn ${this.activeTab === 'advanced' ? 'active' : ''}" data-tab="advanced">Advanced</button>
            </div>
            <div class="panel-search">
                <div class="search-wrap">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" placeholder="Search controls..." id="ctrl-search">
                </div>
            </div>
            <div class="panel-control-content">
                ${this.renderActiveTab(config)}
            </div>
        `;

        this.bindEvents(config);
    }

    getWidgetConfig(type, element) {
        // Base controls for all elements
        const baseAdvanced = [
            {
                title: 'Layout',
                controls: [
                    { type: 'slider', id: 'opacity', label: 'Opacity', property: 'opacity', min: 0, max: 1, step: 0.1, default: 1 },
                    { type: 'slider', id: 'z-index', label: 'Z-Index', property: 'zIndex', min: 0, max: 100, step: 1, default: 1 },
                    { type: 'select', id: 'position', label: 'Position', property: 'position', options: ['absolute', 'relative', 'static'] },
                    { type: 'dimension', id: 'margin', label: 'Margin', property: 'margin' },
                    { type: 'dimension', id: 'padding', label: 'Padding', property: 'padding' }
                ]
            },
            {
                title: 'Motion Effects',
                controls: [
                    { type: 'select', id: 'entrance_anim', label: 'Entrance Animation', options: ['none', 'fadeUp', 'fadeIn', 'zoomIn', 'slideLeft'] },
                    { type: 'slider', id: 'anim_delay', label: 'Delay (ms)', min: 0, max: 2000, step: 100 }
                ]
            }
        ];

        const configs = {
            heading: {
                content: [
                    {
                        title: 'Title',
                        controls: [
                            { type: 'textarea', id: 'text', label: 'Title Text', property: 'innerText' },
                            { type: 'select', id: 'tag', label: 'HTML Tag', property: 'tagName', options: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN'] },
                            { type: 'alignment', id: 'text-align', label: 'Alignment', property: 'textAlign' }
                        ]
                    }
                ],
                style: [
                    {
                        title: 'Typography',
                        controls: [
                            { type: 'color', id: 'color', label: 'Color', property: 'color' },
                            { type: 'slider', id: 'font-size', label: 'Size', property: 'fontSize', min: 10, max: 300, unit: 'px' },
                            { type: 'select', id: 'font-weight', label: 'Weight', property: 'fontWeight', options: ['100', '300', '400', '600', '700', '900'] },
                            { type: 'select', id: 'font-family', label: 'Family', property: 'fontFamily', options: ['Inter', 'Amiri', 'Cairo', 'Poppins', 'Outfit'] },
                            { type: 'slider', id: 'line-height', label: 'Line Height', property: 'lineHeight', min: 0.5, max: 3, step: 0.1 },
                            { type: 'slider', id: 'letter-spacing', label: 'Letter Spacing', property: 'letterSpacing', min: -5, max: 20, unit: 'px' }
                        ]
                    },
                    {
                        title: 'Text Effects',
                        controls: [
                            { type: 'toggle', id: 'text-glow', label: 'Text Glow' },
                            { type: 'slider', id: 'blur', label: 'Text Blur', property: 'filter', unit: 'px', transform: (v) => `blur(${v}px)` }
                        ]
                    }
                ],
                advanced: baseAdvanced
            },
            image: {
                content: [
                    {
                        title: 'Image',
                        controls: [
                            { type: 'media', id: 'source', label: 'Choose Image' },
                            { type: 'select', id: 'object-fit', label: 'Object Fit', property: 'objectFit', options: ['cover', 'contain', 'fill'] }
                        ]
                    }
                ],
                style: [
                    {
                        title: 'Dimensions',
                        controls: [
                            { type: 'slider', id: 'width', label: 'Width', property: 'width', min: 10, max: 800, unit: 'px' },
                            { type: 'slider', id: 'height', label: 'Height', property: 'height', min: 10, max: 800, unit: 'px' }
                        ]
                    },
                    {
                        title: 'Border',
                        controls: [
                            { type: 'slider', id: 'border-radius', label: 'Border Radius', property: 'borderRadius', min: 0, max: 100, unit: 'px' },
                            { type: 'color', id: 'border-color', label: 'Border Color', property: 'borderColor' },
                            { type: 'slider', id: 'border-width', label: 'Width', property: 'borderWidth', min: 0, max: 20, unit: 'px' }
                        ]
                    }
                ],
                advanced: baseAdvanced
            },
            shape: {
                content: [
                    {
                        title: 'Shape',
                        controls: [
                            { type: 'select', id: 'shape-type', label: 'Type', options: ['Rectangle', 'Circle', 'Triangle'] }
                        ]
                    }
                ],
                style: [
                    {
                        title: 'Visual',
                        controls: [
                            { type: 'color', id: 'bg-color', label: 'Background', property: 'backgroundColor' },
                            { type: 'slider', id: 'width', label: 'Width', property: 'width', min: 1, max: 1000, unit: 'px' },
                            { type: 'slider', id: 'height', label: 'Height', property: 'height', min: 1, max: 1000, unit: 'px' },
                            { type: 'slider', id: 'border-radius', label: 'Radius', property: 'borderRadius', min: 0, max: 500, unit: 'px' }
                        ]
                    }
                ],
                advanced: baseAdvanced
            }
        };

        return configs[type] || configs['heading'];
    }

    renderActiveTab(config) {
        const sections = config[this.activeTab] || [];
        return sections.map(section => `
            <div class="control-section">
                <div class="control-section-header">
                    <span>${section.title}</span>
                    <i class="ph ph-caret-down"></i>
                </div>
                <div class="control-section-body">
                    ${section.controls.map(c => this.renderControl(c)).join('')}
                </div>
            </div>
        `).join('');
    }

    renderControl(c) {
        const value = this.getControlValue(c);
        let controlHtml = '';

        switch (c.type) {
            case 'textarea':
                controlHtml = `<textarea data-id="${c.id}" class="ctrl-input">${value}</textarea>`;
                break;
            case 'slider':
                controlHtml = `
                    <div class="ctrl-slider-wrap">
                        <input type="range" data-id="${c.id}" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${parseFloat(value) || c.default || 0}" class="ctrl-range">
                        <input type="number" value="${parseFloat(value) || 0}" class="ctrl-number-input">
                    </div>
                `;
                break;
            case 'color':
                controlHtml = `
                    <div class="ctrl-color-wrap">
                        <input type="color" data-id="${c.id}" value="${this.rgbToHex(value)}" class="ctrl-color">
                        <span class="color-code">${this.rgbToHex(value)}</span>
                    </div>
                `;
                break;
            case 'select':
                controlHtml = `
                    <select data-id="${c.id}" class="ctrl-select">
                        ${c.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                `;
                break;
            case 'alignment':
                controlHtml = `
                    <div class="ctrl-align-group" data-id="${c.id}">
                        <button class="${value === 'left' ? 'active' : ''}" data-val="left"><i class="ph ph-text-align-left"></i></button>
                        <button class="${value === 'center' ? 'active' : ''}" data-val="center"><i class="ph ph-text-align-center"></i></button>
                        <button class="${value === 'right' ? 'active' : ''}" data-val="right"><i class="ph ph-text-align-right"></i></button>
                        <button class="${value === 'justify' ? 'active' : ''}" data-val="justify"><i class="ph ph-text-align-justify"></i></button>
                    </div>
                `;
                break;
            case 'dimension':
                controlHtml = `
                    <div class="ctrl-dimension-group" data-id="${c.id}">
                        <div class="dim-input"><input type="number" value="0" placeholder="0"><span>Top</span></div>
                        <div class="dim-input"><input type="number" value="0" placeholder="0"><span>Right</span></div>
                        <div class="dim-input"><input type="number" value="0" placeholder="0"><span>Bottom</span></div>
                        <div class="dim-input"><input type="number" value="0" placeholder="0"><span>Left</span></div>
                        <button class="dim-link active" title="Link Values"><i class="ph ph-link"></i></button>
                    </div>
                `;
                break;
            case 'toggle':
                controlHtml = `
                    <label class="ctrl-switch">
                        <input type="checkbox" data-id="${c.id}" ${value && value !== 'none' ? 'checked' : ''}>
                        <span class="ctrl-slider"></span>
                    </label>
                `;
                break;
            case 'media':
                controlHtml = `
                    <div class="ctrl-media-picker">
                        <div class="media-preview" style="background-image: url(${this.activeElement?.src || ''})"></div>
                        <button class="ctrl-media-btn" onclick="builder.triggerImageUpload()"><i class="ph ph-image"></i> Choose Image</button>
                    </div>
                `;
                break;
        }

        return `
            <div class="control-item" data-type="${c.type}">
                <div class="control-label">
                    <label>${c.label}</label>
                    <button class="control-reset" title="Reset"><i class="ph ph-arrow-counter-clockwise"></i></button>
                </div>
                <div class="control-input-wrap">
                    ${controlHtml}
                </div>
            </div>
        `;
    }

    getControlValue(c) {
        if (!this.activeElement) return '';
        if (c.property === 'innerText') return this.activeElement.innerText;
        if (c.property === 'tagName') return this.activeElement.tagName;

        const style = window.getComputedStyle(this.activeElement);
        return style[c.property] || '';
    }

    bindEvents(config) {
        // Tab switching
        this.container.querySelectorAll('.panel-tab-btn').forEach(btn => {
            btn.onclick = () => {
                this.activeTab = btn.dataset.tab;
                this.render(this.activeElement);
            };
        });

        // Search filtering
        const searchInput = this.container.querySelector('#ctrl-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const term = e.target.value.toLowerCase();
                this.container.querySelectorAll('.control-item').forEach(item => {
                    const label = item.querySelector('label').innerText.toLowerCase();
                    const isMatch = label.includes(term);
                    item.style.display = isMatch ? 'block' : 'none';

                    // Also hide section if no controls match
                    const section = item.closest('.control-section');
                    const visibleItems = section.querySelectorAll('.control-item:not([style*="display: none"])');
                    section.style.display = visibleItems.length > 0 ? 'block' : 'none';
                });
            };
        }

        // Responsive Toggles
        this.container.querySelectorAll('.responsive-toggles button').forEach(btn => {
            btn.onclick = () => {
                this.container.querySelectorAll('.responsive-toggles button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Canvas preview class logic could go here
                const canvas = document.getElementById('poster-canvas');
                if (canvas) {
                    canvas.className = 'poster-canvas ' + (btn.children[0].className.includes('tablet') ? 'preview-tablet' : btn.children[0].className.includes('mobile') ? 'preview-mobile' : '');
                }
            };
        });

        // Control sections collapsing
        this.container.querySelectorAll('.control-section-header').forEach(header => {
            header.onclick = () => {
                header.parentElement.classList.toggle('collapsed');
            };
        });

        // Control inputs
        const currentConfig = config[this.activeTab] || [];
        const allControls = currentConfig.flatMap(s => s.controls);

        allControls.forEach(c => {
            const wrap = this.container.querySelector(`.control-item[data-type="${c.type}"]`);
            const input = this.container.querySelector(`[data-id="${c.id}"]`);
            if (!input) return;

            const updateFn = (val) => {
                if (c.property === 'innerText') {
                    this.activeElement.innerText = val;
                } else if (c.property === 'tagName') {
                    // Tag change requires replacing the element
                    this.replaceTagName(this.activeElement, val.toLowerCase());
                } else if (c.id === 'text-glow') {
                    this.activeElement.style.textShadow = val ? '0 0 20px rgba(0,243,255,0.8)' : 'none';
                } else {
                    let finalVal = val;
                    if (c.transform) finalVal = c.transform(val);
                    else if (c.unit) finalVal += c.unit;
                    this.activeElement.style[c.property] = finalVal;
                }

                // Sync number input with range
                if (c.type === 'slider') {
                    const numInput = input.parentElement.querySelector('.ctrl-number-input');
                    if (numInput) numInput.value = val;
                }

                // Sync color code
                if (c.type === 'color') {
                    const code = input.parentElement.querySelector('.color-code');
                    if (code) code.innerText = val.toUpperCase();
                }
            };

            // Reset logic
            const resetBtn = wrap?.querySelector('.control-reset');
            if (resetBtn) {
                resetBtn.onclick = () => {
                    // Simplified reset to default
                    if (c.default !== undefined) updateFn(c.default);
                    else this.activeElement.style[c.property] = '';
                    this.render(this.activeElement);
                };
            }

            if (c.type === 'alignment') {
                input.querySelectorAll('button').forEach(btn => {
                    btn.onclick = () => {
                        input.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        updateFn(btn.dataset.val);
                    }
                });
            } else if (c.type === 'slider') {
                input.oninput = (e) => updateFn(e.target.value);
                const numInput = input.parentElement.querySelector('.ctrl-number-input');
                if (numInput) numInput.oninput = (e) => {
                    input.value = e.target.value;
                    updateFn(e.target.value);
                };
            } else {
                input.oninput = (e) => {
                    const val = c.type === 'toggle' ? e.target.checked : e.target.value;
                    updateFn(val);
                };
                input.onchange = () => this.builder.pushHistory();
            }
        });
    }

    replaceTagName(el, newTag) {
        const replacement = document.createElement(newTag);
        // Copy all attributes
        for (let i = 0; i < el.attributes.length; i++) {
            replacement.setAttribute(el.attributes[i].name, el.attributes[i].value);
        }
        replacement.innerHTML = el.innerHTML;
        replacement.style.cssText = el.style.cssText;
        el.parentNode.replaceChild(replacement, el);
        this.activeElement = replacement;
        this.builder.activeElement = replacement;
        this.builder.makeDraggable(replacement);
        this.builder.createHandles(replacement);
    }


    rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return rgb || '#ffffff';
        const res = rgb.match(/\d+/g);
        return res ? "#" + res.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, "0")).join("") : "#ffffff";
    }
}
