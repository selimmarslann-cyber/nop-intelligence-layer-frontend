import React from "react";
import { card } from "./layout";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 40,
        padding: "30px 0",
        borderTop: "1px solid #eee",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 24,
          color: "#333",
        }}
      >
        <div>
          <h3 style={title}>Ödül Dağıtım Sistemi</h3>
          <p style={p}>
            Stake havuzu yıllık 50M NOP kapasitelidir. Katkı ve puanlama oranına
            göre her saat ödül dağıtımı yapılır. Fee zincir üzerinden kullanıcıya
            aittir.
          </p>
        </div>

        <div>
          <h3 style={title}>Whitepaper</h3>
          <p style={p}>
            NOP Intelligence Layer’ın tokenomics, gelir modeli ve teknik mimari
            detayları için{" "}
            <a href="/api/whitepaper" style={link} target="_blank" rel="noopener noreferrer">
              Whitepaper’ı görüntüle.
            </a>
          </p>
        </div>

        <div>
          <h3 style={title}>Sıkça Sorulan Sorular</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14 }}>
            <li>• Puanlar ne zaman tokena dönüşür?</li>
            <li>• Stake ödülleri nasıl hesaplanıyor?</li>
            <li>• Çekim talebi nasıl onaylanır?</li>
          </ul>
        </div>

        <div>
          <h3 style={title}>Yönetim</h3>
          <p style={p}>
            Platform yönetimi ve işlem kontrolü için{" "}
            <a href="/admin" style={adminLink}>Admin Paneline Giriş Yap</a>
          </p>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          color: "#777",
          fontSize: 13,
          marginTop: 30,
          paddingTop: 15,
          borderTop: "1px solid #e5e5e5",
        }}
      >
        © {new Date().getFullYear()} NOP Intelligence Layer — Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

const title: React.CSSProperties = { fontSize: 16, fontWeight: 700, marginBottom: 8 };
const p: React.CSSProperties = { fontSize: 14, lineHeight: 1.5 };
const link: React.CSSProperties = { color: "#0040FF", textDecoration: "none", fontWeight: 600 };
const adminLink: React.CSSProperties = {
  color: "#D4B169",
  fontWeight: 700,
  textDecoration: "none",
  borderBottom: "2px solid #D4B169",
};
