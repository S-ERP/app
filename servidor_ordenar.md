  # ✅ ORDEN DE CONSUMO INICIAL (Secuencial)
  1️⃣  ["roles"]="192.168.5.16"           # rolespermisos ✅ CONFIGURADO
  2️⃣  ["empresa"]="192.168.5.29"         # empresa ✅ CONFIGURADO
  
  # ❌ ORDEN VACÍO (3-9) 
  # Módulos sin componentDidMount implementado:
  # - factura
  # - crm
  # - whatsapp
  # - RolesPermisos
  # - inventario
  # - compra_venta
  # - punto_venta
  # - pizarra
  # - habilidad
  
  # ✅ ORDEN 10
  🔟  ["contabilidad"]="192.168.5.11"    # ✅ CONFIGURADO
  
  # ⚠️ ORDEN 12 (Paralelo) - CRÍTICO
  12️⃣  ["caja"]="192.168.5.45"            # ✅ IP EXISTE pero falta en socket.ts
  12️⃣  ["pasarela"]="???"                 # ❌ FALTA CONFIGURAR - No tiene IP
  12️⃣  ["pasarela_empresa"]="???"         # ❌ FALTA CONFIGURAR - No tiene IP
  
  # 📡 OTROS SERVIDORES (No consumidos en inicialización)
  # ✅ Configurados en socket.ts pero no se llaman en componentDidMount
  ["servicios"]="192.168.5.1"
  ["usuario"]="192.168.5.2"
  ["geolocation"]="192.168.5.5"
  ["contabilidad"]="192.168.5.11"
  ["proyecto"]="192.168.5.14"
  ["drive"]="192.168.5.17"
  ["calistenia"]="192.168.5.18"
  ["facturacion"]="192.168.5.28"
  ["empresa"]="192.168.5.29"           # ✅ Ya consumido en paso 2
  ["zkteco"]="192.168.5.32"
  ["notification"]="192.168.5.33"
  ["sqr"]="192.168.5.34"
  ["inventario"]="192.168.5.39"
  ["compra-venta"]="192.168.5.41"      # Configurado pero sin componentDidMount
  ["caja"]="192.168.5.45"              # ✅ Ya consumido en paso 12
  ["spdf"]="192.168.5.46"
  ["serp"]="192.168.5.48"
  ["crm"]="192.168.5.51"               # Configurado pero sin componentDidMount
  
  # 🌐 INFRAESTRUCTURA (Red/Proxy)
  ["nginx"]="192.168.2.3"
  ["wireguard"]="192.168.2.4"
  
  # ⚠️ PENDIENTE AGREGAR EN socket.ts
  # ["pasarela"]="???"                 # ❌ FALTA IP y configuración
  # ["pasarela_empresa"]="???"         # ❌ FALTA IP y configuración
