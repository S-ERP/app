export default {
    debug: true, //para que se vea los returns del server
    name: 's-erp',
    ssl: true,
    host: 's-erp.servisofts.com',
    // ssl: false,
    // host: '192.168.2.1',

    port: {
        native: 10048,
        web: 20048,
        http: 30048
    },
    cert: 'not_found',
    apis: {
        roles_permisos: 'https://rolespermisos.servisofts.com/http/',
        empresa: 'https://empresa.servisofts.com/http/',
        inventario: 'https://inventario.servisofts.com/http/',
        // inventario: 'http://192.168.2.1:30039/',
        compra_venta: 'https://compraventa.servisofts.com/http/',
        spdf: "http://192.168.3.2:30046/",
        // spdf: "https://spdf.servisofts.com/http/",
        sqr: "https://qr.servisofts.com/http/"
        // sqr: "http://192.168.3.2:30034/"
        // compra_venta: 'http://192.168.2.1:30041/',
    },
    timeReconnect: 5000
}