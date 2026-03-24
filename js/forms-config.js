// ============================================
// CONFIGURACIÓN DE FORMULARIOS
// ============================================

const FORMS_CONFIG = {
    // Formulario de Afiliación
    affiliation: {
        id: 'affiliation-modal',
        title: '📝 Solicitar Afiliación',
        subtitle: 'Completa el formulario para que nos pongamos en contacto contigo.',
        fields: [
            { name: 'nombre', label: 'Nombre Completo *', type: 'text', required: true, placeholder: 'Tu nombre completo' },
            { name: 'organizacion', label: 'Nombre de tu Organización *', type: 'text', required: true, placeholder: 'Nombre de la organización' },
            { name: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'tu@email.com' },
            { name: 'telefono', label: 'Teléfono *', type: 'tel', required: true, placeholder: '+593 9 XXXXXXXX' },
            { 
                name: 'tipoOrganizacion', 
                label: 'Tipo de Organización *', 
                type: 'select', 
                required: true,
                options: [
                    { value: '', label: 'Selecciona una opción' },
                    { value: 'asociacion', label: 'Asociación' },
                    { value: 'cooperativa', label: 'Cooperativa' },
                    { value: 'emprendimiento', label: 'Emprendimiento' },
                    { value: 'otro', label: 'Otro' }
                ]
            },
            { 
                name: 'sectorProductivo', 
                label: 'Sector Productivo *', 
                type: 'select', 
                required: true,
                options: [
                    { value: '', label: 'Selecciona tu sector' },
                    { value: 'agricultura', label: 'Agricultura' },
                    { value: 'artesania', label: 'Artesanía' },
                    { value: 'comercio', label: 'Comercio y Servicios' },
                    { value: 'transformacion', label: 'Transformación de Productos' },
                    { value: 'otro', label: 'Otro' }
                ]
            },
            { name: 'ciudad', label: 'Ciudad *', type: 'text', required: true, placeholder: 'Ej: Esmeraldas, Atacames' },
            { name: 'metodologia', label: 'Descripción breve de tu actividad económica', type: 'textarea', required: false, placeholder: 'Cuéntanos sobre tu organización...' }
        ],
        sheetName: 'Afiliaciones'
    },

    // Formulario de Contacto General
    contact: {
        id: 'contact-modal',
        title: '📧 Contáctanos',
        subtitle: 'Envía tu mensaje directamente a info@cepse-esmeraldas.com y te responderemos pronto.',
        fields: [
            { name: 'nombre', label: 'Nombre Completo *', type: 'text', required: true, placeholder: 'Tu nombre' },
            { name: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'tu@email.com' },
            { name: 'telefono', label: 'Teléfono (opcional)', type: 'tel', required: false, placeholder: '+593 9 XXXXXXXX' },
            { name: 'asunto', label: 'Asunto *', type: 'text', required: true, placeholder: 'Ej: Solicitud de asesoramiento' },
            { name: 'mensaje', label: 'Mensaje *', type: 'textarea', required: true, placeholder: 'Escribe tu mensaje aquí...', rows: 5 }
        ],
        sheetName: 'Contactos'
    },

    // Formulario de Consultoría
    consulting: {
        id: 'consulting-modal',
        title: '🎯 Solicitar Consultoría Personalizada',
        subtitle: 'Diseñaremos un plan de apoyo adaptado a tus necesidades.',
        fields: [
            { name: 'nombre', label: 'Nombre Completo *', type: 'text', required: true },
            { name: 'organizacion', label: 'Nombre de la Organización *', type: 'text', required: true },
            { name: 'email', label: 'Email *', type: 'email', required: true },
            { name: 'telefono', label: 'Teléfono *', type: 'tel', required: true },
            { 
                name: 'tipoConsultoria', 
                label: 'Tipo de Consultoría Requerida *', 
                type: 'select', 
                required: true,
                options: [
                    { value: '', label: 'Selecciona...' },
                    { value: 'legal', label: 'Legal y Tributaria' },
                    { value: 'administrativa', label: 'Gestión Administrativa' },
                    { value: 'financiera', label: 'Financiera y Crédito' },
                    { value: 'productiva', label: 'Innovación Productiva' },
                    { value: 'comercial', label: 'Acceso a Mercados' },
                    { value: 'capacitacion', label: 'Capacitación' },
                    { value: 'otra', label: 'Otra' }
                ]
            },
            { name: 'descripcion', label: 'Descripción de tu necesidad *', type: 'textarea', required: true, placeholder: 'Explica brevemente qué necesitas...' },
            { name: 'rango_empleados', label: 'Número de miembros/empleados', type: 'text', required: false, placeholder: 'Ej: 10-20 personas' }
        ],
        sheetName: 'Consultorias'
    },

    // Formulario de Registro de Eventos
    eventRegistration: {
        id: 'event-registration-modal',
        title: '🎫 Registrarse a Evento',
        subtitle: 'Completa tus datos para confirmar tu asistencia.',
        fields: [
            { name: 'nombre', label: 'Nombre Completo *', type: 'text', required: true },
            { name: 'organizacion', label: 'Organización/Empresa *', type: 'text', required: true },
            { name: 'email', label: 'Email *', type: 'email', required: true },
            { name: 'telefono', label: 'Teléfono *', type: 'tel', required: true },
            { name: 'ciudad', label: 'Ciudad *', type: 'text', required: true },
            { name: 'cargo', label: 'Cargo/Rol', type: 'text', required: false, placeholder: 'Ej: Representante Legal, Gerente' },
            { name: 'requiere_hospedaje', label: '¿Requiere hospedaje?', type: 'select', required: false,
              options: [
                { value: '', label: 'No aplica' },
                { value: 'si', label: 'Sí' },
                { value: 'no', label: 'No' }
              ]
            },
            { name: 'comentarios', label: 'Comentarios adicionales', type: 'textarea', required: false, placeholder: 'Algo más que quieras decirnos?' }
        ],
        sheetName: 'Registros_Eventos'
    },

    // Formulario de Ferias
    fairRegistration: {
        id: 'fair-registration-modal',
        title: '🎪 Registrarse para Ferias',
        subtitle: 'Participa en nuestros eventos de comercialización y conexión.',
        fields: [
            { name: 'nombre_organizacion', label: 'Nombre de la Organización *', type: 'text', required: true },
            { name: 'representante', label: 'Representante Legal *', type: 'text', required: true },
            { name: 'email', label: 'Email *', type: 'email', required: true },
            { name: 'telefono', label: 'Teléfono *', type: 'tel', required: true },
            { name: 'producto', label: 'Productos a Ofrecer *', type: 'textarea', required: true, placeholder: 'Describe qué productos vas a vender' },
            { 
                name: 'tipo_producto', 
                label: 'Tipo de Producto *', 
                type: 'select', 
                required: true,
                options: [
                    { value: '', label: 'Selecciona...' },
                    { value: 'alimentos', label: 'Alimentos Procesados' },
                    { value: 'artesania', label: 'Artesanía' },
                    { value: 'textiles', label: 'Textiles' },
                    { value: 'servicios', label: 'Servicios' },
                    { value: 'otro', label: 'Otro' }
                ]
            },
            { name: 'tamaño_stand', label: 'Tamaño de stand requerido (m²)', type: 'text', required: false, placeholder: 'Ej: 4, 6, 9' }
        ],
        sheetName: 'Registros_Ferias'
    }
};

// Exportar para uso en otros scripts
window.FORMS_CONFIG = FORMS_CONFIG;
