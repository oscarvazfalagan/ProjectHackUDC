const pantallas = {
    bienvenida: document.getElementById("pantallaBienvenida"),
    registro: document.getElementById("pantallaRegistro"),
    login: document.getElementById("pantallaLogin"),
    boveda: document.getElementById("pantallaBoveda")
};

let usuarioActual = null;

// --- 0. BANNER PREDETERMINADO ---
document.getElementById("btnAceptarPredeterminado").addEventListener("click", () => {
    localStorage.setItem("esPredeterminado", "true");
    document.getElementById("bannerPredeterminado").style.display = "none";
    if (typeof chrome !== "undefined" && chrome.privacy?.services?.passwordSavingEnabled) {
        chrome.privacy.services.passwordSavingEnabled.set({ value: false, scope: 'regular' }, () => {
            alert("✅ Vault Keys activado. El autoguardado nativo ha sido desactivado.");
        });
    } else {
        alert("✅ Vault Keys configurado como principal.");
    }
});

document.getElementById("btnIgnorarPredeterminado").addEventListener("click", () => {
    document.getElementById("bannerPredeterminado").style.display = "none";
});

// --- 1. CONTROL DE NAVEGACIÓN ---
function mostrarPantalla(id) {
    Object.values(pantallas).forEach(p => p.classList.add("oculto"));
    pantallas[id].classList.remove("oculto");
    
    const banner = document.getElementById("bannerPredeterminado");
    if (id === 'bienvenida' && !localStorage.getItem("esPredeterminado")) {
        banner.style.display = "block";
    } else {
        banner.style.display = "none";
    }

    if (id === 'boveda' && typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(tabs[0]?.url) {
                try {
                    let url = new URL(tabs[0].url);
                    document.getElementById("siteName").value = url.hostname.replace('www.', '');
                } catch(e) {}
            }
        });
    }
}

// Carga inicial
let ultimoUsuario = localStorage.getItem("ultimoUsuario");
if (ultimoUsuario) {
    document.getElementById("loginEmail").value = ultimoUsuario;
    mostrarPantalla('login');
} else {
    mostrarPantalla('bienvenida');
}

// Botones de navegación
document.getElementById("btnIrALogin").addEventListener("click", () => mostrarPantalla('login'));
document.getElementById("btnIrARegistro").addEventListener("click", () => mostrarPantalla('registro'));
document.getElementById("volverBienvenidaReg").addEventListener("click", () => mostrarPantalla('bienvenida'));
document.getElementById("volverBienvenidaLog").addEventListener("click", () => mostrarPantalla('bienvenida'));

// --- 2. LÓGICA DE REGISTRO (RESTAURADA A 8 CARACTERES) ---
document.getElementById("btnRegistrar").addEventListener("click", () => {
    const email = document.getElementById("regEmail").value.trim();
    const nombre = document.getElementById("regNombre").value.trim();
    const p1 = document.getElementById("regPass").value;
    const p2 = document.getElementById("regPassRepetir").value;

    if (!email || !nombre || !p1) return alert("Rellena todos los campos.");
    if (p1 !== p2) return alert("Las contraseñas no coinciden.");

    // Volvemos a tu validación original: 8 caracteres, letras y números [cite: 305, 306]
    if (p1.length < 8 || !/[a-zA-Z]/.test(p1) || !/[0-9]/.test(p1)) {
        return alert("❌ ALTO AHÍ: La Clave Maestra debe tener mínimo 8 caracteres y mezclar letras y números.");
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    if (usuarios[email]) return alert("Este correo ya está registrado.");

    usuarios[email] = { masterPass: p1, nombre: nombre, boveda: [] };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("ultimoUsuario", email);
    
    usuarioActual = email; 
    document.getElementById("saludo").textContent = "Bóveda protegida de: " + nombre;
    mostrarPantalla('boveda');
    cargarBoveda();
});

// --- 3. LÓGICA DE LOGIN ---
document.getElementById("btnDesbloquear").addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value;
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");

    if (usuarios[email] && usuarios[email].masterPass === pass) {
        usuarioActual = email;
        localStorage.setItem("ultimoUsuario", email); 
        document.getElementById("saludo").textContent = "Bóveda protegida de: " + usuarios[email].nombre;
        document.getElementById("loginPass").value = "";
        mostrarPantalla('boveda');
        cargarBoveda();
    } else {
        alert("Correo o contraseña incorrectos.");
    }
});

// --- 4. GESTIÓN DEL TECLADO (INTRO) ---
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT') {
            if (!pantallas.login.classList.contains("oculto")) {
                document.getElementById("btnDesbloquear").click();
            } else if (!pantallas.registro.classList.contains("ocitalo")) {
                document.getElementById("btnRegistrar").click();
            }
        }
    }
});

// --- 5. GENERADORES ---
const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

document.getElementById("botonGenerarNormal").addEventListener("click", () => {
    let password = "";
    const randomArray = new Uint32Array(16);
    window.crypto.getRandomValues(randomArray); // Aleatoriedad segura [cite: 364, 380]
    for (let i = 0; i < 16; i++) password += caracteres[randomArray[i] % caracteres.length];
    document.getElementById("cajaContrasena").value = password;
});

document.getElementById("botonGenerarIA").addEventListener("click", async () => {
    const botonIA = document.getElementById("botonGenerarIA");
    botonIA.textContent = "CONECTANDO...";
    botonIA.disabled = true;
    try {
        const respuesta = await fetch("https://www.random.org/integers/?num=16&min=0&max=68&col=1&base=10&format=plain&rnd=new");
        if (respuesta.ok) {
            const texto = await respuesta.text();
            const numeros = texto.trim().split("\n").map(Number);
            let password = "";
            numeros.forEach(num => password += caracteres[num]);
            document.getElementById("cajaContrasena").value = password;
        } else throw new Error();
    } catch (e) {
        alert("⚠️ API saturada. Usa el generador NORMAL.");
    }
    botonIA.textContent = "AVANZADO (API)";
    botonIA.disabled = false;
});

// --- 6. BÓVEDA ---
document.getElementById("botonGuardar").addEventListener("click", () => {
    const site = document.getElementById("siteName").value.trim();
    const user = document.getElementById("siteUser").value.trim() || "Sin usuario";
    const pass = document.getElementById("cajaContrasena").value;

    if (!pass || !site) return alert("❌ Rellena los datos y genera una clave.");

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    usuarios[usuarioActual].boveda.push({
        sitio: site, usuario: user, clave: pass, fecha: new Date().toLocaleDateString()
    });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    document.getElementById("siteUser").value = "";
    document.getElementById("cajaContrasena").value = ""; 
    cargarBoveda();
});

function cargarBoveda() {
    const lista = document.getElementById("listaContrasenas");
    lista.innerHTML = "";
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    
    if (usuarios[usuarioActual]?.boveda) {
        [...usuarios[usuarioActual].boveda].reverse().forEach((item, index) => {
            const realIdx = usuarios[usuarioActual].boveda.length - 1 - index;
            const li = document.createElement("li");
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <span style="font-weight:bold; color:#E0E0E6;">${item.sitio.toUpperCase()}</span>
                    <span style="font-size:9px;">${item.fecha}</span>
                </div>
                <div style="font-size:11px;">User: ${item.usuario}</div>
                <div class="caja-copiar" data-p="${item.clave}" style="margin-top:5px; background:#12121A; padding:5px; border-radius:5px; cursor:pointer; text-align:center;">
                    ${item.clave.substring(0, 6)}••••••••
                </div>
                <div style="display:flex; gap:5px; margin-top:5px;">
                    <button class="btn-magico" data-u="${item.usuario}" data-p="${item.clave}" style="flex:1; background:#00C8531A; color:#00C853; border:1px solid #00C853; padding:5px; cursor:pointer;">INYECTAR</button>
                    <button class="btn-eliminar" data-index="${realIdx}" style="background:#FF44441A; color:#FF4444; border:1px solid #FF4444; padding:5px; cursor:pointer;">🗑️</button>
                </div>`;
            lista.appendChild(li);
        });

        document.querySelectorAll(".btn-magico").forEach(b => b.addEventListener("click", function() {
            ejecutarAutocompletado(this.getAttribute("data-u"), this.getAttribute("data-p"));
        }));
        document.querySelectorAll(".btn-eliminar").forEach(b => b.addEventListener("click", function() {
            if(confirm("¿Borrar clave?")) {
                let u = JSON.parse(localStorage.getItem("usuarios"));
                u[usuarioActual].boveda.splice(this.getAttribute("data-index"), 1);
                localStorage.setItem("usuarios", JSON.stringify(u));
                cargarBoveda();
            }
        }));
        document.querySelectorAll(".caja-copiar").forEach(c => c.addEventListener("click", function() {
            navigator.clipboard.writeText(this.getAttribute("data-p")).then(() => alert('✅ Copiada'));
        }));
    }
}

async function ejecutarAutocompletado(usuario, clave) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (u, p) => {
            const setV = (i, v) => {
                if(!i) return;
                let s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                s ? s.call(i, v) : i.value = v;
                i.dispatchEvent(new Event('input', { bubbles: true }));
            };
            setV(document.querySelector('input[name*="user"], input[type="email"], input[type="text"]'), u);
            setV(document.querySelector('input[type="password"]'), p);
        },
        args: [usuario, clave]
    });
}

document.getElementById("btnLogOut").addEventListener("click", () => {
    usuarioActual = null;
    mostrarPantalla('login');
});

document.getElementById("btnResetTotal").addEventListener("dblclick", () => {
    if(confirm("⚠️ ¿Resetear TODO?")) { localStorage.clear(); location.reload(); }
});