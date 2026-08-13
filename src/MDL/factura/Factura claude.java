package Component;

import java.util.Base64;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.UUID;

import org.json.JSONArray;
import org.json.JSONObject;

import Controllers.factura;
import Model.Factura.FacturaXMLtoJSON;
import SPDF.SPDF;
import Servisofts.SPGConect;
import Servisofts.SUtil;
import Servisofts.SocketCliente.SocketCliente;
import Utils.SOAP;

import java.text.DateFormat;
import java.text.DecimalFormat;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.text.SimpleDateFormat;

import Servisofts.Server.SSSAbstract.SSSessionAbstract;

public class Factura {

    public final static String tableName = "factura";

    public Factura(JSONObject obj, SSSessionAbstract session) {
        switch (obj.getString("type")) {
            case "getAll":
                getAll(obj, session);
                break;
            case "getByKey":
                getByKey(obj, session);
                break;
            case "editar":
                editar(obj, session);
                break;
            case "verificarNit":
                verificarNit(obj, session);
                break;
            case "getClientes":
                getClientes(obj, session);
                break;
            case "getProductos":
                getProductos(obj, session);
                break;
            case "emitir":
                emitir(obj, session);
                break;

            case "duplicar":
                duplicar(obj, session);
                break;

            case "anular":
                anular(obj, session);
                break;
            case "anularCuf":
                anularCuf(obj, session);
                break;
            case "verificarCuf":
                verificarCuf(obj, session);
                break;
            case "verificarEstado":
                verificarEstado(obj, session);
                break;
            case "revertir":
                revertir(obj, session);
                break;
            case "desc":
                desc(obj, session);
                break;
            case "reenviar":
                reenviar(obj, session);
                break;
            case "reconstruir":
                reconstruir(obj, session);
                break;
            case "imprimir":
                imprimir(obj, session);
                break;
            case "subirXML":
                subirXML(obj, session);
                break;
        }
    }

    public void getAll(JSONObject obj, SSSessionAbstract session) {
        try {
            String consulta = "select get_all('" + tableName + "', 'key_empresa', '" + obj.getString("key_empresa")
                    + "') as json";
            JSONObject data = SPGConect.ejecutarConsultaObject(consulta);
            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (SQLException e) {
            obj.put("estado", "error");
            e.printStackTrace();
        }
    }

    public static void getByKey(JSONObject obj, SSSessionAbstract session) {
        try {
            String consulta = "select get_by_key('" + tableName + "','" + obj.getString("key") + "') as json";
            JSONObject data = SPGConect.ejecutarConsultaObject(consulta);
            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (SQLException e) {
            obj.put("estado", "error");
            e.printStackTrace();
        }
    }

    public static JSONObject getByKey(String key) {
        try {
            String consulta = "select get_by_key('" + tableName + "','" + key + "') as json";
            return SPGConect.ejecutarConsultaObject(consulta);

        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static JSONObject getByCuf(String cuf) {
        try {
            String consulta = "select get_by_cuf('" + cuf + "') as json";
            return SPGConect.ejecutarConsultaObject(consulta);

        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static int getNumeroFactura(String key_empresa, String codigo_sucursal, String codigo_punto_venta, int ano,
            int ambiente) {
        try {
            String consulta = "select get_numero_factura('" + key_empresa + "', '" + codigo_sucursal + "', '"
                    + codigo_punto_venta + "',  '" + ano + "',  " + ambiente + ") as json";
            JSONObject data = SPGConect.ejecutarConsultaObject(consulta);
            return data.getInt("numero") + 1;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    public static void reconstruir(JSONObject obj, SSSessionAbstract session) {
        try {
            System.out.println("=== INICIANDO RECONSTRUIR FACTURA ===");
            System.out.println("CUF: " + obj.getString("cuf"));

            // En el camino iremos rellenando la factura
            JSONObject factura = Factura.getByCuf(obj.getString("cuf"));
            System.out.println("✅ Factura obtenida de BD");

            JSONObject objSend = SocketCliente.sendSinc("empresa",
                    new JSONObject()
                            .put("component", "empresa")
                            .put("type", "getByKey")
                            .put("key", factura.getString("key_empresa")));

            if (objSend.has("estado") && objSend.getString("estado").equals("error")) {
                System.out.println("❌ Error obteniendo empresa: " + objSend.getString("error"));
                throw new Exception(objSend.getString("error"));
            }

            // Empresa encontrada
            JSONObject empresa = new JSONObject(objSend.getJSONObject("data") + "");
            System.out.println("✅ Empresa obtenida: " + empresa.getString("razon_social"));

            String CodigoSucursal = factura.getJSONObject("data").optString("codigoSucursal", "0");
            String CodigoPuntoVenta = factura.getJSONObject("data").optString("codigoPuntoVenta", "0");
            System.out.println("Sucursal: " + CodigoSucursal + ", Punto de venta: " + CodigoPuntoVenta);

            JSONObject configSiat = Siat.initSiat(empresa.getString("key"), factura.getInt("ambiente"),
                    empresa.getString("nit"), CodigoSucursal, CodigoPuntoVenta);
            System.out.println("✅ ConfigSiat inicializado");

            if (empresa.getString("razon_social").length() < 3) {
                System.out.println("❌ Razón social incompleta: " + empresa.getString("razon_social"));
                obj.put("estado", "error");
                obj.put("error", "Ingresa la razon social de la empresa");
                return;
            }
            System.out.println("✅ Razón social válida");

            JSONObject objNew = new JSONObject(factura.toString());

            factura = factura.getJSONObject("data");
            System.out.println("✅ Factura data extraída");

            if (factura.optString("leyenda").isEmpty()) {
                System.out.println("Obteniendo leyenda de parametricas...");
                JSONArray leyendas = Siat.getParametrica(empresa.getString("key"), "leyendasFactura",
                        configSiat.getInt("ambiente"));
                if (leyendas != null && leyendas.length() > 0) {
                    int random = (int) (Math.random() * leyendas.length());
                    factura.put("leyenda", leyendas.getJSONObject(random).getString("descripcionLeyenda"));
                    System.out.println("✅ Leyenda asignada");
                }
            }

            if (factura.getInt("codigoTipoDocumentoIdentidad") == 5) {// haberiguar el codigo nit
                String nit = factura.getString("numeroDocumento");
                System.out.println("Validando NIT: " + nit.trim());
                JSONObject verificarNit = impuestos.verificarNit(configSiat, CodigoSucursal, nit);
                System.out.println("Respuesta SIAT: " + verificarNit);
                if (verificarNit.getJSONObject("mensajesList").getInt("codigo") != 986) {
                    System.out.println("❌ NIT INVÁLIDO: " + nit.trim());
                    obj.put("estado", "error");
                    obj.put("error", "NIT inválido: " + nit.trim() + " - " + verificarNit.getJSONObject("mensajesList").getString("descripcion"));
                    return;
                }
                System.out.println("✅ NIT válido");
            }

            DateFormat formatoCuf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
            SimpleDateFormat formato = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
            Date actual = new Date();
            String fechaHora = formato.format(actual);
            factura.put("fechaEmision", fechaHora);
            System.out.println("Fecha emisión: " + fechaHora);

            Calendar cal = new GregorianCalendar();
            cal.setTime(actual);

            String fechaHoraCuf = formatoCuf.format(actual);

            // **** hay que obtener el cuis local de nuestra base
            System.out.println("Obteniendo CUIS...");
            String cuis = SOAP.getCuis(configSiat).getString("codigo");
            factura.put("cuis", cuis);
            System.out.println("✅ CUIS: " + cuis);

            // **** hay que obtener el cufd local de nuestra base
            System.out.println("Obteniendo CUFD...");
            JSONObject objCufd = SOAP.getCufd(cuis, configSiat, factura.getString("codigoSucursal"),
                    factura.getString("codigoPuntoVenta"));
            String cufd = objCufd.getString("codigo");
            System.out.println("✅ CUFD: " + cufd);
            factura.put("cufd", cufd);

            // Armando cuf
            System.out.println("Generando CUF...");
            String cuf = impuestos.getCuf(
                    factura.getString("nitEmisor") + "",
                    fechaHoraCuf,
                    factura.get("codigoSucursal") + "",
                    1,
                    1,
                    1,
                    "1",
                    factura.get("numeroFactura") + "",
                    factura.get("codigoPuntoVenta") + "",
                    objCufd.get("codigoControl") + "");
            System.out.println("✅ CUF: " + cuf);
            factura.put("cuf", cuf);
            // factura.put("estado", "emitida");

            String urlImpuestos = "https://pilotosiat.impuestos.gob.bo/consulta/QR?";
            if (configSiat.getInt("ambiente") == 1) {
                urlImpuestos = "https://siat.impuestos.gob.bo/consulta/QR?";
            }
            urlImpuestos += "nit=" + factura.getString("nitEmisor") + "&cuf=" + factura.getString("cuf") + "&numero="
                    + factura.get("numeroFactura") + "&t=1";
            factura.put("urlImpuestos", urlImpuestos);
            System.out.println("URL Impuestos generada: " + urlImpuestos);

            objNew.put("data", factura);
            JSONObject factSave = objNew;

            System.out.println("Guardando factura en BD...");
            SPGConect.editObject(tableName, factSave);
            System.out.println("✅ Factura guardada en BD con key: " + factSave.getString("key"));

            factura.put("key", factSave.getString("key"));

            // Las hago final para que preserven la session mientras vive el hilo
            final JSONObject facturaS = new JSONObject(factura.toString());
            final JSONObject configSiatS = new JSONObject(configSiat.toString());

            System.out.println("Iniciando hilo enviador...");
            new Thread(() -> {
                try {
                    System.out.println(">>> HILO ENVIADOR: Iniciando envío a impuestos");
                    enviarImpuestos(configSiatS, facturaS);
                    System.out.println(">>> HILO ENVIADOR: Envío completado");
                } catch (Exception e) {
                    System.out.println(">>> HILO ENVIADOR: Error en envío");
                    e.printStackTrace();
                }
            }).start();

            System.out.println("✅ RECONSTRUIR COMPLETADO CON ÉXITO");
            obj.put("estado", "exito");
            obj.put("data", objNew);

        } catch (Exception e) {
            System.out.println("❌ ERROR EN RECONSTRUIR: " + e.getClass().getSimpleName());
            obj.put("estado", "error");
            String errorMsg = e.getLocalizedMessage();
            if (errorMsg == null || errorMsg.isEmpty()) {
                errorMsg = "Error al reconstruir la factura: " + e.getClass().getSimpleName();
            }
            System.out.println("Mensaje error: " + errorMsg);
            obj.put("error", errorMsg);
            e.printStackTrace();
            System.out.println("=== FIN RECONSTRUIR CON ERROR ===");
        }
    }

    public static void emitir(JSONObject obj, SSSessionAbstract session) {
        try {

            // En el camino iremos rellenando la factura
            JSONObject factura = new JSONObject();

            factura.put("codigoSucursal", obj.getJSONObject("data").get("codigoSucursal"));
            factura.put("codigoPuntoVenta", obj.getJSONObject("data").get("codigoPuntoVenta"));
            factura.put("codigoMetodoPago", obj.getJSONObject("data").get("codigoMetodoPago"));
            factura.put("codigoTipoDocumentoIdentidad", obj.getJSONObject("data").get("codigoTipoDocumentoIdentidad"));
            factura.put("codigoMoneda", obj.getJSONObject("data").get("codigoMoneda"));
            factura.put("codigoDocumentoSector", obj.getJSONObject("data").get("codigoDocumentoSector"));
            factura.put("leyenda", obj.getJSONObject("data").get("leyenda"));

            if (factura.getString("leyenda").isEmpty()) {
                System.out.println("llego vacio");
                JSONArray leyendas = Siat.getParametrica(obj.getString("key_empresa"), "leyendasFactura",
                        obj.getInt("ambiente"));
                if (leyendas != null && leyendas.length() > 0) {
                    int random = (int) (Math.random() * leyendas.length());
                    factura.put("leyenda", leyendas.getJSONObject(random).getString("descripcionLeyenda"));
                    System.out.println(leyendas.getJSONObject(random).getString("descripcionLeyenda"));

                }
            }

            factura.put("usuario", obj.getString("key_usuario"));
            factura.put("municipio", obj.getJSONObject("data").getString("municipio"));
            factura.put("telefono", obj.getJSONObject("data").getString("telefono"));

            if (obj.getJSONObject("data").has("numeroTarjeta")) {
                factura.put("numeroTarjeta", obj.getJSONObject("data").getString("numeroTarjeta"));
            }

            if (obj.getJSONObject("data").has("montoGiftCard")) {
                factura.put("montoGiftCard", obj.getJSONObject("data").get("montoGiftCard"));
            }

            if (obj.getJSONObject("data").has("descuentoAdicional")) {
                factura.put("descuentoAdicional", obj.getJSONObject("data").getDouble("descuentoAdicional"));
            }

            if (obj.getJSONObject("data").has("detalle")) {
                factura.put("detalle", obj.getJSONObject("data").getJSONArray("detalle"));
            }

            if (factura.getJSONArray("detalle").length() == 0) {
                obj.put("estado", "error");
                obj.put("error", "La factura no tiene detalle");
                return;
            }

            for (int i = 0; i < factura.getJSONArray("detalle").length(); i++) {
                if (factura.getJSONArray("detalle").getJSONObject(i).get("codigoProductoSin").toString()
                        .length() == 0) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene codigoProducto");
                    return;
                }
                if (factura.getJSONArray("detalle").getJSONObject(i).getString("descripcion").length() < 3) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene descripcion");
                    return;
                }

                if (factura.getJSONArray("detalle").getJSONObject(i).get("unidadMedida").toString().length() == 0) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene unidadMedida");
                    return;
                }

                if (factura.getJSONArray("detalle").getJSONObject(i).getInt("cantidad") <= 0) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene cantidad");
                    return;
                }

                if (factura.getJSONArray("detalle").getJSONObject(i).getDouble("precioUnitario") <= 0) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene precioUnitario");
                    return;
                }

            }

            // Buscando la sucursal en el micro servicio empresa
            JSONObject objSend = SocketCliente.sendSinc("empresa",
                    new JSONObject()
                            .put("component", "sucursal")
                            .put("type", "getByCode")
                            .put("codigo", factura.getString("codigoSucursal"))
                            .put("key_empresa", obj.getString("key_empresa")));

            if (objSend.has("estado") && objSend.getString("estado").equals("error")) {
                throw new Exception(objSend.getString("error"));
            }

            // Sucursal encontrada

            JSONObject sucursal = new JSONObject(objSend.getJSONObject("data") + "");

            if (!sucursal.has("direccion")) {
                obj.put("estado", "error");
                obj.put("error", "La sucursal no tiene dirección");
                return;
            }

            if (sucursal.isNull("direccion")) {
                obj.put("estado", "error");
                obj.put("error", "La sucursal no tiene dirección");
                return;
            }

            factura.put("municipio", sucursal.getString("descripcion"));
            factura.put("direccion", sucursal.getString("direccion"));

            // Buscando punto de venta en el micro servicio empresa
            /*
             * objSend = SocketCliente.sendSinc("empresa",
             * new JSONObject()
             * .put("component", "punto_venta")
             * .put("type", "getByCode")
             * .put("codigo", factura.getString("codigoSucursal"))
             * .put("key_sucursal", sucursal.getString("key")));
             * 
             * if (objSend.has("estado") && objSend.getString("estado").equals("error")) {
             * throw new Exception(objSend.getString("error"));
             * }
             * 
             * // Punto de venta encontrado
             * JSONObject puntoVenta = new JSONObject(objSend.getJSONObject("data") + "");
             */

            // Buscando empresa en el micro servicio empresa
            objSend = SocketCliente.sendSinc("empresa",
                    new JSONObject()
                            .put("component", "empresa")
                            .put("type", "getByKey")
                            .put("key", sucursal.getString("key_empresa")));

            if (objSend.has("estado") && objSend.getString("estado").equals("error")) {
                throw new Exception(objSend.getString("error"));
            }

            // Empresa encontrada
            JSONObject empresa = new JSONObject(objSend.getJSONObject("data") + "");

            String CodigoSucursal = factura.optString("codigoSucursal", "0");
            String CodigoPuntoVenta = factura.optString("codigoPuntoVenta", "0");

            JSONObject configSiat = Siat.initSiat(empresa.getString("key"), obj.getInt("ambiente"),
                    empresa.getString("nit"), CodigoSucursal, CodigoPuntoVenta);

            factura.put("nitEmisor", empresa.getString("nit"));

            if (empresa.getString("razon_social").length() < 3) {
                obj.put("estado", "error");
                obj.put("error", "Ingresa la razon social de la empresa");
                return;
            }

            factura.put("razonSocialEmisor", empresa.getString("razon_social"));

            factura.put("numeroDocumento", obj.getJSONObject("data").getString("numeroDocumento"));
            factura.put("complemento", obj.getJSONObject("data").optString("complemento"));

            factura.put("nombreRazonSocial", obj.getJSONObject("data").getString("nombreRazonSocial"));

            if (factura.getInt("codigoTipoDocumentoIdentidad") == 5) {// haberiguar el codigo nit
                String nit = factura.getString("numeroDocumento");
                JSONObject verificarNit = impuestos.verificarNit(configSiat, CodigoSucursal, nit);
                if (verificarNit.getJSONObject("mensajesList").getInt("codigo") != 986) {
                    obj.put("estado", "error");
                    obj.put("error", verificarNit.getJSONObject("mensajesList").getString("descripcion"));
                    return;
                }
            }

            DateFormat formatoCuf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
            SimpleDateFormat formato = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
            Date actual = new Date();
            String fechaHora = formato.format(actual);
            factura.put("fechaEmision", fechaHora);

            Calendar cal = new GregorianCalendar();
            cal.setTime(actual);
            int numeroFactura = getNumeroFactura(empresa.getString("key"), factura.getString("codigoSucursal"),
                    factura.getString("codigoPuntoVenta"), cal.get(Calendar.YEAR), configSiat.getInt("ambiente"));
            factura.put("numeroFactura", numeroFactura + "");

            String fechaHoraCuf = formatoCuf.format(actual);

            // **** hay que obtener el cuis local de nuestra base
            System.out.println("OBteniendo Cuis");
            String cuis = SOAP.getCuis(configSiat).getString("codigo");
            factura.put("cuis", cuis);
            System.out.println("✅ Cuis");

            // **** hay que obtener el cufd local de nuestra base
            JSONObject objCufd = SOAP.getCufd(cuis, configSiat, factura.getString("codigoSucursal"),
                    factura.getString("codigoPuntoVenta"));
            String cufd = objCufd.getString("codigo");
            System.out.println("✅ Cufd: " + cufd);
            factura.put("cufd", cufd);

            // Armando cuf
            String cuf = impuestos.getCuf(
                    factura.getString("nitEmisor") + "",
                    fechaHoraCuf,
                    factura.get("codigoSucursal") + "",
                    1,
                    1,
                    1,
                    "1",
                    factura.get("numeroFactura") + "",
                    factura.get("codigoPuntoVenta") + "",
                    objCufd.get("codigoControl") + "");
            System.out.println("✅ Cuf: " + cuf);
            factura.put("cuf", cuf);
            // factura.put("estado", "emitida");

            String urlImpuestos = "https://pilotosiat.impuestos.gob.bo/consulta/QR?";
            int ambiente = 2;
            if (configSiat.getInt("ambiente") == 1) {
                urlImpuestos = "https://siat.impuestos.gob.bo/consulta/QR?";
                ambiente = 1;
            }
            urlImpuestos += "nit=" + factura.getString("nitEmisor") + "&cuf=" + factura.getString("cuf") + "&numero="
                    + factura.get("numeroFactura") + "&t=1";
            factura.put("urlImpuestos", urlImpuestos);

            // ************
            // Aquí deberia guardar la factura en la base todo local y luego entrar a un
            // hilo para enviar a impuestos
            // automaticamente devolver la factura desde la base con su funcion
            // ************ //

            JSONObject factSave = new JSONObject();
            factSave.put("key", UUID.randomUUID().toString());
            factSave.put("estado", 1);
            factSave.put("state", "emitida");
            factSave.put("fecha_on", SUtil.now());
            factSave.put("key_usuario", obj.getString("key_usuario"));
            factSave.put("key_empresa", obj.getString("key_empresa"));
            factSave.put("data", factura);
            factSave.put("ambiente", ambiente);

            SPGConect.insertArray(tableName, new JSONArray().put(factSave));

            factura.put("key", factSave.getString("key"));

            // Las hago final para que preserven la session mientras vive el hilo
            final JSONObject facturaS = new JSONObject(factura.toString());
            final JSONObject configSiatS = new JSONObject(configSiat.toString());

            if (obj.getBoolean("enviar_siat")) {
                new Thread(() -> {
                    try {
                        System.out.println("iniciando hilo enviador");
                        enviarImpuestos(configSiatS, facturaS);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }).start();
            }
            obj.put("estado", "exito");
            obj.put("data", factura);

        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("data", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public static void duplicar(JSONObject obj, SSSessionAbstract session) {
        try {

            // A diferencia de emitir(): reutiliza el numeroFactura original (no genera uno
            // nuevo)
            // y no guarda en base ni envía a SIAT (bloques comentados abajo, modo de
            // prueba).

            JSONObject factura = new JSONObject();

            factura.put("codigoSucursal", obj.getJSONObject("data").get("codigoSucursal"));
            factura.put("codigoPuntoVenta", obj.getJSONObject("data").get("codigoPuntoVenta"));
            factura.put("codigoMetodoPago", obj.getJSONObject("data").get("codigoMetodoPago"));
            factura.put("codigoTipoDocumentoIdentidad", obj.getJSONObject("data").get("codigoTipoDocumentoIdentidad"));
            factura.put("codigoMoneda", obj.getJSONObject("data").get("codigoMoneda"));
            factura.put("codigoDocumentoSector", obj.getJSONObject("data").get("codigoDocumentoSector"));
            factura.put("leyenda", obj.getJSONObject("data").get("leyenda"));
            factura.put("usuario", obj.getString("key_usuario"));
            factura.put("municipio", obj.getJSONObject("data").getString("municipio"));
            factura.put("telefono", obj.getJSONObject("data").getString("telefono"));

            if (obj.getJSONObject("data").has("numeroTarjeta")) {
                factura.put("numeroTarjeta", obj.getJSONObject("data").getString("numeroTarjeta"));
            }

            if (obj.getJSONObject("data").has("montoGiftCard")) {
                factura.put("montoGiftCard", obj.getJSONObject("data").get("montoGiftCard"));
            }

            if (obj.getJSONObject("data").has("descuentoAdicional")) {
                factura.put("descuentoAdicional", obj.getJSONObject("data").getDouble("descuentoAdicional"));
            }

            if (obj.getJSONObject("data").has("detalle")) {
                factura.put("detalle", obj.getJSONObject("data").getJSONArray("detalle"));
            }

            if (factura.getJSONArray("detalle").length() == 0) {
                obj.put("estado", "error");
                obj.put("error", "La factura no tiene detalle");
                return;
            }

            for (int i = 0; i < factura.getJSONArray("detalle").length(); i++) {
                if (factura.getJSONArray("detalle").getJSONObject(i).get("codigoProductoSin").toString()
                        .length() == 0) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene codigoProducto");
                    return;
                }
                if (factura.getJSONArray("detalle").getJSONObject(i).getString("descripcion").length() < 3) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene descripcion");
                    return;
                }

                if (factura.getJSONArray("detalle").getJSONObject(i).get("unidadMedida").toString().length() == 0) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene unidadMedida");
                    return;
                }

                if (factura.getJSONArray("detalle").getJSONObject(i).getInt("cantidad") <= 0) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene cantidad");
                    return;
                }

                if (factura.getJSONArray("detalle").getJSONObject(i).getDouble("precioUnitario") <= 0) {
                    obj.put("estado", "error");
                    obj.put("error", "El detalle de la factura no tiene precioUnitario");
                    return;
                }

            }

            JSONObject objSend = SocketCliente.sendSinc("empresa",
                    new JSONObject()
                            .put("component", "sucursal")
                            .put("type", "getByCode")
                            .put("codigo", factura.getString("codigoSucursal"))
                            .put("key_empresa", obj.getString("key_empresa")));

            if (objSend.has("estado") && objSend.getString("estado").equals("error")) {
                throw new Exception(objSend.getString("error"));
            }

            JSONObject sucursal = new JSONObject(objSend.getJSONObject("data") + "");

            if (!sucursal.has("direccion")) {
                obj.put("estado", "error");
                obj.put("error", "La sucursal no tiene dirección");
                return;
            }

            if (sucursal.isNull("direccion")) {
                obj.put("estado", "error");
                obj.put("error", "La sucursal no tiene dirección");
                return;
            }

            factura.put("municipio", sucursal.getString("descripcion"));
            factura.put("direccion", sucursal.getString("direccion"));

            objSend = SocketCliente.sendSinc("empresa",
                    new JSONObject()
                            .put("component", "empresa")
                            .put("type", "getByKey")
                            .put("key", sucursal.getString("key_empresa")));

            if (objSend.has("estado") && objSend.getString("estado").equals("error")) {
                throw new Exception(objSend.getString("error"));
            }

            JSONObject empresa = new JSONObject(objSend.getJSONObject("data") + "");

            String CodigoSucursal = obj.optString("codigo_sucursal", "0");
            String CodigoPuntoVenta = obj.optString("codigo_punto_venta", "0");

            JSONObject configSiat = Siat.initSiat(empresa.getString("key"), obj.getInt("ambiente"),
                    empresa.getString("nit"), CodigoSucursal, CodigoPuntoVenta);

            factura.put("nitEmisor", empresa.getString("nit"));

            if (empresa.getString("razon_social").length() < 3) {
                obj.put("estado", "error");
                obj.put("error", "Ingresa la razon social de la empresa");
                return;
            }

            factura.put("razonSocialEmisor", empresa.getString("razon_social"));

            factura.put("numeroDocumento", obj.getJSONObject("data").getString("numeroDocumento"));
            factura.put("complemento", obj.getJSONObject("data").optString("complemento"));

            factura.put("nombreRazonSocial", obj.getJSONObject("data").getString("nombreRazonSocial"));

            if (factura.getInt("codigoTipoDocumentoIdentidad") == 5) {
                String nit = factura.getString("numeroDocumento");
                JSONObject verificarNit = impuestos.verificarNit(configSiat, CodigoSucursal, nit);
                if (verificarNit.getJSONObject("mensajesList").getInt("codigo") != 986) {
                    obj.put("estado", "error");
                    obj.put("error", verificarNit.getJSONObject("mensajesList").getString("descripcion"));
                    return;
                }
            }

            DateFormat formatoCuf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
            SimpleDateFormat formato = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
            Date actual = new Date();
            String fechaHora = formato.format(actual);
            factura.put("fechaEmision", fechaHora);

            Calendar cal = new GregorianCalendar();
            cal.setTime(actual);
            String numeroFactura = obj.getJSONObject("data").getString("numeroFactura");
            factura.put("numeroFactura", numeroFactura);

            String fechaHoraCuf = formatoCuf.format(actual);

            System.out.println("OBteniendo Cuis");
            String cuis = SOAP.getCuis(configSiat).getString("codigo");
            factura.put("cuis", cuis);
            System.out.println("✅ Cuis");

            JSONObject objCufd = SOAP.getCufd(cuis, configSiat, factura.getString("codigoSucursal"),
                    factura.getString("codigoPuntoVenta"));
            String cufd = objCufd.getString("codigo");
            System.out.println("✅ Cufd: " + cufd);
            factura.put("cufd", cufd);

            String cuf = impuestos.getCuf(
                    factura.getString("nitEmisor") + "",
                    fechaHoraCuf,
                    factura.get("codigoSucursal") + "",
                    1,
                    1,
                    1,
                    "1",
                    factura.get("numeroFactura") + "",
                    factura.get("codigoPuntoVenta") + "",
                    objCufd.get("codigoControl") + "");
            System.out.println("✅ Cuf: " + cuf);
            factura.put("cuf", cuf);

            String urlImpuestos = "https://pilotosiat.impuestos.gob.bo/consulta/QR?";
            int ambiente = 2;
            if (configSiat.getInt("ambiente") == 1) {
                urlImpuestos = "https://siat.impuestos.gob.bo/consulta/QR?";
                ambiente = 1;
            }
            urlImpuestos += "nit=" + factura.getString("nitEmisor") + "&cuf=" + factura.getString("cuf") + "&numero="
                    + factura.get("numeroFactura") + "&t=1";
            factura.put("urlImpuestos", urlImpuestos);

            JSONObject factSave = new JSONObject();
            factSave.put("key", UUID.randomUUID().toString());
            factSave.put("estado", 1);
            factSave.put("state", "emitida");
            factSave.put("fecha_on", SUtil.now());
            factSave.put("key_usuario", obj.getString("key_usuario"));
            factSave.put("key_empresa", obj.getString("key_empresa"));
            factSave.put("data", factura);
            factSave.put("ambiente", ambiente);

            SPGConect.insertArray(tableName, new JSONArray().put(factSave));

            factura.put("key", factSave.getString("key"));

            final JSONObject facturaS = new JSONObject(factura.toString());
            final JSONObject configSiatS = new JSONObject(configSiat.toString());

            if (obj.getBoolean("enviar_siat")) {
                new Thread(() -> {
                    try {
                        System.out.println("iniciando hilo enviador");
                        enviarImpuestos(configSiatS, facturaS);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }).start();
            }

            System.out.println("duplicar -> factura generada (sin guardar): " + factura.toString());

            obj.put("estado", "exito");
            obj.put("data", factura);

        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("data", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public static String escapeXml(String input) {
        if (input == null)
            return null;

        return input
                .replace("&", "&amp;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    public static String getFacturaXml(JSONObject factura) {
        DecimalFormat format = new DecimalFormat("0.##");

        double giftCard = 0;

        if (factura.has("montoGiftCard")) {
            giftCard = factura.optDouble("montoGiftCard");
        }
        JSONObject detalle;
        String descuento;
        double ddescuento;
        double total = 0;
        for (int i = 0; i < factura.getJSONArray("detalle").length(); i++) {
            detalle = factura.getJSONArray("detalle").getJSONObject(i);
            ddescuento = 0;
            if (detalle.has("montoDescuento")) {
                ddescuento = detalle.optDouble("montoDescuento");
            }
            total += (detalle.getDouble("precioUnitario") * detalle.getInt("cantidad")) - ddescuento;

        }

        String xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" + //
                "<facturaElectronicaCompraVenta xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"facturaElectronicaCompraVenta.xsd\">\n"
                + //
                "    <cabecera>\n" + //
                "        <nitEmisor>" + factura.getString("nitEmisor") + "</nitEmisor>\n" + //
                "        <razonSocialEmisor>" + factura.getString("razonSocialEmisor") + "</razonSocialEmisor>\n" + //
                "        <municipio>" + factura.getString("municipio") + "</municipio>\n" + //
                "        <telefono>" + factura.getString("telefono") + "</telefono>\n" + //
                "        <numeroFactura>" + factura.getString("numeroFactura") + "</numeroFactura>\n" + //
                "        <cuf>" + factura.getString("cuf") + "</cuf>\n" + //
                "        <cufd>" + factura.getString("cufd") + "</cufd>\n" + //
                "        <codigoSucursal>" + factura.getString("codigoSucursal") + "</codigoSucursal>\n" + //
                "        <direccion>" + factura.getString("direccion") + "</direccion>\n" + //
                "        <codigoPuntoVenta>" + factura.getString("codigoPuntoVenta") + "</codigoPuntoVenta>\n" + //
                "        <fechaEmision>" + factura.getString("fechaEmision") + "</fechaEmision>\n" + //
                "        <nombreRazonSocial>" + factura.getString("nombreRazonSocial") + "</nombreRazonSocial>\n" + //
                "        <codigoTipoDocumentoIdentidad>" + factura.get("codigoTipoDocumentoIdentidad")
                + "</codigoTipoDocumentoIdentidad>\n" + //
                "        <numeroDocumento>" + factura.getString("numeroDocumento") + "</numeroDocumento>\n" + //
                "        <complemento xsi:nil=\"true\"></complemento>\n" + //
                "        <codigoCliente>0</codigoCliente>\n" + //
                "        <codigoMetodoPago>" + factura.get("codigoMetodoPago") + "</codigoMetodoPago>\n";

        if (factura.has("numeroTarjeta") && factura.getString("numeroTarjeta").length() > 0) {
            xml += "        <numeroTarjeta>" + factura.get("numeroTarjeta") + "</numeroTarjeta>\n";
        } else {
            xml += "        <numeroTarjeta xsi:nil=\"true\"></numeroTarjeta>\n";
        }

        xml += "        <montoTotal>" + format.format(total - factura.optDouble("descuentoAdicional", 0))
                + "</montoTotal>\n" + //
                "        <montoTotalSujetoIva>"
                + format.format(total - factura.optDouble("descuentoAdicional", 0) - giftCard)
                + "</montoTotalSujetoIva>\n" + //
                "        <codigoMoneda>" + factura.get("codigoMoneda") + "</codigoMoneda>\n" + //
                "        <tipoCambio>1</tipoCambio>\n" + //
                "        <montoTotalMoneda>" + format.format(total - factura.optDouble("descuentoAdicional", 0))
                + " </montoTotalMoneda>\n";

        if (factura.has("montoGiftCard") && factura.optDouble("montoGiftCard") > 0) {
            xml += "        <montoGiftCard>" + format.format(factura.optDouble("montoGiftCard")) + "</montoGiftCard>\n";
        } else {
            xml += "        <montoGiftCard xsi:nil=\"true\"></montoGiftCard>\n"; //
        }

        if (factura.has("descuentoAdicional")) {
            xml += "        <descuentoAdicional>" + format.format(factura.optDouble("descuentoAdicional", 0))
                    + "</descuentoAdicional>\n"; //
        } else {
            xml += "        <descuentoAdicional>0</descuentoAdicional>\n"; //
        }

        xml += "        <codigoExcepcion xsi:nil=\"true\"></codigoExcepcion>\n" + //
                "        <cafc xsi:nil=\"true\"></cafc>\n" + //
                "        <leyenda>" + factura.get("leyenda") + "</leyenda>\n" + //
                "        <usuario>" + factura.get("usuario") + "</usuario>\n" + //
                "        <codigoDocumentoSector>" + factura.get("codigoDocumentoSector") + "</codigoDocumentoSector>\n"
                + //
                "    </cabecera>\n";//

        for (int i = 0; i < factura.getJSONArray("detalle").length(); i++) {
            detalle = factura.getJSONArray("detalle").getJSONObject(i);

            descuento = "<montoDescuento xsi:nil=\"true\"></montoDescuento>";
            ddescuento = 0;
            if (detalle.has("montoDescuento")) {
                descuento = "<montoDescuento>" + format.format(detalle.optDouble("montoDescuento"))
                        + "</montoDescuento>";
                ddescuento = detalle.optDouble("montoDescuento");
            }
            xml += "    <detalle>\n" + //
                    "        <actividadEconomica>" + detalle.get("actividadEconomica") + "</actividadEconomica>\n" + //
                    "        <codigoProductoSin>" + detalle.get("codigoProductoSin") + "</codigoProductoSin>\n" + //
                    "        <codigoProducto>S/A</codigoProducto>\n" + //
                    "        <descripcion>" + escapeXml(detalle.getString("descripcion")) + "</descripcion>\n" + //
                    "        <cantidad>" + detalle.getInt("cantidad") + "</cantidad>\n" + //
                    "        <unidadMedida>" + detalle.get("unidadMedida") + "</unidadMedida>\n" + //
                    "        <precioUnitario>" + format.format(detalle.getDouble("precioUnitario"))
                    + " </precioUnitario>\n" + //
                    "        " + descuento + "\n" + //
                    "        <subTotal>"
                    + format.format((detalle.getDouble("precioUnitario") * detalle.getInt("cantidad")) - ddescuento)
                    + " </subTotal>\n" + //
                    "        <numeroSerie xsi:nil=\"true\"></numeroSerie>\n" + //
                    "        <numeroImei xsi:nil=\"true\"></numeroImei>\n" + //
                    "    </detalle>\n"; //
        }
        xml += "</facturaElectronicaCompraVenta>";
        return xml;
    }

    public static void enviarImpuestos(JSONObject configSiat, JSONObject _factura) throws Exception {

        System.out.println(">>> ENVIAR IMPUESTOS: Iniciando");
        System.out.println(">>> Número factura: " + _factura.get("numeroFactura"));
        System.out.println(">>> CUF: " + _factura.getString("cuf"));

        System.out.println(">>> Verificando conexión con impuestos...");
        boolean isConected = impuestos.conectarImpuestos(configSiat);
        if (!isConected) {
            throw new Exception("Sin conexión con impuestos");
        }
        System.out.println("✅ Conectado con impuestos");

        System.out.println(">>> Generando XML de factura...");
        String facturaXml = getFacturaXml(_factura);
        System.out.println("✅ XML generado: " + facturaXml.length() + " caracteres");

        System.out.println(">>> Enviando factura a impuestos...");
        JSONObject sendFactura = impuestos.enviarFactura(
                _factura.getString("cuis"),
                _factura.getString("cufd"),
                _factura.getString("fechaEmision"),
                facturaXml,
                configSiat);

        System.out.println(">>> Respuesta de impuestos: " + sendFactura);
        if (sendFactura.getString("estado").equals("exito")) {

            if (sendFactura.has("mensajesList")) {
                sendFactura.put("estado", "error");
                sendFactura.put("error", sendFactura.getJSONArray("mensajesList"));

            }

            if (sendFactura.getBoolean("transaccion")
                    && sendFactura.getString("codigoDescripcion").equals("VALIDADA")) {
                JSONObject fact = Factura.getByKey(_factura.getString("key"));

                fact.put("state", "enviada");
                fact.put("codigo_recepcion", sendFactura.getString("codigoRecepcion"));

                SPGConect.editObject("factura", fact);
            }
        }
    }

    public void verificarEstado(JSONObject obj, SSSessionAbstract session) {
        try {

            String cuf = obj.getString("cuf");
            String codigoSucursal = "0";
            String codigoPuntoVenta = "0";
            JSONObject factura = Factura.getByCuf(cuf);
            JSONObject configSiat = Siat.initSiat(obj.getString("key_empresa"), obj.getInt("ambiente"),
                    factura.getJSONObject("data").getString("nitEmisor"), codigoSucursal, codigoPuntoVenta);

            JSONObject data = impuestos.verificarEstadoFactura(configSiat, cuf, codigoSucursal, codigoPuntoVenta);
            System.out.println(data);
            if (data.getString("codigoDescripcion").equals("ANULADA")) {
                factura.put("state", "anulada");
            }
            if (data.getString("codigoDescripcion").equals("VALIDA")) {
                factura.put("state", "enviada");
            }
            if (data.has("codigoRecepcion")) {
                factura.put("codigo_recepcion", data.getString("codigoRecepcion"));
            }
            // String fact = factura.toStrin÷g().replace("\\", "\\\\\\");
            // JSONObject fact2 = new JSONObject(fact);
            SPGConect.editObject("factura", factura);

            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public void anular(JSONObject obj, SSSessionAbstract session) {
        try {

            String cuf = obj.getString("cuf");
            String codigoSucursal = "0";
            String codigoPuntoVenta = "0";
            JSONObject factura = Factura.getByCuf(cuf);
            JSONObject configSiat = Siat.initSiat(factura.getString("key_empresa"), 1,
                    factura.getJSONObject("data").getString("nitEmisor"), codigoSucursal, codigoPuntoVenta);

            JSONObject data = impuestos.anularFactura(configSiat, cuf, obj.get("codigo_motivo") + "", codigoSucursal,
                    codigoPuntoVenta);
            System.out.println(data);
            if (data.getInt("codigoEstado") == 906 || data.getInt("codigoEstado") == 905) {
                factura.put("state", "anulada");
            }
            if (data.has("codigoRecepcion")) {
                factura.put("codigo_recepcion", data.getString("codigoRecepcion"));
            }

            SPGConect.editObject("factura", factura);

            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public void verificarCuf(JSONObject obj, SSSessionAbstract session) {
        try {

            String cuf = obj.getString("cuf");
            String codigoSucursal = "0";
            String codigoPuntoVenta = "0";

            JSONObject configSiat = Siat.initSiat(obj.getString("key_empresa"), obj.getInt("ambiente"),
                    obj.getString("nit"), codigoSucursal, codigoPuntoVenta);

            JSONObject data = impuestos.verificarEstadoFactura(configSiat, cuf, codigoSucursal, codigoPuntoVenta);
            System.out.println(data);

            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public void anularCuf(JSONObject obj, SSSessionAbstract session) {
        try {

            String cuf = obj.getString("cuf");
            String codigoSucursal = "0";
            String codigoPuntoVenta = "0";
            JSONObject configSiat = Siat.initSiat(obj.getString("key_empresa"), obj.getInt("ambiente"),
                    obj.getString("nit"), codigoSucursal, codigoPuntoVenta);

            JSONObject data = impuestos.anularFactura(configSiat, cuf, obj.get("codigo_motivo") + "", codigoSucursal,
                    codigoPuntoVenta);

            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public void revertir(JSONObject obj, SSSessionAbstract session) {
        try {

            String cuf = obj.getString("cuf");
            String codigoSucursal = "0";
            String codigoPuntoVenta = "0";
            JSONObject factura = Factura.getByCuf(cuf);
            JSONObject configSiat = Siat.initSiat(factura.getString("key_empresa"), 1,
                    factura.getJSONObject("data").getString("nitEmisor"), codigoSucursal, codigoPuntoVenta);

            JSONObject data = impuestos.revertirAnulacionFactura(configSiat, cuf, codigoSucursal, codigoPuntoVenta);
            System.out.println(data);

            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public void verificarNit(JSONObject obj, SSSessionAbstract session) {
        try {

            String codigoSucursal = "0";
            String codigoPuntoVenta = "0";
            JSONObject configSiat = Siat.initSiat(obj.getString("key_empresa"), 1,
                    obj.getString("nitEmisor"), codigoSucursal, codigoPuntoVenta);

            JSONObject verificarNit = impuestos.verificarNit(configSiat, codigoSucursal, obj.getString("nit"));

            obj.put("data", verificarNit);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public void getClientes(JSONObject obj, SSSessionAbstract session) {
        try {
            JSONArray clientes = SPGConect.ejecutarConsultaArray("select get_clientes('" + obj.getString("key_empresa")
                    + "', '" + obj.optString("buscador") + "') as json");
            obj.put("data", clientes);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public void getProductos(JSONObject obj, SSSessionAbstract session) {
        try {
            JSONArray data = SPGConect
                    .ejecutarConsultaArray("select get_productos('" + obj.getString("key_empresa") + "') as json");
            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    // public void editar(JSONObject obj, SSSessionAbstract session) {
    // try {
    // JSONObject data = obj.getJSONObject("data");
    // SPGConect.editObject(tableName, data);
    // obj.put("data", data);
    // obj.put("estado", "exito");
    // } catch (SQLException e) {
    // obj.put("estado", "error");
    // obj.put("error", e.getLocalizedMessage());
    // e.printStackTrace();
    // }
    // }

    public void editar(JSONObject obj, SSSessionAbstract session) {
        try {
            JSONObject data = obj.getJSONObject("data");
            System.out.println(obj);

            if (data.getInt("ambiente") == 1 && data.getString("state").equals("anulada")) {
                obj.put("estado", "error");
                obj.put("error", "No se puede editar esta factura porque fue anulada en el SIAT");
                return;
            }
            if (data.getInt("ambiente") == 1 && data.getString("state").equals("enviada")) {
                obj.put("estado", "error");
                obj.put("error", "No se puede editar esta factura porque fue enviada al SIAT");
                return;
            }
            data.put("ambiente", String.valueOf(data.getInt("ambiente")));
            SPGConect.editObject(tableName, data);
            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (SQLException e) {
            obj.put("estado", "error");
            obj.put("error", e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    public void desc(JSONObject obj, SSSessionAbstract session) {
        try {
            String consulta = "select desc_tabla('" + tableName + "') as json";
            JSONObject data = SPGConect.ejecutarConsultaObject(consulta);
            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (SQLException e) {
            obj.put("estado", "error");
            e.printStackTrace();
        }
    }

    public static String encodeFileToBase64(File file) throws IOException {
        // Leer el archivo como bytes
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] fileBytes = new byte[(int) file.length()];
            fis.read(fileBytes);

            // Codificar los bytes en Base64
            return Base64.getEncoder().encodeToString(fileBytes);
        }
    }

    public void reenviar(JSONObject obj, SSSessionAbstract session) {
        try {
            JSONObject factura = Factura.getByCuf(obj.getString("cuf"));

            String codigoSucursal = "0";
            String codigoPuntoVenta = "0";

            JSONObject configSiat = Siat.initSiat(factura.getString("key_empresa"), 1,
                    factura.getJSONObject("data").getString("nitEmisor"), codigoSucursal, codigoPuntoVenta);

            String cuis = SOAP.getCuis(configSiat).getString("codigo");

            /*
             * JSONObject objCufd = SOAP.getCufd(cuis, configSiat,
             * factura.getJSONObject("data").getString("codigoSucursal"),
             * factura.getJSONObject("data").getString("codigoPuntoVenta"));
             */

            String cufd = factura.getJSONObject("data").getString("cufd");

            String fechaEmisionStr = factura.getJSONObject("data").getString("fechaEmision");

            SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");

            // Parsear la fecha de emisión
            Date fechaEmision = isoFormat.parse(fechaEmisionStr);

            // Calcular FechaIni (100 ms antes) y FechaFin (100 ms después)
            long fechaIniMillis = fechaEmision.getTime() - 100;
            long fechaFinMillis = fechaEmision.getTime() + 100;

            Date fechaIni = new Date(fechaIniMillis);
            Date fechaFin = new Date(fechaFinMillis);

            // Formatear las fechas de nuevo en formato ISO
            String fechaIniStr = isoFormat.format(fechaIni);
            String fechaFinStr = isoFormat.format(fechaFin);

            JSONObject data = impuestos.enviarPaqueteFacturas(cuis, cufd, fechaIniStr, fechaFinStr,
                    new JSONArray().put(Factura.getFacturaXml(factura.getJSONObject("data"))), codigoSucursal,
                    codigoPuntoVenta, configSiat);

            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            obj.put("error", e.getMessage());

            e.printStackTrace();
        }

    }

    public void imprimir(JSONObject obj, SSSessionAbstract session) {
        try {
            JSONObject factura = Factura.getByCuf(obj.getString("cuf"));

            String tipo = obj.optString("tipo", "carta");
            String name;
            if (tipo.equals("carta")) {
                name = SPDF.crearFacturaPdfCarta(obj.getString("cuf"));
            } else if (tipo.equals("rollo")) {
                name = SPDF.crearFacturaPdfRollo(obj.getString("cuf"));
            } else {
                name = SPDF.crearFacturaPdfCarta(obj.getString("cuf"));
            }
            // String name = SPDF.crearFacturaPdfCarta(obj.getString("cuf"));
            String telefono = factura.getJSONObject("data").optString("telefono");
            telefono = telefono.replaceAll(" ", "");
            // sendWtspp(telefono);
            // String consulta = "select desc_tabla('"+tableName+"') as json";
            // JSONObject data = SPGConect.ejecutarConsultaObject(consulta);
            JSONObject data = new JSONObject();
            String base64String = encodeFileToBase64(new File(name));
            data.put("pdf", base64String);
            new File(name).delete();
            obj.put("data", data);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            e.printStackTrace();
        }
    }

    public void importarFromXml(JSONObject obj, SSSessionAbstract session) {
        try {
            // guardo
            // firmo
            //
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            e.printStackTrace();
        }
    }

    public void subirXML(JSONObject obj, SSSessionAbstract session) {
        try {
            String xmlString = obj.getString("xml");

            JSONObject objSend = SocketCliente.sendSinc("empresa",
                    new JSONObject()
                            .put("component", "empresa")
                            .put("type", "getByKey")
                            .put("key", obj.getString("key_empresa")));

            if (objSend.has("estado") && objSend.getString("estado").equals("error")) {
                throw new Exception(objSend.getString("error"));
            }

            // Empresa encontrada
            JSONObject empresa = new JSONObject(objSend.getJSONObject("data") + "");
            JSONObject facturaJson = FacturaXMLtoJSON.parse(xmlString);

            if (facturaJson == null) {
                obj.put("estado", "error");
                obj.put("error", "No se pudo convertir el xml a json");
                return;
            }

            if (!facturaJson.getString("nitEmisor").equals(empresa.getString("nit"))) {
                obj.put("estado", "error");
                obj.put("error", "El nit del emisor no coincide con el de la empresa");
                return;
            }

            if (facturaJson.optString("urlImpuestos").equals("")) {
                String urlImpuestos = "https://pilotosiat.impuestos.gob.bo/consulta/QR?";
                if (obj.getInt("ambiente") == 1) {
                    urlImpuestos = "https://siat.impuestos.gob.bo/consulta/QR?";
                }
                urlImpuestos += "nit=" + facturaJson.getString("nitEmisor") + "&cuf=" + facturaJson.getString("cuf")
                        + "&numero="
                        + facturaJson.get("numeroFactura") + "&t=1";
                facturaJson.put("urlImpuestos", urlImpuestos);
            }

            objSend = new JSONObject();
            objSend.put("key_usuario", obj.getString("key_usuario"));
            objSend.put("key_empresa", obj.getString("key_empresa"));
            objSend.put("ambiente", obj.getInt("ambiente"));
            objSend.put("data", facturaJson);
            objSend.put("state", "emitida");
            objSend.put("estado", 1);
            objSend.put("key", SUtil.uuid());
            objSend.put("fecha_on", SUtil.now());

            SPGConect.insertArray(tableName, new JSONArray().put(objSend));

            JSONObject configSiat = Siat.initSiat(empresa.getString("key"), obj.getInt("ambiente"),
                    empresa.getString("nit"), "0", "0");

            // String cuis = SOAP.getCuis(configSiat).getString("codigo");

            JSONObject objVerificar = new JSONObject();
            objVerificar.put("cuf", facturaJson.getString("cuf"));
            objVerificar.put("ambiente", obj.getInt("ambiente"));
            this.verificarEstado(objVerificar, session);
            // JSONObject enviar = impuestos.enviarFactura(
            // cuis,
            // facturaJson.getString("cufd"),
            // facturaJson.getString("fechaEmision"),
            // xmlString,
            // configSiat);

            // System.out.println(enviar);

            obj.put("data", objSend);
            obj.put("estado", "exito");
        } catch (Exception e) {
            obj.put("estado", "error");
            e.printStackTrace();
        }
    }

    private void sendWtspp(String number) {
        try {
            // URL de la API
            String urlString = "https://wtspp.servisofts.com/send";
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            // Configurar la solicitud
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // JSON a enviar
            JSONObject jsonInput = new JSONObject();
            jsonInput.put("key", "Servisofts");
            jsonInput.put("numero", number);
            jsonInput.put("mensaje", "Factura...");

            // Escribir los datos en la conexión
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInput.toString().getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Leer la respuesta
            int responseCode = conn.getResponseCode();
            System.out.println("Código de respuesta: " + responseCode);
            conn.getInputStream().transferTo(System.out);

            // Cerrar conexión
            conn.disconnect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}