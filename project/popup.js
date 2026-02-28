const pantallas = {
    bienvenida: document.getElementById("pantallaBienvenida"),
    registro: document.getElementById("pantallaRegistro"),
    login: document.getElementById("pantallaLogin"),
    boveda: document.getElementById("pantallaBoveda")
};

let usuarioActual = null;

// --- 0. BANNER PREDETERMINADO (BOTONES) ---
document.getElementById("btnAceptarPredeterminado").addEventListener("click", () => {
    localStorage.setItem("esPredeterminado", "true");
    document.getElementById("bannerPredeterminado").style.display = "none";
    
    // Feature Detection para WebExtensions (Apagar nativo si es Chromium)
    if (typeof chrome !== "undefined" && chrome.privacy && chrome.privacy.services && chrome.privacy.services.passwordSavingEnabled) {
        chrome.privacy.services.passwordSavingEnabled.set({ value: false, scope: 'regular' }, () => {
            alert("✅ Vault Keys activado. El autoguardado nativo del navegador ha sido desactivado por seguridad.");
        });
    } else {
        alert("✅ Vault Keys configurado como principal.\n\nPor seguridad, recuerda desactivar el gestor nativo de tu navegador manualmente en Ajustes.");
    }
});

document.getElementById("btnIgnorarPredeterminado").addEventListener("click", () => {
    // Si le das a "Más tarde", se oculta ahora, pero volverá a salir la próxima vez
    document.getElementById("bannerPredeterminado").style.display = "none";
});

// --- 1. CONTROL DE USUARIO Y NAVEGACIÓN ---
let ultimoUsuario = localStorage.getItem("ultimoUsuario");

function mostrarPantalla(id) {
    // 1. Ocultamos todas las pantallas
    Object.values(pantallas).forEach(p => p.classList.add("oculto"));
    // 2. Mostramos la que toca
    pantallas[id].classList.remove("oculto");
    
    // 3. MAGIA DEL BANNER: Solo sale si la pantalla es "bienvenida" y no has aceptado antes
    const banner = document.getElementById("bannerPredeterminado");
    if (id === 'bienvenida' && !localStorage.getItem("esPredeterminado")) {
        banner.style.display = "block";
    } else {
        banner.style.display = "none";
    }
}

// Arranque inicial
if (ultimoUsuario) {
    document.getElementById("loginUsuario").value = ultimoUsuario;
    mostrarPantalla('login');
} else {
    mostrarPantalla('bienvenida');
}

// --- 2. BOTONES DE NAVEGACIÓN ---
document.getElementById("btnIrALogin").addEventListener("click", () => mostrarPantalla('login'));
document.getElementById("btnIrARegistro").addEventListener("click", () => mostrarPantalla('registro'));
document.getElementById("volverBienvenidaReg").addEventListener("click", () => mostrarPantalla('bienvenida'));
document.getElementById("volverBienvenidaLog").addEventListener("click", () => mostrarPantalla('bienvenida'));

// --- 3. LÓGICA DE REGISTRO Y AUTO-LOGIN ---
document.getElementById("btnRegistrar").addEventListener("click", () => {
    const user = document.getElementById("regUsuario").value.trim();
    const p1 = document.getElementById("regPass").value;
    const p2 = document.getElementById("regPassRepetir").value;

    if (!user || !p1) return alert("Rellena todos los campos.");
    if (p1 !== p2) return alert("Las contraseñas no coinciden.");

    const tieneLetras = /[a-zA-Z]/.test(p1);
    const tieneNumeros = /[0-9]/.test(p1);
    
    if (p1.length < 8 || !tieneLetras || !tieneNumeros) {
        return alert("❌ ALTO AHÍ: La Clave Maestra debe tener mínimo 8 caracteres y mezclar letras y números.");
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    if (usuarios[user]) return alert("Este usuario ya existe.");

    usuarios[user] = { masterPass: p1, boveda: [] };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("ultimoUsuario", user);
    
    // Auto-Login directo a la bóveda
    usuarioActual = user; 
    document.getElementById("saludo").textContent = "Bóveda protegida de: " + user;
    
    document.getElementById("regUsuario").value = "";
    document.getElementById("regPass").value = "";
    document.getElementById("regPassRepetir").value = "";
    
    mostrarPantalla('boveda');
    cargarBoveda();
});

// --- 4. LÓGICA DE LOGIN ---
document.getElementById("btnDesbloquear").addEventListener("click", () => {
    const user = document.getElementById("loginUsuario").value.trim();
    const pass = document.getElementById("loginPass").value;
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");

    if (usuarios[user] && usuarios[user].masterPass === pass) {
        usuarioActual = user;
        localStorage.setItem("ultimoUsuario", user); 
        
        document.getElementById("saludo").textContent = "Bóveda protegida de: " + user;
        document.getElementById("loginPass").value = "";
        
        mostrarPantalla('boveda');
        cargarBoveda();
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
});

// --- 5. MOTORES DE GENERACIÓN (NORMAL VS AVANZADO) ---
const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

// Botón 1: Generador Normal (Criptografía del navegador)
document.getElementById("botonGenerarNormal").addEventListener("click", () => {
    let password = "";
    const randomArray = new Uint32Array(16);
    window.crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < 16; i++) {
        password += caracteres[randomArray[i] % caracteres.length];
    }
    document.getElementById("cajaContrasena").value = password;
});

// Botón 2: Generador Avanzado (API de Ruido Atmosférico)
document.getElementById("botonGenerarIA").addEventListener("click", async () => {
    const caja = document.getElementById("cajaContrasena");
    const botonIA = document.getElementById("botonGenerarIA");
    
    // Efecto visual de carga
    botonIA.textContent = "CONECTANDO...";
    botonIA.disabled = true;
    
    let password = "";
    try {
        const respuesta = await fetch("https://www.random.org/integers/?num=16&min=0&max=68&col=1&base=10&format=plain&rnd=new");
        
        if (respuesta.ok) {
            const texto = await respuesta.text();
            const numerosAleatorios = texto.trim().split("\n").map(Number);
            
            numerosAleatorios.forEach(num => {
                password += caracteres[num];
            });
            caja.value = password;
        } else {
            throw new Error("Fallo en la API");
        }
    } catch (error) {
        alert("La red cuántica/API está saturada. Usa el generador NORMAL.");
    }

    // Restauramos el botón
    botonIA.textContent = "AVANZADO (API)";
    botonIA.disabled = false;
});

// --- 6. GUARDAR Y CARGAR BÓVEDA ---
document.getElementById("botonGuardar").addEventListener("click", () => {
    const site = document.getElementById("siteName").value.trim();
    const user = document.getElementById("siteUser").value.trim() || "Sin usuario";
    const pass = document.getElementById("cajaContrasena").value;

    if (!pass) return alert("❌ Genera una contraseña primero.");
    if (!site) return alert("❌ Indica el Nombre de la Web donde vas a usarla.");

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    
    // Ahora guardamos un objeto completo con toda la info, no solo texto
    usuarios[usuarioActual].boveda.push({
        sitio: site,
        usuario: user,
        clave: pass,
        fecha: new Date().toLocaleDateString()
    });
    
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    // Vaciamos las cajas para la siguiente
    document.getElementById("siteName").value = "";
    document.getElementById("siteUser").value = "";
    document.getElementById("cajaContrasena").value = ""; 
    
    cargarBoveda();
});

function cargarBoveda() {
    const lista = document.getElementById("listaContrasenas");
    lista.innerHTML = "";
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    
    if (usuarios[usuarioActual] && usuarios[usuarioActual].boveda) {
        const bovedaInvertida = [...usuarios[usuarioActual].boveda].reverse();
        
        bovedaInvertida.forEach(item => {
            const li = document.createElement("li");
            
            // Pintamos la tarjeta completa usando tu diseño
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 5px;">
                    <span style="font-weight:bold; color:#E0E0E6; font-size:14px; letter-spacing:1px;">${item.sitio.toUpperCase()}</span>
                    <span style="font-size:9px; color:#6D4AFF;">${item.fecha}</span>
                </div>
                <div style="font-size:11px; color:#8C8C9A;">User: <span style="color:#E0E0E6;">${item.usuario}</span></div>
                
                <div style="margin-top:8px; background:#12121A; padding:8px; border-radius:5px; border: 1px solid #3E3E55; font-size:13px; letter-spacing:2px; cursor:pointer;" 
                     title="Click para copiar" 
                     onclick="navigator.clipboard.writeText('${item.clave}').then(()=>alert('✅ ¡Contraseña de ${item.sitio} copiada!'))">
                    ${item.clave.substring(0, 6)}••••••••
                </div>
            `;
            lista.appendChild(li);
        });
    }
}

// --- 8. EL RESETEO TOTAL (HUEVO DE PASCUA) ---
document.getElementById("btnResetTotal").addEventListener("dblclick", () => {
    if(confirm("⚠️ ¿Quieres borrar TODOS los usuarios y datos de Vault Keys?")) {
        localStorage.clear();
        alert("Sistema reseteado.");
        location.reload();
    }
});