# 🍻 Cotorrea Pachi

> **Web App colaborativa para coordinar quedadas y eventos con amigos sin caos.**

[![Deploy with Vercel](https://vercel.com/button)](https://cotorrea-pachi.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repo-181717?logo=github)](https://github.com/ArquitectoManchego/cotorrea-pachi)

---

## 🎯 ¿Qué problema resuelve?
Coordinar una salida entre amigos suele terminar en un grupo de WhatsApp lleno de mensajes perdidos:
- *"¿Qué día pueden?"*
- *"Yo salgo de trabajar a las 7"*
- *"¿A dónde vamos?"*
- *"Mejor que alguien vote"*

**Cotorrea Pachi** centraliza todo en una sola pantalla moderna y ligera:
1. **Registro amigable:** Cada amigo ingresa con Nombre, Apellido y Foto de perfil (subida de imagen o galería de avatares).
2. **Disponibilidad por casillas de verificación:** Selección de días disponibles (Lunes a Domingo) con casillas tipo check.
3. **Flexibilidad horaria real:**
   - Puede a cualquier hora / Todo el día.
   - Rango de horario específico (ej. 18:00 a 23:00).
   - Libre a partir de cierto horario (ej. A partir de las 19:30).
4. **Propuesta dual de lugares:**
   - **En el mapa:** Selección visual interactiva con buscador de direcciones o clic para colocar pin (Leaflet + OpenStreetMap + enlaces directos a Google Maps).
   - **Sin mapa:** Modo texto simple para escribir directamente el nombre del lugar sin marcar coordenadas.
5. **Algoritmo de Convivencia (Smart Matchmaker):** Cruza las disponibilidades y votos para determinar el **Día Ganador**, el **Horario Óptimo** y el **Lugar Favorito**.
6. **Exportación y WhatsApp:**
   - Botón *"¡Concretar Salida!"* con lluvia de confeti.
   - Botón *"Copiar Resumen para WhatsApp"* con formato listo para pegar en el grupo.
   - Generador y descarga de archivo de calendario (`.ics`) compatible con Google Calendar, Apple Calendar y Outlook.

---

## 🚀 Despliegue en Vivo & Repositorio
- 🌐 **Aplicación en Vercel:** [https://cotorrea-pachi.vercel.app](https://cotorrea-pachi.vercel.app)
- 🐙 **Repositorio en GitHub:** [https://github.com/ArquitectoManchego/cotorrea-pachi](https://github.com/ArquitectoManchego/cotorrea-pachi)

---

## 🛠️ Stack Tecnológico
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS (Paleta de colores claros, estética fresca y minimalista)
- **Mapas:** Leaflet, OpenStreetMap & Nominatim Geocoding (con enlaces profundos a Google Maps)
- **Animaciones e Iconos:** Lucide React, Canvas Confetti
- **Hosting:** Vercel

---

## 💻 Ejecución en Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/ArquitectoManchego/cotorrea-pachi.git
cd cotorrea-pachi

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📊 Estudio de Mercado y Análisis FODA

### Comparativa con Competidores
- **When2meet / LettuceMeet:** Populares para disponibilidad de horarios, pero carecen de propuestas de lugares y mapas interactivos.
- **Doodle:** Muy enfocado en reuniones de trabajo y lleno de publicidad en su versión gratuita.
- **Partiful / Howbout:** Enfocadas en invitaciones cerradas o apps nativas que requieren registro pesado.

**Cotorrea Pachi** destaca por unir el **DÓNDE (con mapa y lista libre)** y el **CUÁNDO (días + horarios flexibles)** sin fricciones de inicio de sesión obligatorio.
