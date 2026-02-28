# 🛡️ Senda: Seguridad sin Esfuerzo (Gradiant Reto 2026)

**Senda** es una extensión de navegador universal diseñada para cerrar la brecha entre la seguridad criptográfica de alto nivel y la comodidad del usuario del día a día. Desarrollada como respuesta al reto de Gradiant en la HackUDC 2026.



## 🌟 La Filosofía
La mayoría de las filtraciones de seguridad ocurren por el factor humano: pereza, fatiga de contraseñas o falta de herramientas accesibles. Senda no es solo un gestor; es un puente. Hemos diseñado una experiencia donde la **alta entropía** es invisible para el usuario, pero impenetrable para los atacantes.

## 🛠️ Características Principales
- **Universalidad:** Construida sobre estándares web puros (`localStorage`, `Vanilla JS`). Funciona en Chrome, Firefox, Edge y Brave sin dependencias externas.
- **Seguridad Criptográfica:** Generador de contraseñas basado en la `Web Crypto API` (`window.crypto.getRandomValues`) para garantizar una entropía real de ~95 bits.
- **Onboarding Intuitivo:** Flujo de configuración inicial para establecer una Contraseña Maestra (Master Password) de acceso.
- **Bóveda Local:** Almacenamiento persistente y privado en el navegador del usuario. Sin servidores, sin intermediarios, privacidad total.

## 🧠 Detalles Técnicos
Para este MVP, hemos priorizado la robustez y la arquitectura limpia:
- **Entropía:** En lugar de usar `Math.random()` (pseudo-aleatorio), implementamos un pool de caracteres extendido procesado con aleatoriedad de hardware.
- **Arquitectura:** Diseño basado en estados (Login, Registro, Bóveda) gestionado mediante manipulación dinámica del DOM, optimizando la velocidad de respuesta.
- **Mentalidad Cross-Platform:** Separación total de las APIs propietarias de Chrome para asegurar la portabilidad del software.



## 🚀 Instalación (Modo Desarrollador)
1. Descarga este repositorio o el archivo `.zip`.
2. Abre tu navegador basado en Chromium (Chrome, Edge, Brave...).
3. Ve a `chrome://extensions/` y activa el **"Modo de desarrollador"**.
4. Haz clic en **"Cargar descomprimida"** y selecciona la carpeta de este proyecto.
5. ¡Listo! Ancla la extensión y define tu primera Contraseña Maestra.

## 👥 Autor
- Desarrollado por un apasionado de Java explorando el ecosistema de extensiones web en tiempo récord.

---
*Proyecto creado para el Reto Gradiant - HackUDC 2026*
