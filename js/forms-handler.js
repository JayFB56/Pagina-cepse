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

        // Manejar submit
        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => this.handleSubmit(e, formType));

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
        modal.className = 'modal';
        modal.id = config.id;

        let fieldsHTML = '';
        config.fields.forEach(field => {
            fieldsHTML += this.createField(field);
        });

        modal.innerHTML = `
            <div class="modal-content max-w-2xl">
                <button data-close-modal class="modal-close">
                    <span class="material-symbols-outlined">close</span>
                </button>
                
                <h2 class="text-3xl font-black text-slate-900 mb-2">${config.title}</h2>
                <p class="text-slate-600 mb-8">${config.subtitle}</p>

                <form class="space-y-6" data-form-type="${config.id}">
                    ${fieldsHTML}

                    <div class="flex items-center gap-3">
                        <input type="checkbox" id="form-terms" name="terms" required class="w-4 h-4 accent-primary rounded"/>
                        <label for="form-terms" class="text-sm text-slate-600">
                            Acepto que mis datos se almacenen en los registros de CEPSE
                        </label>
                    </div>

                    <button
                        type="submit"
                        class="btn-primary w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                        id="form-submit-btn">
                        <span class="submit-text">Enviar Solicitud</span>
                        <span class="submit-loading hidden">
                            <span class="inline-block animate-spin">⏳</span> Enviando...
                        </span>
                    </button>
                </form>

                <div class="mt-4 text-center text-xs text-slate-500">
                    Tus datos son seguros y confidenciales
                </div>
            </div>
        `;

        return modal;
    }

    // Crear campo individual
    createField(field) {
        const baseClasses = 'w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 focus:border-primary focus:bg-white transition-all';
        const required = field.required ? ' required' : '';

        if (field.type === 'select') {
            let options = '';
            if (field.options) {
                options = field.options.map(opt => 
                    `<option value="${opt.value}">${opt.label}</option>`
                ).join('');
            }
            return `
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-3">${field.label}</label>
                    <select name="${field.name}" class="${baseClasses}"${required}>
                        ${options}
                    </select>
                </div>
            `;
        }

        if (field.type === 'textarea') {
            const rows = field.rows || 4;
            return `
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-3">${field.label}</label>
                    <textarea
                        name="${field.name}"
                        rows="${rows}"
                        placeholder="${field.placeholder || ''}"
                        class="${baseClasses} resize-none"${required}></textarea>
                </div>
            `;
        }

        return `
            <div>
                <label class="block text-sm font-bold text-slate-700 mb-3">${field.label}</label>
                <input
                    type="${field.type}"
                    name="${field.name}"
                    placeholder="${field.placeholder || ''}"
                    class="${baseClasses}"${required} />
            </div>
        `;
    }

    // Manejar envío de formulario
    async handleSubmit(e, formType) {
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
            // Agregar timestamp y tipo de forma
            data.timestamp = new Date().toLocaleString('es-EC');
            data.formType = formType;

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
