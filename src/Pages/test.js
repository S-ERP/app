import React, { Component } from "react";
import { SPage } from "servisofts-component";

export default class Test extends Component {
  state = {
    loading: false,
    mensaje: "",
  };

  hacerBackup = async () => {
    mira pode hacer que uncion esto

    /home/servisofts/Documents/GitHub/alvaro/serp_alvaro/server/alvaro_backup.sh
  };

  render() {
    const { loading, mensaje } = this.state;

    return (
      <SPage title="Alvaro">
        <div style={{ padding: "20px", textAlign: "center" }}>
          <button
            onClick={this.hacerBackup}
            disabled={loading}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: loading ? "#ccc" : "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Respaldando..." : "Alvaro"}
          </button>

          {mensaje && (
            <p
              style={{
                marginTop: "20px",
                fontSize: "14px",
                color: mensaje.includes("Error") ? "red" : "green",
              }}
            >
              {mensaje}
            </p>
          )}
        </div>
      </SPage>
    );
  }
}
