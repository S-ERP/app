import { Component } from "react";
import { SPage } from "servisofts-component";
import Model from "../Model";

export default class Test extends Component {
  state = {
    loading: false,
    mensaje: "",
    backupsBackend: [],
    backupsFrontend: [],
    cargandoBackupBackend: false,
    cargandoBackupFrontend: false,
  };

  componentDidMount() {
    this.cargarBackupsBackend();
    this.cargarBackupsFrontend();
  }

  crearBackupBackend = async () => {
    this.setState({ loading: true, mensaje: "" });
    try {
      const empresa = Model.empresa.Action.getSelect();
      const usuario = Model.usuario.Action.getKey();

      if (!empresa || !usuario) {
        this.setState({ mensaje: "⚠️ Falta seleccionar empresa o usuario", loading: false });
        return;
      }

      const response = await Model.alvaro.Action.crearBackupBackend({
        key_usuario: usuario,
        key_empresa: empresa.key,
        nombre: `Backup Backend ${new Date().toLocaleString()}`,
        descripcion: "Backup backend creado desde prueba",
      });

      if (response.estado === "exito") {
        this.setState({ mensaje: "✅ Backup backend creado exitosamente" });
        setTimeout(() => this.cargarBackupsBackend(), 1000);
      } else {
        this.setState({ mensaje: "❌ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "❌ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  crearBackupFrontend = async () => {
    this.setState({ loading: true, mensaje: "" });
    try {
      const empresa = Model.empresa.Action.getSelect();
      const usuario = Model.usuario.Action.getKey();

      if (!empresa || !usuario) {
        this.setState({ mensaje: "⚠️ Falta seleccionar empresa o usuario", loading: false });
        return;
      }

      const response = await Model.alvaro.Action.crearBackupFrontend({
        key_usuario: usuario,
        key_empresa: empresa.key,
        nombre: `Backup Frontend ${new Date().toLocaleString()}`,
        descripcion: "Backup frontend creado desde prueba",
      });

      if (response.estado === "exito") {
        this.setState({ mensaje: "✅ Backup frontend creado exitosamente" });
        setTimeout(() => this.cargarBackupsFrontend(), 1000);
      } else {
        this.setState({ mensaje: "❌ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "❌ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  cargarBackupsBackend = async () => {
    this.setState({ cargandoBackupBackend: true });
    try {
      const response = await Model.alvaro.Action.verBackupBackend();
      let backupsList = [];

      if (response && response.data) {
        const data = response.data;
        if (Array.isArray(data)) {
          backupsList = data;
        } else if (typeof data === 'object' && data !== null) {
          backupsList = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        }
      }

      this.setState({ backupsBackend: backupsList, cargandoBackupBackend: false });
    } catch (error) {
      console.error("Error al cargar backups backend:", error);
      this.setState({ cargandoBackupBackend: false });
    }
  };

  cargarBackupsFrontend = async () => {
    this.setState({ cargandoBackupFrontend: true });
    try {
      const response = await Model.alvaro.Action.verBackupFrontend();
      let backupsList = [];

      if (response && response.data) {
        const data = response.data;
        if (Array.isArray(data)) {
          backupsList = data;
        } else if (typeof data === 'object' && data !== null) {
          backupsList = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        }
      }

      this.setState({ backupsFrontend: backupsList, cargandoBackupFrontend: false });
    } catch (error) {
      console.error("Error al cargar backups frontend:", error);
      this.setState({ cargandoBackupFrontend: false });
    }
  };


  eliminarBackupBackendClick = async (backup) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el backup:\n${backup.nombre}?`)) {
      return;
    }

    this.setState({ loading: true, mensaje: "" });
    try {
      const response = await Model.alvaro.Action.eliminarBackupBackend(backup.ruta);
      if (response.estado === "exito") {
        this.setState({ mensaje: "✅ Backup backend eliminado exitosamente" });
        setTimeout(() => this.cargarBackupsBackend(), 1000);
      } else {
        this.setState({ mensaje: "❌ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "❌ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  restaurarBackupBackendClick = async (backup) => {
    if (!window.confirm(`¿Estás seguro de que quieres restaurar el backup:\n${backup.nombre}?\n\nEsto reemplazará el server.jar actual.`)) {
      return;
    }

    this.setState({ loading: true, mensaje: "" });
    try {
      const response = await Model.alvaro.Action.restaurarBackupBackend(backup.ruta);
      if (response.estado === "exito") {
        this.setState({ mensaje: "✅ Backup backend restaurado exitosamente" });
        setTimeout(() => this.cargarBackupsBackend(), 1000);
      } else {
        this.setState({ mensaje: "❌ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "❌ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  eliminarBackupFrontendClick = async (backup) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el backup:\n${backup.nombre}?`)) {
      return;
    }

    this.setState({ loading: true, mensaje: "" });
    try {
      const response = await Model.alvaro.Action.eliminarBackupFrontend(backup.ruta);
      if (response.estado === "exito") {
        this.setState({ mensaje: "✅ Backup frontend eliminado exitosamente" });
        setTimeout(() => this.cargarBackupsFrontend(), 1000);
      } else {
        this.setState({ mensaje: "❌ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "❌ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  restaurarBackupFrontendClick = async (backup) => {
    if (!window.confirm(`¿Estás seguro de que quieres restaurar el backup:\n${backup.nombre}?\n\nEsto reemplazará la carpeta build actual.`)) {
      return;
    }

    this.setState({ loading: true, mensaje: "" });
    try {
      const response = await Model.alvaro.Action.restaurarBackupFrontend(backup.ruta);
      if (response.estado === "exito") {
        this.setState({ mensaje: "✅ Backup frontend restaurado exitosamente" });
        setTimeout(() => this.cargarBackupsFrontend(), 1000);
      } else {
        this.setState({ mensaje: "❌ Error: " + (response.error || "desconocido") });
      }
    } catch (error) {
      this.setState({ mensaje: "❌ Error: " + error.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  renderTablaBackupsBackend() {
    const { backupsBackend } = this.state;

    if (!Array.isArray(backupsBackend) || backupsBackend.length === 0) {
      return <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>No hay backups de backend disponibles</p>;
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Nombre</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Tamaño</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Fecha</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {backupsBackend.map((backup, index) => (
              <tr
                key={backup.nombre || index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  borderBottom: "1px solid #ddd",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ecf0f1"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#fff"}
              >
                <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "13px" }}>
                  {backup.nombre || "-"}
                </td>
                <td style={{ padding: "12px", textAlign: "center", fontSize: "13px" }}>
                  <span style={{ backgroundColor: "#e8f4f8", padding: "4px 8px", borderRadius: "4px" }}>
                    {backup.tamaño || "0 B"}
                  </span>
                </td>
                <td style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "#666" }}>
                  {backup.fecha || "-"}
                </td>
                <td style={{ padding: "12px", textAlign: "center", gap: "5px", display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => this.restaurarBackupBackendClick(backup)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      backgroundColor: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#229954"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#27ae60"}
                    title="Restaurar backup"
                  >
                    ↻
                  </button>
                  <button
                    onClick={() => this.eliminarBackupBackendClick(backup)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#c0392b"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#e74c3c"}
                    title="Eliminar backup"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666", textAlign: "right" }}>
          Total: <strong>{backupsBackend.length}</strong> backups
        </div>
      </div>
    );
  }

  renderTablaBackupsFrontend() {
    const { backupsFrontend } = this.state;

    if (!Array.isArray(backupsFrontend) || backupsFrontend.length === 0) {
      return <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>No hay backups de frontend disponibles</p>;
    }

    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#16a085", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Nombre</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Tamaño</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Fecha</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {backupsFrontend.map((backup, index) => (
              <tr
                key={backup.nombre || index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  borderBottom: "1px solid #ddd",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ecf0f1"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#fff"}
              >
                <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "13px" }}>
                  {backup.nombre || "-"}
                </td>
                <td style={{ padding: "12px", textAlign: "center", fontSize: "13px" }}>
                  <span style={{ backgroundColor: "#d5f4e6", padding: "4px 8px", borderRadius: "4px" }}>
                    {backup.tamaño || "0 B"}
                  </span>
                </td>
                <td style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "#666" }}>
                  {backup.fecha || "-"}
                </td>
                <td style={{ padding: "12px", textAlign: "center", gap: "5px", display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => this.restaurarBackupFrontendClick(backup)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      backgroundColor: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#229954"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#27ae60"}
                    title="Restaurar backup"
                  >
                    ↻
                  </button>
                  <button
                    onClick={() => this.eliminarBackupFrontendClick(backup)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#c0392b"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#e74c3c"}
                    title="Eliminar backup"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666", textAlign: "right" }}>
          Total: <strong>{backupsFrontend.length}</strong> backups
        </div>
      </div>
    );
  }

  render() {
    const { loading, mensaje, cargandoBackupBackend, cargandoBackupFrontend } = this.state;

    return (
      <SPage title="Alvaro - Sistema de Backups">
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ color: "#2c3e50", marginTop: 0, borderBottom: "3px solid #3498db", paddingBottom: "10px" }}>
            🔒 Gestión de Backups - Alvaro
          </h1>

          <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={this.crearBackupBackend}
              disabled={this.state.loading}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: this.state.loading ? "#ccc" : "#2980b9",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: this.state.loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => !this.state.loading && (e.target.style.backgroundColor = "#1e5fa0")}
              onMouseLeave={(e) => !this.state.loading && (e.target.style.backgroundColor = "#2980b9")}
            >
              {this.state.loading ? "⏳ Creando..." : "💾 Hacer Copia de Seguridad Backend"}
            </button>

            <button
              onClick={this.crearBackupFrontend}
              disabled={this.state.loading}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: this.state.loading ? "#ccc" : "#16a085",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: this.state.loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => !this.state.loading && (e.target.style.backgroundColor = "#138d75")}
              onMouseLeave={(e) => !this.state.loading && (e.target.style.backgroundColor = "#16a085")}
            >
              {this.state.loading ? "⏳ Creando..." : "🎨 Hacer Copia de Seguridad Frontend"}
            </button>
          </div>

          {mensaje && (
            <div
              style={{
                padding: "12px 16px",
                marginBottom: "20px",
                borderRadius: "6px",
                backgroundColor: mensaje.includes("❌") ? "#fadbd8" : "#d5f4e6",
                color: mensaje.includes("❌") ? "#922b21" : "#186a3b",
                border: `1px solid ${mensaje.includes("❌") ? "#f5b7b1" : "#a9dfbf"}`,
                fontWeight: "500"
              }}
            >
              {mensaje}
            </div>
          )}

          <div style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "20px"
          }}>
            <h3 style={{ color: "#2c3e50", margin: "0 0 15px 0" }}>💾 Backups Backend</h3>
            {cargandoBackupBackend ? <p style={{ textAlign: "center", color: "#666" }}>Cargando...</p> : this.renderTablaBackupsBackend()}
          </div>

          <div style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ color: "#2c3e50", margin: "0 0 15px 0" }}>🎨 Backups Frontend</h3>
            {cargandoBackupFrontend ? <p style={{ textAlign: "center", color: "#666" }}>Cargando...</p> : this.renderTablaBackupsFrontend()}
          </div>
        </div>
      </SPage>
    );
  }
}
