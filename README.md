
nvm install 14.18.0
nvm use 14.18.0

./gradlew clean --info --stacktrace         
 export PATH=$PATH:/Applications/CMake.app/Contents/bin/
./gradlew assembleDebug                                 


adb devices
     List of devices attached
    AGT0219828000767        device

    
cd app/build/outputs/apk/debug 
adb install app-debug.apk 





# Etapa 1 -  Configuracion inicial.

### Usuarios
- Registramos nuestro usuarios.
- Asignamos usuarios a la empresa.

### Empresa
- Registro de empresa.
- Creamos las sucursales.
- Creamos los puntos de ventas.
- Habilitamos metodos de pago al punto de venta.


### Bancos
- Creamos bancos
- Registramos cuentas de bancos.


### Productos
- Creamos tipos de productos
- Agregamos datos informativos por cada tipo de producto. 
- Creamos marcas
- Creamos modelos


### Creacion del plan de cuentas.
- Creamos o subimos un plan de cuentas para usar en la empresa.






# Etapa 2 - Configuracion de cuentas
## Configuraciones de contabilidad

- contabilidad >  Ajustes > `Selecionamos la cuenta por cobrar y la cuenta por pagar`

- sucursales > seleccionamos sucursal  > Puntos de ventas > seleccionamos el punto de venta > `Seleccionamos Cuenta de caja en moneda nacional` > `Habilitamos los tipos de pagos disponibles para este punto de ventas y su cuenta del plan de cuentas.`

- bancos > Seleccionamos  el banco > Seleccionamos la cuenta de banco > `Seleccionamos la cuenta contable que sera relacionada a la cuenta de banco` 

- productos > tipos de productos > seleccionar tipo de producto > `Seleccionar la cuenta contable de activos`




# Etapa 3 - Compras, ventas, almacenes.
### Compras
### Recepcion en almacen de productos comrpados
### Ventas
### Despacho de almacen de productos vendidos.



# Etapa 4 - Cajas



# Etapa 5 - Reportes