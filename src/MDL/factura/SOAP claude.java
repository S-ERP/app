package Utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;
import org.json.JSONObject;
import org.json.XML;
import org.w3c.dom.Document;
import Component.impuestos;

public class SOAP {

    public static final int connectTimeout = 6000;
    public static final int readTimeout = 6000;

    public static String getDocument(String url) {
        try {

            InputStream inputStream = new FileInputStream(new File(url));
            if (inputStream == null) {
                throw new FileNotFoundException("El archivo no se encontró: " + url);
            }

            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(inputStream);
            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(doc), new StreamResult(writer));
            return writer.getBuffer().toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static JSONObject verificarComunicacion(JSONObject siat) throws Exception {

        String urlImpuestos = siat.getString("urlImpuestosPrueba");
        String token = siat.getString("tokenPrueba");
        if (siat.getInt("ambiente") == 1) {
            urlImpuestos = siat.getString("urlImpuestosProduccion");
            token = siat.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionCodigos";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/verificarComunicacion.xml");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:verificarComunicacionResponse")
                    .getJSONObject("RespuestaComunicacion");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject getPuntoVenta(JSONObject siat, String cuis, String codigoSucursal) throws Exception {

        String urlImpuestos = siat.getString("urlImpuestosPrueba");
        String token = siat.getString("tokenPrueba");
        if (siat.getInt("ambiente") == 1) {
            urlImpuestos = siat.getString("urlImpuestosProduccion");
            token = siat.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionOperaciones";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/getPuntoVenta.xml");
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", siat.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", siat.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__NIT__", siat.getString("nit"));
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:consultaPuntoVentaResponse")
                    .getJSONObject("RespuestaConsultaPuntoVenta");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject verificarNit(JSONObject siat, String cuis, String codigoSucursal, String nitVerificar)
            throws Exception {

        String urlImpuestos = siat.getString("urlImpuestosPrueba");
        String token = siat.getString("tokenPrueba");
        if (siat.getInt("ambiente") == 1) {
            urlImpuestos = siat.getString("urlImpuestosProduccion");
            token = siat.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionCodigos";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/verificarNit.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_AMBIENTE__", siat.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", siat.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__CODIGO_MODALIDAD__", "1");
        xmlInput = xmlInput.replaceAll("__CODIGO_SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__NIT__", siat.getString("nit"));
        xmlInput = xmlInput.replaceAll("__NIT_VERIFICAR__", nitVerificar);

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:verificarNitResponse")
                    .getJSONObject("RespuestaVerificarNit");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject registroPuntoVenta(JSONObject siat, String cuis, String codigoSucursal, String nombre,
            String descripcion) throws Exception {

        String urlImpuestos = siat.getString("urlImpuestosPrueba");
        String token = siat.getString("tokenPrueba");
        if (siat.getInt("ambiente") == 1) {
            urlImpuestos = siat.getString("urlImpuestosProduccion");
            token = siat.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionOperaciones";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/setPuntoVenta.xml");
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", siat.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", siat.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__TIPO_PUNTO_VENTA__", "5");
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__DESCRIPCION__", descripcion);
        xmlInput = xmlInput.replaceAll("__NIT__", siat.getString("nit"));
        xmlInput = xmlInput.replaceAll("__NOMBRE__", nombre);
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:registroPuntoVentaResponse")
                    .getJSONObject("RespuestaRegistroPuntoVenta");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject closePuntoVenta(JSONObject siat, String cuis, String codigoSucursal,
            String codigoPuntoVenta) throws Exception {

        String urlImpuestos = siat.getString("urlImpuestosPrueba");
        String token = siat.getString("tokenPrueba");
        if (siat.getInt("ambiente") == 1) {
            urlImpuestos = siat.getString("urlImpuestosProduccion");
            token = siat.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionOperaciones";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/closePuntoVenta.xml");
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", siat.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__CODIGO_PUNTO_VENTA__", codigoPuntoVenta);
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", siat.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__NIT__", siat.getString("nit"));
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:cierrePuntoVentaResponse")
                    .getJSONObject("RespuestaCierrePuntoVenta");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject getCuis(JSONObject siat) throws Exception {

        System.out.println(">>> getCuis: Iniciando");
        String urlImpuestos = siat.getString("urlImpuestosPrueba");
        String token = siat.getString("tokenPrueba");
        int ambiente = siat.getInt("ambiente");

        if (ambiente == 1) {
            urlImpuestos = siat.getString("urlImpuestosProduccion");
            token = siat.getString("tokenProduccion");
            System.out.println(">>> Ambiente PRODUCCIÓN");
        } else {
            System.out.println(">>> Ambiente PRUEBAS");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionCodigos";
        System.out.println(">>> URL SIAT: " + wsURL);
        System.out.println(">>> Connect Timeout: " + connectTimeout + "ms");
        System.out.println(">>> Read Timeout: " + readTimeout + "ms");

        long startTime = System.currentTimeMillis();
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/getCuis.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", siat.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", siat.getString("nit"));
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", siat.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", siat.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", siat.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();
        System.out.println(">>> XML preparado: " + b.length + " bytes");

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);

        System.out.println(">>> Enviando solicitud CUIS a SIAT...");
        OutputStream out = httpConn.getOutputStream();
        out.write(b);
        out.close();
        System.out.println("✅ Solicitud enviada");

        System.out.println(">>> Esperando respuesta de SIAT...");
        long elapsedTime = System.currentTimeMillis() - startTime;
        System.out.println(">>> Tiempo hasta respuesta: " + elapsedTime + "ms");

        int responseCode = httpConn.getResponseCode();
        System.out.println(">>> Response Code: " + responseCode);

        InputStreamReader isr = null;
        if (responseCode == 200) {
            System.out.println("✅ Respuesta 200 OK");
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            System.out.println("⚠️ Response Code: " + responseCode);
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }
        System.out.println("✅ Respuesta recibida: " + outputString.length() + " caracteres");

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
            System.out.println("❌ Error SOAP: " + obj.toString());
            throw new Exception(obj.toString());
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:cuisResponse")
                    .getJSONObject("RespuestaCuis");
            if (!obj.has("codigo")) {
                System.out.println("❌ CUIS no obtenido");
                throw new Exception(obj.optJSONObject("mensajesList").toString());
            }
            obj.put("estado", "exito");
            System.out.println("✅ getCuis completado con CUIS: " + obj.getString("codigo"));
        }
        return obj;

    }

    public static JSONObject getCufd(String cuis, JSONObject siat, String codigoSucursal, String codigoPuntoVenta)
            throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionCodigos";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/getCufd.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", codigoPuntoVenta);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:cufdResponse")
                    .getJSONObject("RespuestaCufd");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncFechaHora(String cuis, JSONObject siat, String codigoSucursal, String codigoPuntoVenta)
            throws Exception {

        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncFechaHora.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", codigoPuntoVenta);

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarFechaHoraResponse")
                    .getJSONObject("RespuestaFechaHora");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncActividadesEconomicas(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncActividadesEconomicas.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarActividadesResponse")
                    .getJSONObject("RespuestaListaActividades");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncTipoEmision(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncTipoEmision.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaTipoEmisionResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncTipoMoneda(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncTipoMoneda.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaTipoMonedaResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncUnidadMedida(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncUnidadMedida.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaUnidadMedidaResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncMotivoAnulacion(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncMotivoAnulacion.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaMotivoAnulacionResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncTipoFactura(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncTipoFactura.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaTiposFacturaResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncEvtSignificativo(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncEvtSignificativo.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaEventosSignificativosResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncProductosServicios(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncProductosServicios.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarListaProductosServiciosResponse")
                    .getJSONObject("RespuestaListaProductos");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncMensajesServicios(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncMensajesServicios.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarListaMensajesServiciosResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncTipoDocumentoIdentidad(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncTipoDocumentoIdentidad.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaTipoDocumentoIdentidadResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncPaisOrigen(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncPaisOrigen.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaPaisOrigenResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncMetodoPago(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncMetodoPago.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaTipoMetodoPagoResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncLeyendasFactura(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncLeyendasFactura.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarListaLeyendasFacturaResponse")
                    .getJSONObject("RespuestaListaParametricasLeyendas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncTipoDocSector(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncTipoDocSector.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaTipoDocumentoSectorResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncTipoPuntoVenta(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncTipoPuntoVenta.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaTipoPuntoVentaResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncActividadesDocSector(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncActividadesDocSector.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarListaActividadesDocumentoSectorResponse")
                    .getJSONObject("RespuestaListaActividadesDocumentoSector");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject syncTiposHabitacion(String cuis, JSONObject siat) throws Exception {
        JSONObject config = siat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionSincronizacion";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/syncTiposHabitacion.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:sincronizarParametricaTipoHabitacionResponse")
                    .getJSONObject("RespuestaListaParametricas");
            obj.put("estado", "exito");
        }
        return obj;

    }

    public static JSONObject getEventosSignificativos(String cuis, String cufd, String fecha, JSONObject config)
            throws Exception {
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionOperaciones";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/getEventosSignificativos.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        xmlInput = xmlInput.replaceAll("__CUFD__", cufd);
        xmlInput = xmlInput.replaceAll("__FECHA__", fecha);
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:consultaEventoSignificativoResponse")
                    .getJSONObject("RespuestaListaEventos");
            obj.put("estado", "exito");
        }
        return obj;
    }

    public static JSONObject setEventoSignificativo(String cuis, String cufd, String codigoEvento, String descripcion,
            String fechaInicio, String fechaFin, String cufdEvento, JSONObject config) throws Exception {
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "FacturacionOperaciones";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/setEventoSignificativo.xml");
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__CUFD__", cufd);
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");

        xmlInput = xmlInput.replaceAll("__CODIGO_EVENTO__", codigoEvento);
        xmlInput = xmlInput.replaceAll("__DESCRIPCION__", descripcion);
        xmlInput = xmlInput.replaceAll("__FECHA_INICIO__", fechaInicio);
        xmlInput = xmlInput.replaceAll("__FECHA_FIN__", fechaFin);
        xmlInput = xmlInput.replaceAll("__CUFD_EVENTO__", cufdEvento);
        xmlInput = xmlInput.replaceAll("__CODIGO_MOTIVO_EVENTO__", "1");

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:registroEventoSignificativoResponse")
                    .getJSONObject("RespuestaListaEventos");
            obj.put("estado", "exito");
        }
        return obj;
    }

    public static JSONObject enviarFactura(String cuis, String cufd, String fechaEnvio, String factura,
            JSONObject configSiat) throws Exception {
        JSONObject config = configSiat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        /*
         * La factura me llega en texto en formato xml
         * Primero la firmo con el SSL de la empresa
         * Luego debo validarla con el xsd para saber si esta bien formada
         * luego comprimo a Gzip
         * Luego obtengo el hash y envio ambos, el byte[] del Gzip y el hash
         */

        // Guardando la factura
        try (BufferedWriter bw = new BufferedWriter(
                new FileWriter(Config.getJSON().getJSONObject("files").getString("url") + "/facturas/factura.xml"))) {
            bw.write(factura);
            System.out.println("Factura escrita correctamente.");
        } catch (IOException e) {
            System.err.println("Ocurrió un error al escribir la factura: " + e.getMessage());
            return new JSONObject().put("estado", "error").put("error",
                    "No se logro escribir la factura: " + e.getMessage());
        }

        // Firmado la factura con el SSL de la empresa
        System.out.println(">>> SOAP: Iniciando firma de factura");
        String facturaFirmada = impuestos.getFacturaFirmada(factura, configSiat);
        if (facturaFirmada == null) {
            System.err.println("❌ SOAP: No se logró firmar la factura");
            System.err.println(">>> Verificar logs anteriores de getFacturaFirmada para más detalles");
            return new JSONObject().put("estado", "error").put("error", "No se logró firmar la factura - revisar certificado digital");
        }
        System.out.println("✅ SOAP: Factura firmada exitosamente");
        System.out.println(facturaFirmada);

        // Agregamos la cabecera porque por algun motivo que no se, la quita
        facturaFirmada = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + facturaFirmada;

        System.out.println("************* Guardando la factura firmada ************");
        try (BufferedWriter bw = new BufferedWriter(
                new FileWriter(Config.getJSON().getJSONObject("files").getString("url") + "/facturas/factura.xml"))) {
            bw.write(facturaFirmada);
            System.out.println("Factura escrita correctamente.");
        } catch (IOException e) {
            System.err.println("Ocurrió un error al escribir la factura: " + e.getMessage());
            return new JSONObject().put("estado", "error").put("error",
                    "No se logro escribir la factura: " + e.getMessage());
        }

        // Validar factura con el xsd
        boolean validar = SOAP.validarXml("factura");
        if (!validar)
            return new JSONObject().put("estado", "error").put("error", "Factura no validada por el xsd.");

        byte[] compresedGzip = impuestos.comprimirGzip(facturaFirmada.getBytes());
        String hash = impuestos.sha256(compresedGzip);

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "ServicioFacturacionCompraVenta";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/sendFactura.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        xmlInput = xmlInput.replaceAll("__CUFD__", cufd);
        xmlInput = xmlInput.replaceAll("__CODIGO_EMISION__", "1"); // 1 Online 2 Offline
        xmlInput = xmlInput.replaceAll("__TIPO_FACTURA_DOCUMENTO__", "1"); // 1 Documento sector en nuestro caso siempre
                                                                           // 1
        xmlInput = xmlInput.replaceAll("__FECHA_ENVIO__", fechaEnvio);
        xmlInput = xmlInput.replaceAll("__ARCHIVO__", Base64.getEncoder().encodeToString(compresedGzip));
        xmlInput = xmlInput.replaceAll("__HASH_ARCHIVO__", hash);
        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:recepcionFacturaResponse")
                    .getJSONObject("RespuestaServicioFacturacion");
            obj.put("estado", "exito");
        }
        return obj;
    }

    public static JSONObject anular(String cuf, String cuis, String cufd, String codigoSucursal,
            String codigoPuntoVenta, String codigoMotivo, JSONObject configSiat) throws Exception {
        JSONObject config = configSiat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "ServicioFacturacionCompraVenta";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/anulacionFactura.xml");
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", codigoPuntoVenta);
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));

        xmlInput = xmlInput.replaceAll("__TIPO_FACTURA_DOCUMENTO__", "1");

        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        // cddigo documento sector 1
        xmlInput = xmlInput.replaceAll("__CODIGO_EMISION__", "1"); // 1 Online 2 Offline
        // codigo modealidad 1
        xmlInput = xmlInput.replaceAll("__CUFD__", cufd);
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__CODIGO_MOTIVO__", codigoMotivo);
        xmlInput = xmlInput.replaceAll("__CUF__", cuf);

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:anulacionFacturaResponse")
                    .getJSONObject("RespuestaServicioFacturacion");
            obj.put("estado", "exito");
        }
        return obj;
    }

    public static JSONObject verificarEstado(String cuf, String cuis, String cufd, String codigoSucursal,
            String codigoPuntoVenta, JSONObject configSiat) throws Exception {
        JSONObject config = configSiat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "ServicioFacturacionCompraVenta";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/verificacionEstadoFactura.xml");
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", codigoPuntoVenta);
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));

        xmlInput = xmlInput.replaceAll("__TIPO_FACTURA_DOCUMENTO__", "1");

        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        // cddigo documento sector 1
        xmlInput = xmlInput.replaceAll("__CODIGO_EMISION__", "1"); // 1 Online 2 Offline
        // codigo modealidad 1
        xmlInput = xmlInput.replaceAll("__CUFD__", cufd);
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__CUF__", cuf);

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        System.err.println(outputString);

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:verificacionEstadoFacturaResponse")
                    .getJSONObject("RespuestaServicioFacturacion");
            obj.put("estado", "exito");
        }
        return obj;
    }

    public static JSONObject revertir(String cuf, String cuis, String cufd, String codigoSucursal,
            String codigoPuntoVenta, JSONObject configSiat) throws Exception {
        JSONObject config = configSiat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "ServicioFacturacionCompraVenta";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        String xmlInput = SOAP.getDocument("xmls/anulacionFacturaReversion.xml");
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", codigoPuntoVenta);
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));

        xmlInput = xmlInput.replaceAll("__TIPO_FACTURA_DOCUMENTO__", "1");

        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        // cddigo documento sector 1
        xmlInput = xmlInput.replaceAll("__CODIGO_EMISION__", "1"); // 1 Online 2 Offline
        // codigo modealidad 1
        xmlInput = xmlInput.replaceAll("__CUFD__", cufd);
        xmlInput = xmlInput.replaceAll("__CUIS__", cuis);
        xmlInput = xmlInput.replaceAll("__CUF__", cuf);

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:reversionAnulacionFacturaResponse")
                    .getJSONObject("RespuestaServicioFacturacion");
            obj.put("estado", "exito");
        }
        return obj;
    }

    public static JSONObject enviarPaqueteFactura(String cufd, String fechaInicio, String fechaFin,
            int cantidadFacturas, JSONObject configSiat, String codigoSucursal, String codigoPuntoVenta)
            throws Exception {
        JSONObject config = configSiat;
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        /*
         * La factura me llega en texto en formato xml
         * Primero la firmo con el SSL de la empresa
         * Luego debo validarla con el xsd para saber si esta bien formada
         * luego comprimo a Gzip
         * Luego obtengo el hash y envio ambos, el byte[] del Gzip y el hash
         */

        byte[] compresedGzip = impuestos.comprimirGzip(Files
                .readAllBytes(new File("paquetesFactura/" + impuestos.formatCUFDtoFileName(cufd) + ".tar").toPath()));
        String hash = impuestos.sha256(compresedGzip);

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "ServicioFacturacionCompraVenta";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        JSONObject cuis = SOAP.getCuis(configSiat);
        String scuis = cuis.getString("codigo");

        JSONObject cufdNew = SOAP.getCufd(scuis, configSiat, codigoSucursal, codigoPuntoVenta);

        JSONObject evtSign = impuestos.getEventoSignificativo(
                scuis,
                cufdNew.getString("codigo"), // cufdnuevo
                fechaInicio,
                fechaFin,
                cufd, // cufd antiguo
                configSiat);

        if (evtSign.has("transaccion") && !evtSign.getBoolean("transaccion")) {
            System.out.println("❌ " + evtSign);
            return null;
        }

        if (evtSign.has("mensajesList")) {
            System.out.println("❌ " + evtSign.getJSONObject("mensajesList").getString("descripcion"));
            return null;
        }

        SimpleDateFormat formato = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
        Date actual = new Date();
        String fechaHora = formato.format(actual);

        String xmlInput = SOAP.getDocument("xmls/sendPaqueteFactura.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", scuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", config.get("codigoSucursal") + "");
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", config.get("codigoPuntoVenta") + "");
        xmlInput = xmlInput.replaceAll("__CUFD__", cufdNew.getString("codigo"));
        xmlInput = xmlInput.replaceAll("__CODIGO_EMISION__", "2"); // 1 Online 2 Offline
        xmlInput = xmlInput.replaceAll("__TIPO_FACTURA_DOCUMENTO__", "1"); // 1 Documento sector en nuestro caso siempre
                                                                           // 1
        xmlInput = xmlInput.replaceAll("__FECHA_ENVIO__", fechaHora);
        xmlInput = xmlInput.replaceAll("__ARCHIVO__", Base64.getEncoder().encodeToString(compresedGzip));
        xmlInput = xmlInput.replaceAll("__HASH_ARCHIVO__", hash);
        xmlInput = xmlInput.replaceAll("__CANTIDAD_FACTURAS__", cantidadFacturas + "");
        xmlInput = xmlInput.replaceAll("__CODIGO_EVENTO__", evtSign.get("codigoRecepcionEventoSignificativo") + "");

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:recepcionPaqueteFacturaResponse")
                    .getJSONObject("RespuestaServicioFacturacion");
            obj.put("estado", "exito");
        }
        System.out.println(obj);
        return obj;
    }

    public static JSONObject verificarEstadoPaqueteFacturas(String codigoRecepcion, JSONObject siat,
            String codigoSucursal, String codigoPuntoVenta) throws Exception {
        JSONObject config = Config.getJSON();
        String urlImpuestos = config.getString("urlImpuestosPrueba");
        String token = config.getString("tokenPrueba");
        if (config.getInt("ambiente") == 1) {
            urlImpuestos = config.getString("urlImpuestosProduccion");
            token = config.getString("tokenProduccion");
        }

        String responseString = "";
        String outputString = "";
        String wsURL = urlImpuestos + "ServicioFacturacionCompraVenta";
        URL url = new URL(wsURL);
        URLConnection connection = url.openConnection();
        HttpURLConnection httpConn = (HttpURLConnection) connection;
        ByteArrayOutputStream bout = new ByteArrayOutputStream();

        JSONObject cuis = SOAP.getCuis(siat);
        String scuis = cuis.getString("codigo");
        JSONObject cufd_ = SOAP.getCufd(scuis, siat, codigoSucursal, codigoPuntoVenta);
        String cufd = cufd_.getString("codigo");

        String xmlInput = SOAP.getDocument("xmls/getEstadoPaquete.xml");
        xmlInput = xmlInput.replaceAll("__CODIGO_SISTEMA__", config.getString("codigoSistema"));
        xmlInput = xmlInput.replaceAll("__NIT__", config.getString("nit"));
        xmlInput = xmlInput.replaceAll("__CUIS__", scuis);
        xmlInput = xmlInput.replaceAll("__AMBIENTE__", config.get("ambiente") + "");
        xmlInput = xmlInput.replaceAll("__SUCURSAL__", codigoSucursal);
        xmlInput = xmlInput.replaceAll("__PUNTO_VENTA__", codigoPuntoVenta);
        xmlInput = xmlInput.replaceAll("__CUFD__", cufd);
        xmlInput = xmlInput.replaceAll("__CODIGO_EMISION__", "2"); // 1 Online 2 Offline
        xmlInput = xmlInput.replaceAll("__TIPO_FACTURA_DOCUMENTO__", "1");
        xmlInput = xmlInput.replaceAll("__CODIGO_RECEPCION__", codigoRecepcion);

        byte[] buffer = new byte[xmlInput.length()];
        buffer = xmlInput.getBytes();
        bout.write(buffer);
        byte[] b = bout.toByteArray();

        httpConn.setConnectTimeout(connectTimeout);
        httpConn.setReadTimeout(readTimeout);
        httpConn.setRequestProperty("apikey", "TokenApi " + token);
        httpConn.setRequestProperty("Content-Length", String.valueOf(b.length));
        httpConn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        httpConn.setRequestMethod("POST");
        httpConn.setDoOutput(true);
        httpConn.setDoInput(true);
        OutputStream out = httpConn.getOutputStream();

        out.write(b);
        out.close();

        InputStreamReader isr = null;
        if (httpConn.getResponseCode() == 200) {
            isr = new InputStreamReader(httpConn.getInputStream());
        } else {
            isr = new InputStreamReader(httpConn.getErrorStream());
        }

        BufferedReader in = new BufferedReader(isr);

        while ((responseString = in.readLine()) != null) {
            outputString = outputString + responseString;
        }

        JSONObject obj = XML.toJSONObject(outputString);
        if (obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").has("soap:Fault")) {
            obj = obj.getJSONObject("soap:Envelope").getJSONObject("soap:Body").getJSONObject("soap:Fault");
            obj.put("estado", "error");
        } else {
            obj = obj.getJSONObject("soap:Envelope")
                    .getJSONObject("soap:Body")
                    .getJSONObject("ns2:validacionRecepcionPaqueteFacturaResponse")
                    .getJSONObject("RespuestaServicioFacturacion");
            obj.put("estado", "exito");
        }
        return obj;
    }

    public static boolean validarXml(String nombreFactura) {
        try {
            SchemaFactory factory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
            File schemaFile = new File("xsds/facturaElectronicaCompraVenta.xsd");
            Schema schema = factory.newSchema(schemaFile);
            Validator validator = schema.newValidator();
            Source xmlFile = new StreamSource(new File(
                    Config.getJSON().getJSONObject("files").getString("url") + "/facturas/" + nombreFactura + ".xml"));
            validator.validate(xmlFile);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
