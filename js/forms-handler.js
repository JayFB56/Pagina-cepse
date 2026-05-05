// ============================================
// MANEJADOR DE FORMULARIOS
// ============================================

class FormManager {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.currentForm = null;
        this.isLoading = false;
        this.initializeEventListeners();
    }

    // Inicializar listeners mediante delegación de eventos para mayor robustez
    initializeEventListeners() {
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-form]');
            if (!btn) return;

            e.preventDefault();
            const formType = btn.getAttribute('data-form');
            if (formType) {
                console.log(`Abriendo formulario: ${formType}`);
                this.openForm(formType);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    }

    // Ya no es necesario con delegación de eventos
    removeOldListeners() {
        // Obsoleto
    }

    // Abrir formulario dinámicamente
    openForm(formType) {
        const config = FORMS_CONFIG[formType];
        if (!config) {
            console.error(`Formulario ${formType} no existe`);
            return;
        }

        this.currentForm = formType;
        const modal = this.createModal(config);
        document.body.appendChild(modal);
        
        // Animar modal
        setTimeout(() => modal.classList.add('active'), 10);

        // Manejar submit - PASAR TAMBIÉN CONFIG
        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => this.handleSubmit(e, formType, config));

        // Cerrar modal
        const closeBtn = modal.querySelector('[data-close-modal]');
        closeBtn.addEventListener('click', () => this.closeModal(modal));

        // Cerrar al clickear fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    // Crear modal HTML dinámicamente
    createModal(config) {
        const modal = document.createElement('div');
        modal.className = 'modal p-4 sm:p-6';
        modal.id = config.id;

        let fieldsHTML = '';
        config.fields.forEach(field => {
            fieldsHTML += this.createField(field);
        });

        // Extract title without emoji if present
        let displayTitle = config.title;
        const emojiMatch = config.title.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\S)\s+(.*)$/);
        if (emojiMatch) {
            displayTitle = emojiMatch[2];
        }

        modal.innerHTML = `
            <div class="modal-content w-full max-w-xl relative">
                <button data-close-modal class="modal-close" aria-label="Cerrar modal">
                    <span class="material-symbols-outlined pointer-events-none">close</span>
                </button>
                
                <!-- Logo / Marca -->
                <div class="flex items-center gap-2 mb-6">
                    <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        C
                    </div>
                    <span class="font-bold text-slate-800 text-sm tracking-wide">CEPSE</span>
                </div>

                <div class="mb-8 pr-8">
                    <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3 leading-tight">
                        ${displayTitle}
                    </h2>
                    <p class="text-sm md:text-base text-slate-500 font-medium">
                        ${config.subtitle}
                    </p>
                </div>

                <form class="space-y-4" data-form-type="${config.id}">
                    <div class="space-y-2">
                        ${fieldsHTML}
                    </div>

                    <div class="flex items-start gap-3 mt-6 pt-6 border-t border-slate-100">
                        <div class="flex items-center h-5 mt-0.5">
                            <input type="checkbox" id="form-terms" name="terms" required class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer form-checkbox transition-all"/>
                        </div>
                        <label for="form-terms" class="text-sm text-slate-500 leading-relaxed cursor-pointer select-none">
                            Acepto que mis datos se almacenen en los registros de CEPSE.
                        </label>
                    </div>

                    <div class="pt-4">
                        <button
                            type="submit"
                            class="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-xl text-base font-bold shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5 transition-all duration-300"
                            id="form-submit-btn">
                            <span class="submit-text">Enviar solicitud</span>
                            <span class="submit-loading hidden flex items-center gap-2">
                                <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span> 
                                Procesando...
                            </span>
                        </button>
                    </div>
                </form>

                <div class="mt-6 text-center">
                    <span class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <span class="material-symbols-outlined text-[14px]">lock</span>
                        Información cifrada y segura
                    </span>
                </div>
            </div>
        `;

        return modal;
    }

    // Crear campo individual
    createField(field) {
        const baseClasses = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm';
        const required = field.required ? ' required' : '';

        // Determinar icono basado en nombre o tipo
        let iconName = '';
        const nameLower = field.name.toLowerCase();
        if (nameLower.includes('nombre')) iconName = 'person';
        else if (nameLower.includes('organizacion') || nameLower.includes('empresa') || nameLower.includes('sector')) iconName = 'domain';
        else if (field.type === 'email' || nameLower.includes('email')) iconName = 'mail';
        else if (field.type === 'tel' || nameLower.includes('telefono')) iconName = 'call';
        else if (nameLower.includes('ciudad')) iconName = 'location_on';
        else if (field.type === 'select') iconName = 'list';
        else if (field.type === 'textarea') iconName = 'edit_note';
        else iconName = 'edit';

        const inputClasses = iconName ? `${baseClasses} pl-11` : baseClasses;

        if (field.type === 'select') {
            let options = '';
            if (field.options) {
                options = field.options.map(opt => 
                    `<option value="${opt.value}">${opt.label}</option>`
                ).join('');
            }
            return `
                <div class="mb-5">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">${field.label}</label>
                    <div class="input-with-icon relative flex items-center">
                        <span class="material-symbols-outlined input-icon absolute left-3.5 text-slate-400 pointer-events-none transition-colors">${iconName}</span>
                        <select name="${field.name}" class="${inputClasses}"${required}>
                            ${options}
                        </select>
                    </div>
                </div>
            `;
        }

        if (field.type === 'textarea') {
            const rows = field.rows || 3;
            return `
                <div class="mb-5">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">${field.label}</label>
                    <div class="input-with-icon relative flex items-start">
                        <span class="material-symbols-outlined input-icon absolute left-3.5 top-3.5 text-slate-400 pointer-events-none transition-colors">${iconName}</span>
                        <textarea
                            name="${field.name}"
                            rows="${rows}"
                            placeholder="${field.placeholder || ''}"
                            class="${inputClasses} resize-none"${required}></textarea>
                    </div>
                </div>
            `;
        }

        return `
            <div class="mb-5">
                <label class="block text-sm font-semibold text-slate-700 mb-2">${field.label}</label>
                <div class="input-with-icon relative flex items-center">
                    <span class="material-symbols-outlined input-icon absolute left-3.5 text-slate-400 pointer-events-none transition-colors">${iconName}</span>
                    <input
                        type="${field.type}"
                        name="${field.name}"
                        placeholder="${field.placeholder || ''}"
                        class="${inputClasses}"${required} />
                </div>
            </div>
        `;
    }

    // Manejar envío de formulario
    async handleSubmit(e, formType, config) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validar
        if (!this.validateForm(form)) return;

        // Mostrar loading
        this.setFormLoading(form, true);

        try {
            // Agregar timestamp y tipo de forma - USAR EL ID DEL CONFIG, NO LA CLAVE
            data.timestamp = new Date().toLocaleString('es-EC');
            data.formType = config.id; // Usar el ID del modal, no formType

            // Enviar a API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                this.showSuccess(form);
                form.reset();
                
                // Cerrar modal después de 2 segundos
                setTimeout(() => {
                    const modal = form.closest('.modal');
                    if (modal) this.closeModal(modal);
                }, 2000);
            } else {
                this.showError(form, result.message || 'Error al enviar el formulario');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError(form, 'No se pudo conectar con el servidor. Intenta más tarde.');
        } finally {
            this.setFormLoading(form, false);
        }
    }

    // Validar campos requeridos
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500', 'bg-red-50');
                isValid = false;
            } else {
                field.classList.remove('border-red-500', 'bg-red-50');
            }
        });

        // Validar email
        const emailFields = form.querySelectorAll('[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                field.classList.add('border-red-500', 'bg-red-50');
                isValid = false;
            }
        });

        if (!isValid) {
            this.showError(form, 'Por favor completa todos los campos obligatorios correctamente');
        }

        return isValid;
    }

    // Validar email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Mostrar mensaje de éxito
    showSuccess(form) {
        const modal = form.closest('.modal');
        const message = document.createElement('div');
        message.className = 'fixed top-6 right-6 bg-primary text-slate-900 px-6 py-4 rounded-lg shadow-lg font-bold z-50 animate-fade-in';
        message.innerHTML = '<span class="material-symbols-outlined inline mr-2">check_circle</span>¡Solicitud enviada con éxito!';
        document.body.appendChild(message);

        setTimeout(() => message.remove(), 4000);
    }

    // Mostrar mensaje de error
    showError(form, message) {
        const errorDiv = form.querySelector('[data-error]') || document.createElement('div');
        errorDiv.className = 'bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4';
        errorDiv.setAttribute('data-error', '');
        errorDiv.innerHTML = `<span class="material-symbols-outlined inline mr-2 text-sm">error</span>${message}`;
        
        if (!form.querySelector('[data-error]')) {
            form.insertBefore(errorDiv, form.firstChild);
        }
    }

    // Cambiar estado loading
    setFormLoading(form, loading) {
        this.isLoading = loading;
        const submitBtn = form.querySelector('[type="submit"]');
        const submitText = submitBtn.querySelector('.submit-text');
        const submitLoading = submitBtn.querySelector('.submit-loading');

        if (loading) {
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            submitLoading.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitText.classList.remove('hidden');
            submitLoading.classList.add('hidden');
        }
    }

    // Cerrar modal
    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Cerrar todos los modales
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            this.closeModal(modal);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx-6w3X2OFdWyPmHPxQyJ3WS_pJuMDa4G2jiUmFmFJ6hu97PLeN5_bShZIuP5uM28g/exec';
    
    window.formManager = new FormManager(API_ENDPOINT);
    window.formManager.initializeEventListeners();
});
