const js = require('@eslint/js'); //se usa arroba para traer paquetes de npm

module.exports = {
    files: ['src/**/*.js'], //aplica a todos los archivos js dentro de src y subcarpetas
    languageOptions: { //configuraciones del lenguaje
        ecmaVersion: 2021, 
        sourceType: 'commonjs', // tipo de módulo
    },

    rules: { // reglas personalizadas
        ...js.configs.recommended.rules,
        'no-console': 'warn', //
        'camelcase': ['error', { properties: 'always' }], //usar CamelCase
        'no-unused-vars': 'warn', // no se usan variables declaradas
        'quotes': ['error', 'single'], //comillas simples  
    },

};

