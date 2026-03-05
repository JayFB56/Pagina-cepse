// ============================================
// GOOGLE APPS SCRIPT - Backend para CEPSE
// ============================================
// Este archivo debe ser publicado como Web App en Google Apps Script
// Ver instrucciones en Google-Sheets-Setup.md

const SHEET_ID = '1__uU3cU5B58I5EGmMc6J9UlBz2C2v7YLeBFfTISU6og'; // ✅ Tu Sheet ID
const SCRIPT_PROPERTY = 'CEPSE_API_SECRET'; // Para validación

// Función doPost - Recibe datos de los formularios
function doPost(e) {
    try {
        // Validar que sea una solicitud legítima
        const data = JSON.parse(e.postData.contents);
        
        if (!data || !data.formType) {
            return createResponse(false, 'Datos inválidos');
        }

        // Agregar fecha y hora del servidor
        data.fechaRecibida = new Date().toLocaleString('es-EC', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Obtener la hoja correcta basada en el tipo de formulario
        const sheetName = getSheetNameForForm(data.formType);
        
        if (!sheetName) {
            return createResponse(false, 'Tipo de formulario no reconocido');
        }

        // Guardar datos
        const result = appendDataToSheet(sheetName, data);

        if (result) {
            // Log de auditoría
            logSubmission(data.formType, data.email || data.nombre || 'sin-email');
            
            return createResponse(true, 'Datos guardados correctamente');
        } else {
            return createResponse(false, 'Error al guardar datos');
        }

    } catch (error) {
        Logger.log('Error en doPost: ' + error.toString());
        return createResponse(false, 'Error en el servidor: ' + error.toString());
    }
}

// Mapeo de tipos de formulario a nombres de hojas
function getSheetNameForForm(formType) {
    const mapping = {
        'affiliation-modal': 'Afiliaciones',
        'contact-modal': 'Contactos',
        'consulting-modal': 'Consultorias',
        'event-registration-modal': 'Registros_Eventos',
        'fair-registration-modal': 'Registros_Ferias'
    };
    return mapping[formType];
}

// Agregar datos a la hoja de cálculo
function appendDataToSheet(sheetName, data) {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        
        // Obtener o crear la hoja
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
            sheet = ss.insertSheet(sheetName);
            createHeaders(sheet, sheetName);
        }

        // Preparar fila de datos
        const row = convertDataToRow(sheetName, data);
        
        // Agregar fila a la hoja
        sheet.appendRow(row);
        
        // Formatear última fila
        formatNewRow(sheet);
        
        return true;
    } catch (error) {
        Logger.log('Error en appendDataToSheet: ' + error.toString());
        return false;
    }
}

// Crear encabezados basados en el tipo de hoja
function createHeaders(sheet, sheetName) {
    const headers = {
        'Afiliaciones': [
            'Fecha Recibida',
            'Nombre',
            'Organización',
            'Email',
            'Teléfono',
            'Tipo Organización',
            'Sector Productivo',
            'Ciudad',
            'Descripción Actividad',
            'Estado'
        ],
        'Contactos': [
            'Fecha Recibida',
            'Nombre',
            'Email',
            'Teléfono',
            'Asunto',
            'Mensaje',
            'Estado'
        ],
        'Consultorias': [
            'Fecha Recibida',
            'Nombre',
            'Organización',
            'Email',
            'Teléfono',
            'Tipo Consultoría',
            'Descripción',
            'Rango Empleados',
            'Estado'
        ],
        'Registros_Eventos': [
            'Fecha Recibida',
            'Nombre',
            'Organización',
            'Email',
            'Teléfono',
            'Ciudad',
            'Cargo',
            'Requiere Hospedaje',
            'Comentarios',
            'Estado'
        ],
        'Registros_Ferias': [
            'Fecha Recibida',
            'Nombre Organización',
            'Representante',
            'Email',
            'Teléfono',
            'Productos',
            'Tipo Producto',
            'Tamaño Stand',
            'Estado'
        ]
    };

    const headerRow = headers[sheetName] || [];
    if (headerRow.length > 0) {
        sheet.appendRow(headerRow);
        // Formatear encabezado
        const headerRange = sheet.getRange(1, 1, 1, headerRow.length);
        headerRange.setBackground('#13ec13')
                   .setFontColor('#ffffff')
                   .setFontWeight('bold');
    }
}

// Convertir datos a fila basada en el tipo de hoja
function convertDataToRow(sheetName, data) {
    const baseRow = [data.fechaRecibida || new Date().toLocaleString('es-EC')];
    
    switch(sheetName) {
        case 'Afiliaciones':
            return [
                data.fechaRecibida,
                data.nombre || '',
                data.organizacion || '',
                data.email || '',
                data.telefono || '',
                data.tipoOrganizacion || '',
                data.sectorProductivo || '',
                data.ciudad || '',
                data.metodologia || '',
                'Pendiente'
            ];
        
        case 'Contactos':
            return [
                data.fechaRecibida,
                data.nombre || '',
                data.email || '',
                data.telefono || '',
                data.asunto || '',
                data.mensaje || '',
                'Sin leer'
            ];
        
        case 'Consultorias':
            return [
                data.fechaRecibida,
                data.nombre || '',
                data.organizacion || '',
                data.email || '',
                data.telefono || '',
                data.tipoConsultoria || '',
                data.descripcion || '',
                data.rango_empleados || '',
                'Pendiente'
            ];
        
        case 'Registros_Eventos':
            return [
                data.fechaRecibida,
                data.nombre || '',
                data.organizacion || '',
                data.email || '',
                data.telefono || '',
                data.ciudad || '',
                data.cargo || '',
                data.requiere_hospedaje || 'No especificado',
                data.comentarios || '',
                'Confirmado'
            ];
        
        case 'Registros_Ferias':
            return [
                data.fechaRecibida,
                data.nombre_organizacion || '',
                data.representante || '',
                data.email || '',
                data.telefono || '',
                data.producto || '',
                data.tipo_producto || '',
                data.tamaño_stand || '',
                'Pendiente'
            ];
        
        default:
            return baseRow;
    }
}

// Formatear nueva fila
function formatNewRow(sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        const lastRowRange = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn());
        lastRowRange.setBackground('#f1f5f9')
                     .setFontColor('#334155');
    }
}

// Registrar envíos para auditoría
function logSubmission(formType, contact) {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        let auditSheet = ss.getSheetByName('Auditoria');
        
        if (!auditSheet) {
            auditSheet = ss.insertSheet('Auditoria');
            auditSheet.appendRow(['Fecha', 'Tipo Formulario', 'Contacto']);
        }
        
        auditSheet.appendRow([
            new Date().toISOString(),
            formType,
            contact
        ]);
    } catch (e) {
        Logger.log('Error en auditoria: ' + e.toString());
        // No lanzar error, solo registrar
    }
}

// Crear respuesta JSON
function createResponse(success, message) {
    return ContentService.createTextOutput(JSON.stringify({
        success: success,
        message: message
    })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// FUNCIONES DE ADMINISTRACIÓN
// ============================================

// Verificar que el Script está correctamente configurado
function testConfiguration() {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheets = ss.getSheets().map(s => s.getName());
        Logger.log('Sheets encontradas: ' + sheets.join(', '));
        Logger.log('Configuración OK');
        return true;
    } catch (e) {
        Logger.log('Error en configuración: ' + e.toString());
        return false;
    }
}

// Obtener resumen de datos
function getDataSummary() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const summary = {};
    
    const sheetNames = ['Afiliaciones', 'Contactos', 'Consultorias', 'Registros_Eventos', 'Registros_Ferias'];
    
    sheetNames.forEach(name => {
        const sheet = ss.getSheetByName(name);
        if (sheet) {
            const rows = sheet.getLastRow() - 1; // Restar 1 por encabezado
            summary[name] = rows > 0 ? rows : 0;
        }
    });
    
    Logger.log(JSON.stringify(summary));
    return summary;
}

// Limpiar datos de prueba (USAR CON CUIDADO)
function clearTestData(sheetName) {
    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(sheetName);
        
        if (sheet && sheet.getLastRow() > 1) {
            // Mantener solo el encabezado
            sheet.deleteRows(2, sheet.getLastRow() - 1);
            Logger.log('Datos de prueba eliminados de ' + sheetName);
        }
    } catch (e) {
        Logger.log('Error al limpiar: ' + e.toString());
    }
}
