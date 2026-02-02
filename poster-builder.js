// Poster Builder - Main JavaScript
// Handles template selection, live preview, customization, and export

class PosterBuilder {
    constructor() {
        this.currentTemplate = null;
        this.currentData = {
            title: 'Your Title Here',
            subtitle: 'Subtitle text',
            image: '',
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            description: 'Your description goes here. Add details about your event or announcement.',
            button: 'Learn More'
        };
        this.customStyles = {
            bgColor: null,
            textColor: null,
            accentColor: null,
            fontFamily: null
        };
        this.favorites = JSON.parse(localStorage.getItem('poster_builder_favorites') || '[]');
        this.zoomLevel = 1;
        this.draggedElement = null;
        this.init();
    }

    init() {
        this.loadTemplates();
        this.attachEventListeners();
        this.loadSavedDesign();
    }

    // Load all templates into the grid
    loadTemplates(category = 'all') {
        const templateGrid = document.getElementById('template-grid');
        const allTemplates = getAllTemplates();

        let filteredTemplates = [];
        if (category === 'all') {
            filteredTemplates = allTemplates;
        } else if (category === 'favorites') {
            filteredTemplates = allTemplates.filter(t => this.favorites.includes(t.id));
        } else {
            filteredTemplates = allTemplates.filter(t => t.category === category);
        }

        templateGrid.innerHTML = '';

        if (category === 'favorites' && filteredTemplates.length === 0) {
            templateGrid.innerHTML = '<div style="padding: 20px; color: #999; text-align: center;">No favorites yet! Click the ❤️ on any template to add it here.</div>';
            return;
        }

        filteredTemplates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.dataset.templateId = template.id;

            const isFavorite = this.favorites.includes(template.id);

            card.innerHTML = `
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" title="Add to Favorites">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
                <div class="template-preview">
                    ${template.html}
                </div>
                <h4>${template.name}</h4>
                <span class="category-badge">${template.category}</span>
            `;

            // Inject template CSS for preview
            const styleTag = document.createElement('style');
            styleTag.textContent = template.css;
            card.querySelector('.template-preview').appendChild(styleTag);

            // Favorite button click
            card.querySelector('.favorite-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(template.id, e.currentTarget);
            });

            card.addEventListener('click', () => this.selectTemplate(template));
            templateGrid.appendChild(card);
        });
    }

    toggleFavorite(templateId, btn) {
        const index = this.favorites.indexOf(templateId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
        } else {
            this.favorites.push(templateId);
            btn.classList.add('active');
            btn.innerHTML = '❤️';
        }

        localStorage.setItem('poster_builder_favorites', JSON.stringify(this.favorites));

        // If we are in favorites view, refresh
        const activeTab = document.querySelector('.category-tab.active');
        if (activeTab && activeTab.dataset.category === 'favorites') {
            this.loadTemplates('favorites');
        }
    }

    // Select and render a template
    selectTemplate(template) {
        this.currentTemplate = template;

        // Update UI
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-template-id="${template.id}"]`)?.classList.add('selected');

        // Render template
        this.renderTemplate();
        this.initDragAndDrop();
    }

    // Render the selected template with current data
    renderTemplate() {
        if (!this.currentTemplate) return;

        const preview = document.getElementById('poster-preview');
        preview.innerHTML = this.currentTemplate.html;

        // Inject template CSS
        const existingStyles = preview.querySelectorAll('style');
        existingStyles.forEach(s => s.remove());

        const styleTag = document.createElement('style');
        styleTag.textContent = this.currentTemplate.css;
        preview.appendChild(styleTag);

        // Apply custom styles if any
        this.applyCustomStyles();

        // Update content
        this.updateContent();

        // Setup Drag and Drop
        this.initDragAndDrop();
    }

    // Drag and Drop Logic
    initDragAndDrop() {
        const preview = document.getElementById('poster-preview');
        const editables = preview.querySelectorAll('[data-editable]');

        editables.forEach(el => {
            el.setAttribute('draggable', 'true');

            el.addEventListener('dragstart', (e) => {
                this.draggedElement = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            el.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                this.draggedElement = null;
                const siblings = preview.querySelectorAll('.drag-over');
                siblings.forEach(s => s.classList.remove('drag-over'));
            });

            el.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const target = e.target.closest('[data-editable]');
                if (target && target !== this.draggedElement) {
                    target.classList.add('drag-over');
                }
            });

            el.addEventListener('dragleave', (e) => {
                const target = e.target.closest('[data-editable]');
                if (target) {
                    target.classList.remove('drag-over');
                }
            });

            el.addEventListener('drop', (e) => {
                e.preventDefault();
                const target = e.target.closest('[data-editable]');
                if (target && target !== this.draggedElement) {
                    const parent = target.parentNode;
                    const allChildren = Array.from(parent.children);
                    const draggedIndex = allChildren.indexOf(this.draggedElement);
                    const targetIndex = allChildren.indexOf(target);

                    if (draggedIndex < targetIndex) {
                        parent.insertBefore(this.draggedElement, target.nextSibling);
                    } else {
                        parent.insertBefore(this.draggedElement, target);
                    }
                }
                target.classList.remove('drag-over');
            });
        });
    }

    // Update content in the preview
    updateContent() {
        const preview = document.getElementById('poster-preview');

        // Update title
        const titleEl = preview.querySelector('[data-editable="title"]');
        if (titleEl) {
            titleEl.textContent = this.currentData.title;
            titleEl.style.display = document.getElementById('toggle-title').checked ? '' : 'none';
        }

        // Update subtitle
        const subtitleEl = preview.querySelector('[data-editable="subtitle"]');
        if (subtitleEl) {
            subtitleEl.textContent = this.currentData.subtitle;
            subtitleEl.style.display = document.getElementById('toggle-subtitle').checked ? '' : 'none';
        }

        // Update image
        const imageEl = preview.querySelector('[data-editable="image"]');
        if (imageEl && this.currentData.image) {
            imageEl.style.backgroundImage = `url(${this.currentData.image})`;
            imageEl.style.display = document.getElementById('toggle-image').checked ? '' : 'none';
        } else if (imageEl) {
            imageEl.style.display = document.getElementById('toggle-image').checked ? '' : 'none';
        }

        // Update date
        const dateEl = preview.querySelector('[data-editable="date"]');
        if (dateEl) {
            dateEl.textContent = this.currentData.date;
            dateEl.style.display = document.getElementById('toggle-date').checked ? '' : 'none';
        }

        // Update description
        const descEl = preview.querySelector('[data-editable="description"]');
        if (descEl) {
            descEl.textContent = this.currentData.description;
            descEl.style.display = document.getElementById('toggle-description').checked ? '' : 'none';
        }

        // Update button
        const buttonEl = preview.querySelector('[data-editable="button"]');
        if (buttonEl) {
            buttonEl.textContent = this.currentData.button;
            buttonEl.style.display = document.getElementById('toggle-button').checked ? '' : 'none';
        }
    }

    // Apply custom styles
    applyCustomStyles() {
        const preview = document.getElementById('poster-preview');
        const template = preview.querySelector('.poster-template');
        if (!template) return;

        if (this.customStyles.bgColor) {
            template.style.background = this.customStyles.bgColor;
        }

        if (this.customStyles.textColor) {
            template.style.color = this.customStyles.textColor;
            const textElements = template.querySelectorAll('.poster-title, .poster-subtitle, .poster-description, .poster-date');
            textElements.forEach(el => el.style.color = this.customStyles.textColor);
        }

        if (this.customStyles.accentColor) {
            const button = template.querySelector('.poster-button');
            if (button) button.style.background = this.customStyles.accentColor;
        }

        if (this.customStyles.fontFamily) {
            template.style.fontFamily = this.customStyles.fontFamily;
        }
    }

    // Attach all event listeners
    attachEventListeners() {
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.loadTemplates(e.target.dataset.category);
            });
        });

        // Panel tabs
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.panel).classList.add('active');
            });
        });

        // Content inputs
        document.getElementById('edit-title').addEventListener('input', (e) => {
            this.currentData.title = e.target.value;
            this.updateContent();
        });

        document.getElementById('edit-subtitle').addEventListener('input', (e) => {
            this.currentData.subtitle = e.target.value;
            this.updateContent();
        });

        document.getElementById('edit-date').addEventListener('input', (e) => {
            this.currentData.date = e.target.value;
            this.updateContent();
        });

        document.getElementById('edit-description').addEventListener('input', (e) => {
            this.currentData.description = e.target.value;
            this.updateContent();
        });

        document.getElementById('edit-button').addEventListener('input', (e) => {
            this.currentData.button = e.target.value;
            this.updateContent();
        });

        // Image upload
        document.getElementById('upload-image').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.currentData.image = event.target.result;
                    this.updateContent();
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('image-url').addEventListener('input', (e) => {
            this.currentData.image = e.target.value;
            this.updateContent();
        });

        // Toggle visibility
        ['title', 'subtitle', 'image', 'date', 'description', 'button'].forEach(field => {
            document.getElementById(`toggle-${field}`).addEventListener('change', () => {
                this.updateContent();
            });
        });

        // Style inputs
        document.getElementById('bg-color').addEventListener('input', (e) => {
            this.customStyles.bgColor = e.target.value;
            this.applyCustomStyles();
        });

        document.getElementById('text-color').addEventListener('input', (e) => {
            this.customStyles.textColor = e.target.value;
            this.applyCustomStyles();
        });

        document.getElementById('accent-color').addEventListener('input', (e) => {
            this.customStyles.accentColor = e.target.value;
            this.applyCustomStyles();
        });

        document.getElementById('font-family').addEventListener('change', (e) => {
            this.customStyles.fontFamily = e.target.value;
            this.applyCustomStyles();
        });

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoom(0.1));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoom(-0.1));

        // Export modal
        document.getElementById('export-menu-btn').addEventListener('click', () => {
            document.getElementById('export-modal').classList.add('active');
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('export-modal').classList.remove('active');
        });

        // Export buttons
        document.getElementById('export-png').addEventListener('click', () => this.exportPNG());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportPDF());
        document.getElementById('export-html').addEventListener('click', () => this.exportHTML());
        document.getElementById('export-json').addEventListener('click', () => this.exportJSON());

        // Save design
        document.getElementById('save-design-btn').addEventListener('click', () => this.saveDesign());

        // Search
        document.getElementById('template-search').addEventListener('input', (e) => {
            this.searchTemplates(e.target.value);
        });
    }

    // Zoom functionality
    zoom(delta) {
        this.zoomLevel = Math.max(0.5, Math.min(2, this.zoomLevel + delta));
        const preview = document.getElementById('poster-preview');
        preview.style.transform = `scale(${this.zoomLevel})`;
        document.getElementById('zoom-level').textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    // Search templates
    searchTemplates(query) {
        const cards = document.querySelectorAll('.template-card');
        cards.forEach(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            const category = card.querySelector('.category-badge').textContent.toLowerCase();
            if (name.includes(query.toLowerCase()) || category.includes(query.toLowerCase())) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Export as PNG
    async exportPNG() {
        const preview = document.getElementById('poster-preview');
        const canvas = await html2canvas(preview, {
            scale: 2,
            backgroundColor: '#ffffff'
        });

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `poster-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });

        document.getElementById('export-modal').classList.remove('active');
    }

    // Export as PDF
    async exportPDF() {
        const preview = document.getElementById('poster-preview');
        const canvas = await html2canvas(preview, {
            scale: 2,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`poster-${Date.now()}.pdf`);

        document.getElementById('export-modal').classList.remove('active');
    }

    // Export as HTML
    exportHTML() {
        if (!this.currentTemplate) {
            alert('Please select a template first');
            return;
        }

        const preview = document.getElementById('poster-preview');
        const html = preview.innerHTML;

        navigator.clipboard.writeText(html).then(() => {
            alert('✅ HTML code copied to clipboard!');
        });

        document.getElementById('export-modal').classList.remove('active');
    }

    // Export as JSON
    exportJSON() {
        const designData = {
            template: this.currentTemplate?.id,
            data: this.currentData,
            styles: this.customStyles,
            timestamp: new Date().toISOString()
        };

        const json = JSON.stringify(designData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `poster-design-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        document.getElementById('export-modal').classList.remove('active');
    }

    // Save design to localStorage
    saveDesign() {
        const designData = {
            template: this.currentTemplate?.id,
            data: this.currentData,
            styles: this.customStyles
        };

        localStorage.setItem('poster_builder_design', JSON.stringify(designData));
        alert('✅ Design saved successfully!');
    }

    // Load saved design
    loadSavedDesign() {
        const saved = localStorage.getItem('poster_builder_design');
        if (!saved) return;

        try {
            const designData = JSON.parse(saved);

            // Load template
            if (designData.template) {
                const template = getTemplateById(designData.template);
                if (template) {
                    this.selectTemplate(template);
                }
            }

            // Load data
            if (designData.data) {
                this.currentData = designData.data;

                // Update form fields
                document.getElementById('edit-title').value = this.currentData.title;
                document.getElementById('edit-subtitle').value = this.currentData.subtitle;
                document.getElementById('edit-date').value = this.currentData.date;
                document.getElementById('edit-description').value = this.currentData.description;
                document.getElementById('edit-button').value = this.currentData.button;
            }

            // Load styles
            if (designData.styles) {
                this.customStyles = designData.styles;
            }

            this.renderTemplate();
        } catch (error) {
            console.error('Error loading saved design:', error);
        }
    }
}

// Initialize the builder when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.posterBuilder = new PosterBuilder();
});
