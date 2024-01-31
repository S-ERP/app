export default {
    debug: true, //para que se vea los returns del server
    name: 'darmotos',
    ssl: true,
    host: 'darmotos.servisofts.com',
    // ssl: false,
    // host: '192.168.2.1',

    port: {
        native: 10038,
        web: 20038,
        http: 30038
    },
    cert: 'MIID4DCCAsigAwIBAgIEYs4WHTANBgkqhkiG9w0BAQsFADCBsTELMAkGA1UEBhMCQk8xEjAQBgNVBAgMCUF2IEJhbnplcjETMBEGA1UEBwwKU2FudGEgQ3J1ejEXMBUGA1UECgwOU2Vydmlzb2Z0cyBTUkwxEzARBgNVBAsMCkNhc2FHcmFuZGUxIjAgBgNVBAMMGUNhc2FHcmFuZGUuc2Vydmlzb2Z0cy5jb20xJzAlBgkqhkiG9w0BCQEWGHNlcnZpc29mdHMuc3JsQGdtYWlsLmNvbTAeFw0yMjA3MTMwMDQ3MjVaFw0yMjA3MTQwMDQ3MjVaMIGxMQswCQYDVQQGEwJCTzESMBAGA1UECAwJQXYgQmFuemVyMRMwEQYDVQQHDApTYW50YSBDcnV6MRcwFQYDVQQKDA5TZXJ2aXNvZnRzIFNSTDETMBEGA1UECwwKQ2FzYUdyYW5kZTEiMCAGA1UEAwwZQ2FzYUdyYW5kZS5zZXJ2aXNvZnRzLmNvbTEnMCUGCSqGSIb3DQEJARYYc2Vydmlzb2Z0cy5zcmxAZ21haWwuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsITZ3dMm2vd/aXEMmSAxUXmtu470N4uEgy2JVDQfXblC5LawgpffB6Ih+wmRLsbGp6uN+vcEuYpq9dKOhgV6ct2srWyeFVtzP6nWAgwXa84t3Kq1CQzEmkglRkx5Nydn2v5HYvG2LKt8fZ99964VrVpF4btHz7qNzgP4SpCqaHLCWAI3AXJ/Sct1xrMimyErCLb8pglIPGlm/jXnUJApFnne54gz7qsWOfOn58qpbZtL6eOpUQD/0axYRKhWq+r3voajhSpIVodVUABYz7G9H3KekPrMksYxCBGDW1+UWniGJJOiSo05xBV3rHY6b9S2aoCi6Q0CGKjhxfqFysQXCQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQB174RAiHA/0wiZ+mnvrh6rfFTN7rliYqQcIS+HecPSI2StBmVFFf0LAv6Hz1S++PXwfQswigzxEOvvLVCSDLKX3KHl8wD8UAlXDh17FlhmAKfAEgow/DuG6V11nY8k9kd6UJqn1NutkmhDALuZRc8ejV4cNZbx8pkIZlRFvZMzxDc/aP2Jq7vid8MzvMgXXQ2vSP5y2mtzNjPbIphfaCLssCwZ2TaR18pEh+L062LVKKxTYWZc1vgH4cnLIqMSGBRM5gngPV7XrXn8YDZYipZQ9fnm/Po+JMXyzSPIfm6tR0+ICr1DRUZGWBTgm/9gx7ibGEwRkInnFUJVU2qoShlr',
    apis: {
        roles_permisos: 'https://rolespermisos.servisofts.com/http/',
        empresa: 'https://empresa.servisofts.com/http/',
        inventario: 'https://inventario.servisofts.com/http/',
        // inventario: 'http://192.168.2.1:30039/',
        compra_venta: 'https://compraventa.servisofts.com/http/',
        // spdf: "http://192.168.3.2:30046/",
        spdf: "https://spdf.servisofts.com/http/",
        sqr: "https://qr.servisofts.com/http/"
        // sqr: "http://192.168.3.2:30034/"
        // compra_venta: 'http://192.168.2.1:30041/',
    },
    timeReconnect: 5000
}