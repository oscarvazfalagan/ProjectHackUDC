const pantallas = {
    bienvenida: document.getElementById("pantallaBienvenida"),
    registro: document.getElementById("pantallaRegistro"),
    login: document.getElementById("pantallaLogin"),
    boveda: document.getElementById("pantallaBoveda")
};

// 🛡️ DICCIONARIO KAGGLE/ROCKYOU (Subset de las más comunes para el MVP)
const blacklistRockyou = [
    "12345678", "password", "12345678a", "qwertyuiop", "dragon", "123456789", 
    "pancarta", "admin123", "contraseña", "iloveyou", "password123", "abc12345"
    // Nota: Aquí podrías pegar las primeras 500 de tu documento descargado
];

let usuarioActual = null;

// --- 0. ARRANQUE: COMPROBAR GESTOR PREDETERMINADO ---
function comprobarPredeterminado() {
    if (!localStorage.getItem("esPredeterminado")) {
        document.getElementById("bannerPredeterminado").style.display = "block";
    }
}
comprobarPredeterminado();

document.getElementById("btnAceptarPredeterminado").addEventListener("click", () => {
    localStorage.setItem("esPredeterminado", "true");
    document.getElementById("bannerPredeterminado").style.display = "none";
    if (typeof chrome !== "undefined" && chrome.privacy && chrome.privacy.services) {
        chrome.privacy.services.passwordSavingEnabled.set({ value: false, scope: 'regular' }, () => {
            alert("✅ Vault Keys activado.");
        });
    }
});

document.getElementById("btnIgnorarPredeterminado").addEventListener("click", () => {
    document.getElementById("bannerPredeterminado").style.display = "none";
});

// --- 1. CONTROL DE USUARIO ---
let ultimoUsuario = localStorage.getItem("ultimoUsuario");
function mostrarPantalla(id) {
    Object.values(pantallas).forEach(p => p.classList.add("oculto"));
    pantallas[id].classList.remove("oculto");
}
if (ultimoUsuario) {
    document.getElementById("loginUsuario").value = ultimoUsuario;
    mostrarPantalla('login');
} else {
    mostrarPantalla('bienvenida');
}

// --- 2. NAVEGACIÓN ---
document.getElementById("btnIrALogin").addEventListener("click", () => mostrarPantalla('login'));
document.getElementById("btnIrARegistro").addEventListener("click", () => mostrarPantalla('registro'));
document.getElementById("volverBienvenidaReg").addEventListener("click", () => mostrarPantalla('bienvenida'));
document.getElementById("volverBienvenidaLog").addEventListener("click", () => mostrarPantalla('bienvenida'));

// --- 3. LÓGICA DE REGISTRO (CON VALIDACIÓN KAGGLE) ---
document.getElementById("btnRegistrar").addEventListener("click", () => {
    const user = document.getElementById("regUsuario").value.trim();
    const p1 = document.getElementById("regPass").value;
    const p2 = document.getElementById("regPassRepetir").value;

    if (!user || !p1) return alert("Rellena todos los campos.");
    if (p1 !== p2) return alert("Las contraseñas no coinciden.");

    // 1. COMPROBACIÓN CONTRA ROCKYOU/KAGGLE 🚨
    if (blacklistRockyou.includes(p1.toLowerCase())) {
        return alert("⚠️ SEGURIDAD CRÍTICA: Esta contraseña aparece en la base de datos de filtraciones (Rockyou/Kaggle). ¡Elige una más segura!");
    }

    // 2. COMPROBACIÓN DE ROBUSTEZ (REGEX)
    const tieneLetras = /[a-zA-Z]/.test(p1);
    const tieneNumeros = /[0-9]/.test(p1);
    if (p1.length < 8 || !tieneLetras || !tieneNumeros) {
        return alert("❌ La Clave Maestra debe tener mínimo 8 caracteres, letras y números.");
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    if (usuarios[user]) return alert("Este usuario ya existe.");

    usuarios[user] = { masterPass: p1, boveda: [] };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("ultimoUsuario", user);
    
    alert("¡Cuenta creada!");
    document.getElementById("loginUsuario").value = user;
    mostrarPantalla('login');
});

// --- EL RESTO DEL CÓDIGO (Login, Generar, Guardar) SE MANTIENE IGUAL ---
document.getElementById("btnDesbloquear").addEventListener("click", () => {
    const user = document.getElementById("loginUsuario").value.trim();
    const pass = document.getElementById("loginPass").value;
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    if (usuarios[user] && usuarios[user].masterPass === pass) {
        usuarioActual = user;
        localStorage.setItem("ultimoUsuario", user); 
        document.getElementById("saludo").textContent = "Bóveda protegida de: " + user;
        mostrarPantalla('boveda');
        cargarBoveda();
    } else { alert("Error de acceso."); }
});

document.getElementById("botonGenerar").addEventListener("click", () => {
    const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let password = "";
    const randomArray = new Uint32Array(16);
    window.crypto.getRandomValues(randomArray);
    for (let i = 0; i < 16; i++) { password += caracteres[randomArray[i] % caracteres.length]; }
    document.getElementById("cajaContrasena").value = password;
});

document.getElementById("botonGuardar").addEventListener("click", () => {
    const pass = document.getElementById("cajaContrasena").value;
    if (!pass) return alert("Genera una contraseña primero.");
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    usuarios[usuarioActual].boveda.push(pass);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarBoveda();
});

function cargarBoveda() {
    const lista = document.getElementById("listaContrasenas");
    lista.innerHTML = "";
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    if (usuarios[usuarioActual] && usuarios[usuarioActual].boveda) {
        usuarios[usuarioActual].boveda.forEach(p => {
            const li = document.createElement("li");
            li.textContent = p.substring(0, 6) + " ••••••••••";
            lista.appendChild(li);
        });
    }
}

document.getElementById("btnLogOut").addEventListener("click", () => {
    usuarioActual = null;
    mostrarPantalla('login');
});

document.getElementById("btnResetTotal").addEventListener("dblclick", () => {
    if(confirm("⚠️ ¿Resetear sistema?")) { localStorage.clear(); location.reload(); }
});