/**
 * ELEMENTOR PRO - CORE ENGINE (ADVANCED)
 * Version 3.5.0 - With Advanced Properties Panel & JSON Control Engine
 */

class ControlManager {
    constructor(editor) {
        this.editor = editor;
    }

    render(control, value, widgetId) {
        const method = 'render_' + control.type;
        if (this[method]) {
            return this[method](control, value, widgetId);
        }
        return this.render_text(control, value, widgetId);
    }

    wrapper(control, content) {
        const responsiveToggle = control.responsive ?
            `<span class="e-responsive-toggle"><i class="ph-desktop"></i></span>` : '';

        return `
            <div class="e-control-wrapper" data-control="${control.name}" data-type="${control.type}">
                ${control.label ? `
                <div class="e-control-header">
                    <label class="e-control-label">${control.label}</label>
                    ${responsiveToggle}
                </div>` : ''}
                ${content}
            </div>
        `;
    }

    // --- CONTROLS IMPLEMENTATION ---

    render_text(c, v, id) {
        return this.wrapper(c, `<input type="text" class="e-input" value="${v || ''}" data-setting="${c.name}">`);
    }

    render_textarea(c, v, id) {
        return this.wrapper(c, `<textarea class="e-textarea" data-setting="${c.name}">${v || ''}</textarea>`);
    }

    render_number(c, v, id) {
        return this.wrapper(c, `<input type="number" class="e-input" value="${v || 0}" data-setting="${c.name}">`);
    }

    render_select(c, v, id) {
        const options = Object.keys(c.options).map(key =>
            `<option value="${key}" ${key == v ? 'selected' : ''}>${c.options[key]}</option>`
        ).join('');
        return this.wrapper(c, `<select class="e-select" data-setting="${c.name}">${options}</select>`);
    }

    render_color(c, v, id) {
        const color = v || '';
        return this.wrapper(c, `
            <div class="e-color-control">
                <div class="e-color-preview">
                    <div class="e-color-fill" style="background-color: ${color}"></div>
                    <input type="color" class="e-color-input-hidden" value="${color}" data-setting="${c.name}">
                </div>
                <input type="text" class="e-input" value="${color}" data-setting="${c.name}" placeholder="#HEX">
            </div>
        `);
    }

    render_slider(c, v, id) {
        const val = v ? v.size || v : (c.default ? c.default.size || c.default : 0);
        const unit = v ? v.unit || 'px' : 'px';

        return this.wrapper(c, `
            <div class="e-slider-control">
                <input type="range" min="${c.min || 0}" max="${c.max || 100}" value="${val}" class="e-range-input" data-setting="${c.name}" data-sub="size">
                <input type="number" class="e-number-input-small" value="${val}" data-setting="${c.name}" data-sub="size">
                <span style="font-size:10px; color:#666">${unit}</span>
            </div>
        `);
    }

    render_dimensions(c, v, id) {
        // v = { top, right, bottom, left, unit, isLinked }
        const val = v || { top: 0, right: 0, bottom: 0, left: 0, unit: 'px', isLinked: true };

        return this.wrapper(c, `
            <div class="e-dimensions-control">
                <div class="e-dim-item">
                    <input type="number" class="e-dim-input" value="${val.top}" data-setting="${c.name}" data-sub="top">
                    <div class="e-dim-label">Top</div>
                </div>
                <div class="e-dim-item">
                    <input type="number" class="e-dim-input" value="${val.right}" data-setting="${c.name}" data-sub="right">
                    <div class="e-dim-label">Right</div>
                </div>
                <div class="e-dim-item">
                    <input type="number" class="e-dim-input" value="${val.bottom}" data-setting="${c.name}" data-sub="bottom">
                    <div class="e-dim-label">Bottom</div>
                </div>
                <div class="e-dim-item">
                    <input type="number" class="e-dim-input" value="${val.left}" data-setting="${c.name}" data-sub="left">
                    <div class="e-dim-label">Left</div>
                </div>
                <button class="e-dim-link-btn ${val.isLinked ? 'active' : ''}" data-setting="${c.name}" data-sub="isLinked">
                    <i class="ph-link"></i>
                </button>
            </div>
        `);
    }

    render_choose(c, v, id) {
        // Button group choices like Alignment
        const options = c.options.map(opt => `
            <button class="e-btn-group-item ${v === opt.value ? 'active' : ''}" data-setting="${c.name}" data-value="${opt.value}" title="${opt.title}">
                <i class="${opt.icon}"></i>
            </button>
        `).join('');
        return this.wrapper(c, `<div class="e-btn-group" data-toggle-group="${c.name}">${options}</div>`);
    }

    render_media(c, v, id) {
        const src = v ? v.url : '';
        return this.wrapper(c, `
            <div class="e-media-picker">
                ${src ? `<img src="${src}" class="e-media-preview-img">` :
                `<div class="e-media-placeholder"><i class="ph-image"></i><span>Choose Image</span></div>`}
            </div>
        `);
    }
}

class StyleGenerator {
    static generate(settings) {
        let styles = {};

        // Helper to format dimensions
        const dimStr = (d) => {
            if (!d) return null;
            return `${d.top}${d.unit} ${d.right}${d.unit} ${d.bottom}${d.unit} ${d.left}${d.unit}`;
        };

        // Typography
        if (settings.typography_typography === 'custom') {
            if (settings.typography_font_size) styles['font-size'] = `${settings.typography_font_size.size}${settings.typography_font_size.unit}`;
            if (settings.typography_font_weight) styles['font-weight'] = settings.typography_font_weight;
            if (settings.typography_transform) styles['text-transform'] = settings.typography_transform;
        }

        // Colors
        if (settings.text_color) styles['color'] = settings.text_color;
        if (settings.background_color) styles['background-color'] = settings.background_color;

        // Dimensions
        if (settings.margin) styles['margin'] = dimStr(settings.margin);
        if (settings.padding) styles['padding'] = dimStr(settings.padding);

        // Alignment
        if (settings.align) {
            styles['text-align'] = settings.align;
            // Flex handling for alignment if needed
            if (settings.align === 'center') styles['justify-content'] = 'center';
        }

        // Object to string
        return Object.keys(styles).map(k => `${k}:${styles[k]}`).join(';');
    }
}

class ElementorEditor {
    constructor() {
        this.version = '3.5.0';
        this.widgets = new Map();
        this.state = {
            sections: [],
            selectedId: null,
            activeTab: 'content' // content | style | advanced
        };

        this.controlManager = new ControlManager(this);

        this.ui = {
            canvas: null,
            propPanel: null,
            propContent: null,
            elementsPanel: null,
            propTabs: null
        };
    }

    init() {
        console.log('🚀 Advanced Elementor Editor Starting...');
        this.cacheDOM();
        this.registerWidgets();
        this.bindEvents();
        this.loadState();
    }

    cacheDOM() {
        this.ui.canvas = document.getElementById('e-canvas');
        this.ui.propPanel = document.getElementById('panel-properties');
        this.ui.propContent = document.getElementById('e-properties-content');
        this.ui.elementsPanel = document.getElementById('panel-elements');
        this.ui.propTabs = document.querySelector('.e-properties-tabs');
    }

    registerWidgets() {
        // --- 1. HEADING ---
        this.registerWidget('heading', {
            label: 'Heading', icon: 'ph-text-h', category: 'Basic',
            controls: {
                content: [
                    {
                        type: 'section', label: 'Title',
                        controls: [
                            { name: 'text', label: 'Title', type: 'textarea', default: 'Add Your Heading Text Here' },
                            { name: 'link', label: 'Link', type: 'text', placeholder: 'https://your-link.com' },
                            { name: 'size', label: 'Size', type: 'select', options: { 'small': 'Small', 'medium': 'Medium', 'large': 'Large', 'xl': 'XL' }, default: 'default' },
                            { name: 'tag', label: 'HTML Tag', type: 'select', options: { 'h1': 'H1', 'h2': 'H2', 'h3': 'H3', 'h4': 'H4', 'div': 'div' }, default: 'h2' },
                            {
                                name: 'align', label: 'Alignment', type: 'choose',
                                options: [
                                    { title: 'Left', icon: 'ph-text-align-left', value: 'left' },
                                    { title: 'Center', icon: 'ph-text-align-center', value: 'center' },
                                    { title: 'Right', icon: 'ph-text-align-right', value: 'right' },
                                    { title: 'Justify', icon: 'ph-text-align-justify', value: 'justify' }
                                ]
                            }
                        ]
                    }
                ],
                style: [
                    {
                        type: 'section', label: 'Text Color',
                        controls: [
                            { name: 'text_color', label: 'Text Color', type: 'color', default: '#333333' },
                            { name: 'typography', label: 'Typography', type: 'typography', default: '' } // TODO implement complex
                        ]
                    }
                ],
                advanced: [
                    {
                        type: 'section', label: 'Layout',
                        controls: [
                            { name: 'margin', label: 'Margin', type: 'dimensions' },
                            { name: 'padding', label: 'Padding', type: 'dimensions' },
                            { name: 'z_index', label: 'Z-Index', type: 'number' },
                            { name: 'css_classes', label: 'CSS Classes', type: 'text' }
                        ]
                    }
                ]
            },
            render: (settings) => {
                const tag = settings.tag || 'h2';
                const style = StyleGenerator.generate(settings);
                return `<${tag} style="${style}">${settings.text}</${tag}>`;
            }
        });

        // --- 2. BUTTON ---
        this.registerWidget('button', {
            label: 'Button', icon: 'ph-cursor-click', category: 'Basic',
            controls: {
                content: [
                    {
                        type: 'section', label: 'Button',
                        controls: [
                            { name: 'text', label: 'Text', type: 'text', default: 'Click me' },
                            { name: 'link', label: 'Link', type: 'text', default: '#' },
                            {
                                name: 'align', label: 'Alignment', type: 'choose',
                                options: [
                                    { title: 'Left', icon: 'ph-text-align-left', value: 'left' },
                                    { title: 'Center', icon: 'ph-text-align-center', value: 'center' },
                                    { title: 'Right', icon: 'ph-text-align-right', value: 'right' },
                                    { title: 'Justify', icon: 'ph-justify', value: 'justify' }
                                ],
                                default: 'left'
                            }
                        ]
                    }
                ],
                style: [
                    {
                        type: 'section', label: 'Typography', controls: [{ name: 'typography', type: 'typography' }]
                    },
                    {
                        type: 'section', label: 'Color',
                        controls: [
                            { name: 'text_color', label: 'Text Color', type: 'color', default: '#fff' },
                            { name: 'background_color', label: 'Background Color', type: 'color', default: '#61ce70' }
                        ]
                    },
                    {
                        type: 'section', label: 'Border',
                        controls: [
                            { name: 'border_radius', label: 'Border Radius', type: 'dimensions' }
                        ]
                    }
                ],
                advanced: [
                    {
                        type: 'section', label: 'Layout',
                        controls: [
                            { name: 'margin', label: 'Margin', type: 'dimensions' },
                            { name: 'padding', label: 'Padding', type: 'dimensions' }
                        ]
                    }
                ]
            },
            render: (settings) => {
                const style = StyleGenerator.generate(settings);
                return `<div style="text-align:${settings.align}"><a href="${settings.link}" class="elementor-button" style="display:inline-block; padding:12px 24px; text-decoration:none; ${style}">${settings.text}</a></div>`;
            }
        });

        // --- 3. SECTION (Internal) ---
        // Basic section support for state structure
        this.renderWidgetsList();
    }

    registerWidget(slug, config) {
        this.widgets.set(slug, { ...config, slug });
    }

    renderWidgetsList() {
        const categories = {};
        this.widgets.forEach(widget => {
            if (!categories[widget.category]) categories[widget.category] = [];
            categories[widget.category].push(widget);
        });

        this.ui.elementsPanel.querySelector('.e-widgets-list').innerHTML = Object.keys(categories).map(cat => `
            <div class="e-widget-group-title">${cat}</div>
            ${categories[cat].map(w => `
                <div class="e-widget-item" draggable="true" data-widget="${w.slug}">
                    <i class="ph ${w.icon}"></i>
                    <span>${w.label}</span>
                </div>
            `).join('')}
        `).join('');

        // Bind DnD
        document.querySelectorAll('.e-widget-item').forEach(el => {
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('plugin/widget', el.dataset.widget);
            });
        });
    }

    // --- RENDER & LOGIC ---

    renderCanvas() {
        const container = this.ui.canvas;
        container.innerHTML = '';

        // --- RENDERING TREE ---
        // Simply re-using structure from previous step but adapting to new widget.render()

        if (this.state.sections.length === 0) {
            container.innerHTML = `<div class="e-empty-canvas-state"><div class="e-add-section-box"><button onclick="window.ElementorPro.addSection()" class="e-add-new-section"><i class="ph-bold ph-plus"></i></button></div></div>`;
            return;
        }

        this.state.sections.forEach((section, sIdx) => {
            const sectEl = document.createElement('div');
            sectEl.className = 'elementor-section';
            // Render columns
            section.columns.forEach((col, cIdx) => {
                const colEl = document.createElement('div');
                colEl.style.cssText = `flex:1; padding:10px; border:1px dashed rgba(255,255,255,0.1); width:${col.width || '100%'}`;

                this.bindDroppable(colEl, sIdx, cIdx);

                col.widgets.forEach((widget, wIdx) => {
                    const cfg = this.widgets.get(widget.type);
                    if (cfg) {
                        const wEl = document.createElement('div');
                        wEl.className = 'elementor-widget-wrap';
                        if (this.state.selectedId === widget.id) wEl.classList.add('active'); // active outline
                        wEl.innerHTML = cfg.render(widget.settings);
                        wEl.onclick = (e) => { e.stopPropagation(); this.selectWidget(widget.id, sIdx, cIdx, wIdx); };
                        colEl.appendChild(wEl);
                    }
                });
                sectEl.appendChild(colEl);
            });
            container.appendChild(sectEl);
        });
    }

    bindDroppable(el, sIdx, cIdx) {
        el.addEventListener('dragover', e => e.preventDefault());
        el.addEventListener('drop', e => {
            e.preventDefault();
            const type = e.dataTransfer.getData('plugin/widget');
            if (type) this.addWidget(type, sIdx, cIdx);
        });
    }

    addWidget(type, sIdx, cIdx) {
        // Hydrate defaults
        const config = this.widgets.get(type);
        const settings = {};

        // Recursively find defaults
        ['content', 'style', 'advanced'].forEach(tab => {
            if (config.controls[tab]) {
                config.controls[tab].forEach(sec => {
                    sec.controls.forEach(ctrl => {
                        if (ctrl.default !== undefined) settings[ctrl.name] = ctrl.default;
                    });
                });
            }
        });

        const newWidget = { id: 'w_' + Date.now(), type, settings };
        this.state.sections[sIdx].columns[cIdx].widgets.push(newWidget);
        this.renderCanvas();
        this.selectWidget(newWidget.id, sIdx, cIdx, this.state.sections[sIdx].columns[cIdx].widgets.length - 1);
    }

    addSection() {
        this.state.sections.push({ id: 's_' + Date.now(), columns: [{ id: 'c_' + Date.now(), widgets: [] }] });
        this.renderCanvas();
    }

    selectWidget(id, sIdx, cIdx, wIdx) {
        this.state.selectedId = id;
        this.state.selection = { sIdx, cIdx, wIdx };
        const widget = this.state.sections[sIdx].columns[cIdx].widgets[wIdx];
        const config = this.widgets.get(widget.type);
        this.renderProperties(widget, config);

        // Switch Panels
        this.ui.elementsPanel.classList.remove('active');
        this.ui.propPanel.classList.add('active');
        this.renderCanvas(); // Redraw to show selection outline
    }

    renderProperties(widget, config) {
        // Update Title
        document.getElementById('e-editing-label').innerText = 'Edit ' + config.label;

        // Render current Tab
        this.updatePropTabs(widget, config);
    }

    updatePropTabs(widget, config) {
        // Bind Tab Clicks
        const tabs = this.ui.propTabs.querySelectorAll('button');
        tabs.forEach(btn => {
            btn.onclick = () => {
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.activeTab = btn.dataset.propTab;
                this.renderActiveTabContent(widget, config);
            };
        });

        // Trigger render
        this.renderActiveTabContent(widget, config);
    }

    renderActiveTabContent(widget, config) {
        const tabName = this.state.activeTab;
        const sections = config.controls[tabName] || [];
        const container = this.ui.propContent;
        container.innerHTML = '';

        sections.forEach(sec => {
            // Render Section Accordion
            const sectionEl = document.createElement('div');
            sectionEl.className = 'e-control-section open'; // Default open for now
            sectionEl.innerHTML = `
                <div class="e-section-title">${sec.label} <i class="ph-caret-down"></i></div>
                <div class="e-section-content"></div>
            `;

            // Toggle Logic
            sectionEl.querySelector('.e-section-title').onclick = () => sectionEl.classList.toggle('open');

            const contentDiv = sectionEl.querySelector('.e-section-content');

            // Render Controls inside Section
            sec.controls.forEach(ctrl => {
                const markup = this.controlManager.render(ctrl, widget.settings[ctrl.name], widget.id);
                // Convert string to node
                const temp = document.createElement('div');
                temp.innerHTML = markup;
                const controlNode = temp.firstElementChild;
                contentDiv.appendChild(controlNode);

                // Bind Events
                this.bindControlEvent(controlNode, widget, ctrl);
            });

            container.appendChild(sectionEl);
        });
    }

    bindControlEvent(node, widget, ctrl) {
        const inputs = node.querySelectorAll('input, select, textarea, button[data-value]');

        inputs.forEach(input => {
            const eventName = (input.type === 'text' || input.type === 'number' || input.tagName === 'TEXTAREA') ? 'input' : 'change';

            // Setup listener
            const listener = (e) => {
                let val = e.target.value;

                // Special handlers
                if (ctrl.type === 'dimensions') {
                    // Update composite object
                    const current = widget.settings[ctrl.name] || { top: 0, right: 0, bottom: 0, left: 0, unit: 'px', isLinked: true };
                    const sub = e.target.dataset.sub;
                    if (sub === 'isLinked') {
                        // Toggle link logic
                        return; // TODO link logic
                    }
                    current[sub] = val;
                    val = current;
                }
                else if (ctrl.type === 'choose') {
                    // Button group
                    val = e.target.dataset.value;
                    // UI Update
                    node.querySelectorAll('.e-btn-group-item').forEach(b => b.classList.remove('active'));
                    e.target.closest('.e-btn-group-item').classList.add('active');
                }

                // Update Model
                widget.settings[ctrl.name] = val;
                this.renderCanvas(); // Live Update
            };

            if (input.tagName === 'BUTTON') {
                input.onclick = listener;
            } else {
                input.addEventListener(eventName, listener);
            }
        });
    }

    loadState() {
        // ... (Keep existing load logic)
        const saved = localStorage.getItem('e_page_state');
        if (saved) {
            try { this.state.sections = JSON.parse(saved); this.renderCanvas(); } catch (e) { }
        }
    }
}

window.ElementorPro = new ElementorEditor();
export default window.ElementorPro;
