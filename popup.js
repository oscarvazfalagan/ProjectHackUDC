/**
 * VAULT KEYS - CÓDIGO MAESTRO COMPLETO (CORREGIDO)
 * Sin recortes. Sincronizado con HTML: regEmail, regNombre, loginEmail, siteUser, siteEmail.
 */

// --- 1. REFERENCIAS A PANTALLAS (DOM) ---
const pantallas = {
    bienvenida: document.getElementById("pantallaBienvenida"),
    registro: document.getElementById("pantallaRegistro"),
    login: document.getElementById("pantallaLogin"),
    boveda: document.getElementById("pantallaBoveda")
};

let usuarioActual = null; // Guardará el correo de la sesión activa

// --- 2. BANNER DE GESTOR PREDETERMINADO ---
document.getElementById("btnAceptarPredeterminado").addEventListener("click", () => {
    localStorage.setItem("esPredeterminado", "true");
    document.getElementById("bannerPredeterminado").style.display = "none";
    if (typeof chrome !== "undefined" && chrome.privacy?.services?.passwordSavingEnabled) {
        chrome.privacy.services.passwordSavingEnabled.set({ value: false, scope: 'regular' }, () => {
            alert("✅ Vault Keys activado como gestor principal.");
        });
    } else {
        alert("✅ Vault Keys configurado como principal.");
    }
});

document.getElementById("btnIgnorarPredeterminado").addEventListener("click", () => {
    document.getElementById("bannerPredeterminado").style.display = "none";
});

// --- 3. CONTROL DE NAVEGACIÓN Y AUTO-RELLENADO ---
function mostrarPantalla(id) {
    Object.values(pantallas).forEach(p => p.classList.add("oculto"));
    pantallas[id].classList.remove("oculto");
    
    const banner = document.getElementById("bannerPredeterminado");
    if (id === 'bienvenida' && !localStorage.getItem("esPredeterminado")) {
        banner.style.display = "block";
    } else {
        banner.style.display = "none";
    }

    // AUTO-RELLENADO AL ENTRAR EN BÓVEDA
    if (id === 'boveda' && usuarioActual) {
        let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
        let datosBase = usuarios[usuarioActual];
        
        if (datosBase) {
            document.getElementById("siteUser").value = datosBase.nombre || ""; 
            document.getElementById("siteEmail").value = usuarioActual || ""; 
        }

        if (typeof chrome !== "undefined" && chrome.tabs) {
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
}

// CORRECCIÓN CRÍTICA: Carga inicial y persistencia de sesión
let ultimoUsuario = localStorage.getItem("ultimoUsuario");
if (ultimoUsuario) {
    usuarioActual = ultimoUsuario; // Restauramos la variable global inmediatamente
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

// --- 4. LÓGICA DE REGISTRO (8 CARACTERES) ---
document.getElementById("btnRegistrar").addEventListener("click", () => {
    const email = document.getElementById("regEmail").value.trim();
    const nombre = document.getElementById("regNombre").value.trim();
    const p1 = document.getElementById("regPass").value;
    const p2 = document.getElementById("regPassRepetir").value;

    if (!email || !nombre || !p1) return alert("Rellena todos los campos.");
    if (p1 !== p2) return alert("Las contraseñas no coinciden.");

    if (p1.length < 8 || !/[a-zA-Z]/.test(p1) || !/[0-9]/.test(p1)) {
        return alert(" La Clave Maestra requiere 8 caracteres, letras y números.");
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    if (usuarios[email]) return alert("Este correo ya está registrado.");

    usuarios[email] = { masterPass: p1, nombre: nombre, boveda: [] };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("ultimoUsuario", email);
    
    usuarioActual = email; 
    document.getElementById("saludo").textContent = "Bóveda de: " + nombre;
    mostrarPantalla('boveda');
    cargarBoveda();
});

// --- 5. LÓGICA DE LOGIN ---
document.getElementById("btnDesbloquear").addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value;
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");

    if (usuarios[email] && usuarios[email].masterPass === pass) {
        usuarioActual = email;
        localStorage.setItem("ultimoUsuario", email); 
        document.getElementById("saludo").textContent = "Bóveda de: " + usuarios[email].nombre;
        document.getElementById("loginPass").value = "";
        mostrarPantalla('boveda');
        cargarBoveda();
    } else {
        alert("Correo o contraseña incorrectos.");
    }
});

// --- 6. GESTIÓN DEL TECLADO (ENTER) ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const active = document.activeElement;
        if (active.tagName === 'INPUT') {
            if (!pantallas.login.classList.contains("oculto")) document.getElementById("btnDesbloquear").click();
            else if (!pantallas.registro.classList.contains("oculto")) document.getElementById("btnRegistrar").click();
        }
    }
});

// --- 7. GENERADORES DE CONTRASEÑAS (CON LECTURA POR TANDADAS) ---
const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

function crearClaveAleatoria() {
    let password = "";
    const randomArray = new Uint32Array(16);
    window.crypto.getRandomValues(randomArray); 
    for (let i = 0; i < 16; i++) password += caracteres[randomArray[i] % caracteres.length];
    return password;
}

// Función que lee rockyou.txt por "tandadas" para no petar la RAM
async function estaEnRockyou(password) {
    try {
        const respuesta = await fetch("rockyou.txt");
        if (!respuesta.ok) return false;

        // Abrimos el archivo como un flujo de datos (Stream)
        const lector = respuesta.body.getReader();
        const decodificador = new TextDecoder("utf-8");
        let resto = ""; // Guardará el final de la tandada anterior

        // Bucle infinito que va pidiendo tandadas hasta que se acaba el archivo
        while (true) {
            const { done, value } = await lector.read();
            if (done) break; // Si ya no hay más archivo, salimos

            // Traducimos los bytes a texto
            const pedazo = decodificador.decode(value, { stream: true });
            
            // Juntamos el trocito que sobró de antes con el pedazo nuevo
            const textoRevisar = resto + pedazo;

            // Si encontramos la contraseña en este pedazo, devolvemos true al instante
            if (textoRevisar.includes(password)) {
                return true; 
            }

            // Guardamos los últimos 20 caracteres por si la palabra quedó cortada a la mitad
            resto = textoRevisar.slice(-20);
        }
        return false; // Terminó de leer los 130MB y la clave está limpia
    } catch (e) {
        console.log("No se pudo leer rockyou.txt. Saltando verificación.");
        return false;
    }
}

// Evento del botón Generar Normal
document.getElementById("botonGenerarNormal")?.addEventListener("click", async () => {
    const boton = document.getElementById("botonGenerarNormal");
    const caja = document.getElementById("cajaContrasena");
    
    // Avisamos al usuario que estamos leyendo el archivo gigante
    if (boton) {
        boton.textContent = "VERIFICANDO...";
        boton.disabled = true;
        boton.style.opacity = "0.7";
    }

    let passwordFinal = crearClaveAleatoria();
    
    // Comprobamos la clave leyendo todo el rockyou.txt por tandadas
    let esVulnerable = await estaEnRockyou(passwordFinal);

    // Si por una casualidad cósmica está en la lista, generamos otra y repetimos
    while (esVulnerable) {
        console.log("¡Contraseña detectada en rockyou! Generando una nueva...");
        passwordFinal = crearClaveAleatoria();
        esVulnerable = await estaEnRockyou(passwordFinal);
    }

    // Mostramos la clave final segura y restauramos el botón
    if (caja) caja.value = passwordFinal;
    
    if (boton) {
        boton.textContent = "NORMAL";
        boton.disabled = false;
        boton.style.opacity = "1";
    }
});

// El botón Avanzado (API) se queda exactamente igual
document.getElementById("botonGenerarIA")?.addEventListener("click", async () => {
    const botonIA = document.getElementById("botonGenerarIA");
    if(botonIA) {
        botonIA.textContent = "CONECTANDO...";
        botonIA.disabled = true;
    }
    try {
        const respuesta = await fetch("https://www.random.org/integers/?num=16&min=0&max=68&col=1&base=10&format=plain&rnd=new");
        if (respuesta.ok) {
            const texto = await respuesta.text();
            const numeros = texto.trim().split("\n").map(Number);
            let password = "";
            numeros.forEach(num => password += caracteres[num]);
            const caja = document.getElementById("cajaContrasena");
            if(caja) caja.value = password;
        } else throw new Error();
    } catch (e) {
        alert("API saturada. Usa el generador NORMAL.");
    }
    if(botonIA) {
        botonIA.textContent = "AVANZADO (API)";
        botonIA.disabled = false;
    }
});

// --- 8. GESTIÓN DE LA BÓVEDA (LISTA DE CLAVES) ---
function cargarBoveda() {
    const lista = document.getElementById("listaContrasenas");
    lista.innerHTML = "";
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");

    if (usuarios[usuarioActual]?.boveda) {
        // Mostramos los items (el más nuevo arriba)
        [...usuarios[usuarioActual].boveda].reverse().forEach((item, index) => {
            const realIdx = usuarios[usuarioActual].boveda.length - 1 - index;
            const li = document.createElement("li");
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold;">${item.sitio.toUpperCase()}</span>
                    <button class="btn-eliminar" data-index="${realIdx}" style="background:none; border:none; cursor:pointer; font-size:14px;">🗑️</button>
                </div>
                <div style="font-size:10px; color:#8C8C9A;">Usuario: ${item.usuario} | Email: ${item.email}</div>
                <button class="btn-magico" 
                    data-n="${item.usuario}" 
                    data-e="${item.email}" 
                    data-p="${item.clave}"
                    style="width:100%; margin-top:8px; padding:6px; background:#6D4AFF; border:none; border-radius:6px; color:white; cursor:pointer; font-weight:bold;">
                    INYECTAR DATOS
                </button>`;
            lista.appendChild(li);
        });

        // Eventos para INYECTAR
        document.querySelectorAll(".btn-magico").forEach(b => b.addEventListener("click", function () {
            ejecutarAutocompletado(this.getAttribute("data-n"), this.getAttribute("data-e"), this.getAttribute("data-p"));
        }));

        // Eventos para BORRAR (Esto es lo que faltaba)
        document.querySelectorAll(".btn-eliminar").forEach(b => b.addEventListener("click", function () {
            const idx = this.getAttribute("data-index");
            eliminarDeBoveda(idx);
        }));
    }
}

// Nueva función para borrar físicamente
function eliminarDeBoveda(index) {
    if (confirm("¿Seguro que quieres borrar esta clave?")) {
        let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
        usuarios[usuarioActual].boveda.splice(index, 1);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        cargarBoveda(); // Refrescar lista
    }
}

/// --- 9. INYECCIÓN MEJORADA ---
async function ejecutarAutocompletado(nombre, email, clave) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (n, e, p) => {
            const inputs = Array.from(document.querySelectorAll("input:not([type='hidden'])"));
            
            let iNombre = null, iEmail = null, iPass = null;

            inputs.forEach(input => {
                const info = (input.name + input.id + input.placeholder + input.getAttribute('aria-label') + input.type).toLowerCase();

                // 1. Buscar el campo de contraseña (el más fácil de hallar)
                if (input.type === "password") {
                    iPass = input;
                } 
                // 2. Buscar campo de Email o Usuario
                else if (info.includes("email") || info.includes("user") || info.includes("login") || info.includes("id")) {
                    if (!iEmail) iEmail = input;
                }
                // 3. Buscar campo de Nombre completo
                else if (info.includes("name") || info.includes("nombre") || info.includes("completo")) {
                    if (!iNombre) iNombre = input;
                }
            });

            const escribir = (el, val) => {
                if (!el) return;
                el.focus();
                // Forzamos el valor incluso en React/Angular
                const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                setter.call(el, val);
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.blur();
            };

            if (iEmail) escribir(iEmail, e);
            if (iPass) escribir(iPass, p);
            // Solo inyectamos nombre si hemos encontrado un campo distinto al de email
            if (iNombre && iNombre !== iEmail) escribir(iNombre, n);
            
            if (!iPass && !iEmail) alert("No se encontraron campos compatibles en esta página.");
        },
        args: [nombre, email, clave]
    });
}

// --- 10. CIERRE Y RESET ---
document.getElementById("btnLogOut").addEventListener("click", () => {
    usuarioActual = null;
    mostrarPantalla('login');
});

document.getElementById("btnResetTotal").addEventListener("dblclick", () => {
    if(confirm("⚠️ ¿Resetear TODO?")) { localStorage.clear(); location.reload(); }
});

// --- 11. LÓGICA DE GUARDADO ---
document.getElementById("botonGuardar").addEventListener("click", () => {
    const sitio = document.getElementById("siteName").value.trim();
    const usuario = document.getElementById("siteUser").value.trim();
    const email = document.getElementById("siteEmail").value.trim();
    const clave = document.getElementById("cajaContrasena").value.trim();

    // Validación básica
    if (!sitio || !clave) {
        return alert("⚠️ Por favor, rellena al menos el nombre del sitio y la contraseña.");
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");

    if (usuarios[usuarioActual]) {
        // Añadimos el nuevo registro al array de la bóveda del usuario
        usuarios[usuarioActual].boveda.push({
            sitio: sitio,
            usuario: usuario,
            email: email,
            clave: clave
        });

        // Guardamos de nuevo en LocalStorage
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        // Limpiamos los campos para el siguiente registro
        document.getElementById("siteName").value = "";
        document.getElementById("cajaContrasena").value = "";
        
        // Notificamos y refrescamos la lista visual
        alert("🔒 ¡Datos guardados en tu bóveda!");
        cargarBoveda();
    } else {
        alert("Error: Sesión no válida.");
    }
});