import { Component } from "react";
import { SPage } from "servisofts-component";
import Model from "../Model";

export default class Test extends Component {
  state = {
    loading: false,
    mensaje: "",
    backups: [],
    cargandoBackups: false,
  };

  componentDidMount() {
    this.cargarBackups();
  }

  cargarBackups = async () => {
    this.setState({ cargandoBackups: true });
    try {
      const empresa = Model.empresa.Action.getSelect();
      if (!empresa) {
        this.setState({ mensaje: "Selecciona una empresa primero", cargandoBackups: false });
        return;
      }

      const response = await Model.alvaro.Action.listarBackups(empresa.key);
      let backupsList = [];

      if (response && response.data) {
        const data = response.data;
        if (Array.isArray(data)) {
          backupsList = data;
        } else if (typeof data === 'object' && data !== null) {
          backupsList = Object.values(data);
        }
      }

      this.setState({ backups: backupsList, cargandoBackups: false });
    } catch (error) {
      this.setState({
        mensaje: "Error al cargar backups: " + error.message,
        cargandoBackups: false
      });
    }
  };

  crearBackup = async () => {
    this.setState({ loading: true, mensaje: "" });
    try {
      const empresa = Model.empresa.Action.getSelect();
      const usuario = Model.usuario.Action.getKey();

      if (!empresa || !usuario) {
        this.setState({ mensaje: "Falta seleccionar empresa o usuario" });
        this.setState({ loading: false });
        return;
      }

      const response = await Model.alvaro.Action.crearBackup({
        key_usuario: usuario,
        key_empresa: empresa.key,
        nombre: `Backup ${new Date().toLocaleString()}`,
        descripcion: "Backup creado desde prueba",
      });

      if (response.estado === "exito") {
        this.setState({ mensaje: "✓ Backup creado exitosamente" });
        this.cargarBackups();
      } else {
        this.setState({ mensaje: "✗ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "✗ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  restaurarBackup = async (backupKey) => {
    this.setState({ loading: true, mensaje: "" });
    try {
      const usuario = Model.usuario.Action.getKey();
      const response = await Model.alvaro.Action.restaurarBackup(backupKey, usuario);

      if (response.estado === "exito") {
        this.setState({ mensaje: "✓ Backup restaurado exitosamente" });
        this.cargarBackups();
      } else {
        this.setState({ mensaje: "✗ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "✗ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  eliminarBackup = async (backupKey) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este backup?")) {
      return;
    }

    this.setState({ loading: true, mensaje: "" });
    try {
      const usuario = Model.usuario.Action.getKey();
      const response = await Model.alvaro.Action.eliminarBackup(backupKey, usuario);

      if (response.estado === "exito") {
        this.setState({ mensaje: "✓ Backup eliminado exitosamente" });
        this.cargarBackups();
      } else {
        this.setState({ mensaje: "✗ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "✗ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  renderBackupItem = (backup) => {
    const { loading } = this.state;

    if (!backup || typeof backup !== 'object') {
      return null;
    }

    return (
      <div
        key={backup.key || Math.random()}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "10px",
          backgroundColor: "#f9f9f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
            {backup.nombre || "Backup sin nombre"}
          </p>
          <small style={{ color: "#666" }}>{backup.descripcion || "-"}</small>
          <br />
          <small style={{ color: "#999" }}>
            {backup.fecha_creacion ? new Date(backup.fecha_creacion).toLocaleString() : "Fecha desconocida"}
          </small>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => this.restaurarBackup(backup.key)}
            disabled={loading}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              backgroundColor: "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Restaurar
          </button>
          <button
            onClick={() => this.eliminarBackup(backup.key)}
            disabled={loading}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    );
  };

  render() {
    const { loading, mensaje, backups, cargandoBackups } = this.state;

    return (
      <SPage title="Alvaro - Sistema de Backups">
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ color: "#333", marginTop: 0 }}>Gestión de Backups</h2>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={this.crearBackup}
              disabled={loading}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: loading ? "#ccc" : "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                marginRight: "10px",
              }}
            >
              {loading ? "Creando..." : "✓ Crear Nuevo Backup"}
            </button>

            <button
              onClick={this.cargarBackups}
              disabled={cargandoBackups}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: cargandoBackups ? "#ccc" : "#95a5a6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: cargandoBackups ? "not-allowed" : "pointer",
              }}
            >
              {cargandoBackups ? "Cargando..." : "🔄 Recargar"}
            </button>
          </div>

          {mensaje && (
            <div
              style={{
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "4px",
                backgroundColor: mensaje.includes("✓") ? "#d4edda" : "#f8d7da",
                color: mensaje.includes("✓") ? "#155724" : "#721c24",
                border: `1px solid ${mensaje.includes("✓") ? "#c3e6cb" : "#f5c6cb"}`,
              }}
            >
              {mensaje}
            </div>
          )}

          <div>
            <h3 style={{ color: "#333", marginTop: "20px" }}>
              Backups Disponibles ({Array.isArray(backups) ? backups.length : 0})
            </h3>

            {!Array.isArray(backups) || backups.length === 0 ? (
              <p style={{ color: "#999" }}>No hay backups disponibles</p>
            ) : (
              backups.filter(b => b).map((backup) => this.renderBackupItem(backup))
            )}
          </div>
        </div>
      </SPage>
    );
  }
}
