// Configuración de Tailwind CSS
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#13ec13",
                "background-light": "#ffffff",
                "background-dark": "#f8fafc",
            },
            fontFamily: {
                "display": ["Inter"]
            },
            borderRadius: { "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px" },
        },
    },
}

// Configuración de Formspree para envío de emails
const FORMSPREE_CONFIG = {
    endpoint: 'https://formspree.io/f/mkgnzqzq',
    email: 'info@cepse-esmeraldas.com'
};

