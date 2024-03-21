export default {
    debug: true, //para que se vea los returns del server
    name: 'serp',
    // ssl: true,
    // host: 'darmotos.servisofts.com',
    ssl: false,
    host: '192.168.2.1',

    port: {
        native: 10048,
        web: 20048,
        http: 30048
    },
    cert: 'MIIDzjCCAragAwIBAgIEZbnS2zANBgkqhkiG9w0BAQsFADCBqDELMAkGA1UEBhMCQk8xEjAQBgNVBAgMCUF2IEJhbnplcjETMBEGA1UEBwwKU2FudGEgQ3J1ejEaMBgGA1UECgwRU0VSVklTT0ZUUyBTLlIuTC4xDTALBgNVBAsMBHNlcnAxHDAaBgNVBAMME3NlcnAuc2Vydmlzb2Z0cy5jb20xJzAlBgkqhkiG9w0BCQEWGHNlcnZpc29mdHMuc3JsQGdtYWlsLmNvbTAeFw0yNDAxMzEwNDU1NTVaFw0yNDAyMDEwNDU1NTVaMIGoMQswCQYDVQQGEwJCTzESMBAGA1UECAwJQXYgQmFuemVyMRMwEQYDVQQHDApTYW50YSBDcnV6MRowGAYDVQQKDBFTRVJWSVNPRlRTIFMuUi5MLjENMAsGA1UECwwEc2VycDEcMBoGA1UEAwwTc2VycC5zZXJ2aXNvZnRzLmNvbTEnMCUGCSqGSIb3DQEJARYYc2Vydmlzb2Z0cy5zcmxAZ21haWwuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm8BlH0w9A',
    apis: {
        roles_permisos: 'https://rolespermisos.servisofts.com/http/',
        // empresa: 'https://empresa.servisofts.com/http/',
        empresa: 'http://192.168.2.1:30029/',
        inventario: 'https://inventario.servisofts.com/http/',
        // inventario: 'http://192.168.2.1:30039/',
        compra_venta: 'https://compraventa.servisofts.com/http/',
        // spdf: "http://192.168.2.1:30046/",
        spdf: "https://spdf.servisofts.com/http/",
        // contabilidad: "https://contabilidad.servisofts.com/http/",
        contabilidad: "http://192.168.2.1:30011/",
        sqr: "https://qr.servisofts.com/http/"
        // sqr: "http://192.168.3.2:30034/"
        // compra_venta: 'http://192.168.2.1:30041/',
    },
    timeReconnect: 5000
}