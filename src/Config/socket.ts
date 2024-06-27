export default {
    debug: true, //para que se vea los returns del server
    // debug: false, //para que se vea los returns del server
    name: 'serp',
    ssl: true,
    host: 'serp.servisofts.com',
    // ssl: false,
    // host: '192.168.2.1',

    port: {
        native: 10048,
        web: 20048,
        http: 30048
    },
    cert: 'MIIDzjCCAragAwIBAgIEZbnS2zANBgkqhkiG9w0BAQsFADCBqDELMAkGA1UEBhMCQk8xEjAQBgNVBAgMCUF2IEJhbnplcjETMBEGA1UEBwwKU2FudGEgQ3J1ejEaMBgGA1UECgwRU0VSVklTT0ZUUyBTLlIuTC4xDTALBgNVBAsMBHNlcnAxHDAaBgNVBAMME3NlcnAuc2Vydmlzb2Z0cy5jb20xJzAlBgkqhkiG9w0BCQEWGHNlcnZpc29mdHMuc3JsQGdtYWlsLmNvbTAeFw0yNDAxMzEwNDU1NTVaFw0yNDAyMDEwNDU1NTVaMIGoMQswCQYDVQQGEwJCTzESMBAGA1UECAwJQXYgQmFuemVyMRMwEQYDVQQHDApTYW50YSBDcnV6MRowGAYDVQQKDBFTRVJWSVNPRlRTIFMuUi5MLjENMAsGA1UECwwEc2VycDEcMBoGA1UEAwwTc2VycC5zZXJ2aXNvZnRzLmNvbTEnMCUGCSqGSIb3DQEJARYYc2Vydmlzb2Z0cy5zcmxAZ21haWwuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm8BlH0w9A+FbHvJEWB4210A8klFrHaVdIzwVsxIASr8oqp3BPEl/HDfuiFp571MrxOOPpxMo8ptNKJnaGhHX6XpzozhEi5ohore1912z7m+R2X38/7ZrY34hGPmF3xaiScHXoe9537gbAk21LTIQSnX9GclMzcinXiyVa/nE92Sc3jNAEuftnSiV/B8Nz5jRquzD/4h8j85yYaAJn1t46P5bf88foACkuZkWIT3gAhT2+IpvoQiyd3kYwZnGwYqrSzm0mRekqRWsdpr7TH25XVGdtWyslbNH3rN72GsEq6QbAHV/VtjnpCOV72DZ5FYVTAqasP1VPuidUwUx/n7KrQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBN3/qakcNpVp0x+pyYNGgHJI/GW0Z0KuziOLiolk2oymJzCGRVedmKb4laYhIAGO/qybSFwUUIlkEAiSVZo6Rr3hb7vLtsHvX+3XQUQgzVaao0t5S9XuKIjT5kPArLCHHtbim424pjMAJz6H69GpiSsIAM6bXy4elNUf+9Dq4eim9Mro/AfMxnllGDR72t4xC9EDVvWXvO0euMhKnpxQkppCsyID45JwrTVwUFYBjDzHQGAaoY2RrU+vHnK7PQk9ZUsquzUcB7jM0Wc7aw5m53FQHmAcxSPPMwcuenY9CGe0+XQYziC1mBEMs58glF0b2trFIcG0lezbct8NZU9ltH',
    apis: {
        roles_permisos: 'https://rolespermisos.servisofts.com/http/',
        empresa: 'https://empresa.servisofts.com/http/',
        // empresa: 'http://192.168.2.1:30029/',
        // inventario: 'https://inventario.servisofts.com/http/',
        inventario: 'http://192.168.2.1:30039/',
        compra_venta: 'https://compraventa.servisofts.com/http/',

        // spdf: "https://spdf.servisofts.com/http/",
        spdf: "http://192.168.3.3:30046/",
        contabilidad: "https://contabilidad.servisofts.com/http/",
        // contabilidad: "http://192.168.2.1:30011/",
        sqr: "https://qr.servisofts.com/http/",
        // sqr: "http://192.168.3.2:30034/"
        facturacion: "http://192.168.2.1:30028/",
        repo: "http://192.168.2.1:30048/",
        // repo: "http://serp.servisofts.com/images/",
        // compra_venta: 'http://192.168.2.1:30041/',

        crm: "https://crm.servisofts.com/http/",
        // crm: "http://192.168.2.1:30051/",
    },
    timeReconnect: 5000
}