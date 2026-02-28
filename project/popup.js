const pantallas = {
    bienvenida: document.getElementById("pantallaBienvenida"),
    registro: document.getElementById("pantallaRegistro"),
    login: document.getElementById("pantallaLogin"),
    boveda: document.getElementById("pantallaBoveda")
};

let usuarioActual = null;

// --- NAVEGACIÓN ---
function mostrarPantalla(id) {
    Object.values(pantallas).forEach(p => p.classList.add("oculto"));
    pantallas[id].classList.remove("oculto");
}

// Botones de la pantalla de inicio (SÍ / NO)
document.getElementById("btnIrALogin").addEventListener("click", () => mostrarPantalla('login'));
document.getElementById("btnIrARegistro").addEventListener("click", () => mostrarPantalla('registro'));
document.getElementById("volverBienvenidaReg").addEventListener("click", () => mostrarPantalla('bienvenida'));
document.getElementById("volverBienvenidaLog").addEventListener("click", () => mostrarPantalla('bienvenida'));

// --- LÓGICA DE REGISTRO ---
document.getElementById("btnRegistrar").addEventListener("click", () => {
    const user = document.getElementById("regUsuario").value.trim();
    const p1 = document.getElementById("regPass").value;
    const p2 = document.getElementById("regPassRepetir").value;

    if (!user || !p1) return alert("Rellena todos los campos.");
    if (p1 !== p2) return alert("Las contraseñas no coinciden.");

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    if (usuarios[user]) return alert("Este usuario ya existe.");

    // Guardamos el nuevo usuario con su bóveda vacía
    usuarios[user] = { masterPass: p1, boveda: [] };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    alert("¡Cuenta creada! Ahora inicia sesión.");
    mostrarPantalla('login');
});

// --- LÓGICA DE LOGIN ---
document.getElementById("btnDesbloquear").addEventListener("click", () => {
    const user = document.getElementById("loginUsuario").value.trim();
    const pass = document.getElementById("loginPass").value;
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");

    if (usuarios[user] && usuarios[user].masterPass === pass) {
        usuarioActual = user;
        document.getElementById("saludo").textContent = "Bóveda de: " + user;
        mostrarPantalla('boveda');
        cargarBoveda();
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
});

// --- LÓGICA DE LA BÓVEDA ---
document.getElementById("botonGenerar").addEventListener("click", () => {
    const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let password = "";
    // Web Crypto API para alta entropía
    const randomArray = new Uint32Array(16);
    window.crypto.getRandomValues(randomArray);
    for (let i = 0; i < 16; i++) {
        password += caracteres[randomArray[i] % caracteres.length];
    }
    document.getElementById("cajaContrasena").value = password;
});

document.getElementById("botonGuardar").addEventListener("click", () => {
    const pass = document.getElementById("cajaContrasena").value;
    if (!pass) return alert("Genera una contraseña primero.");

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    usuarios[usuarioActual].boveda.push(pass);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    cargarBoveda();
    document.getElementById("cajaContrasena").value = "";
});

function cargarBoveda() {
    const lista = document.getElementById("listaContrasenas");
    lista.innerHTML = "";
    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "{}");
    
    usuarios[usuarioActual].boveda.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p.substring(0, 6) + " ••••••••••";
        lista.appendChild(li);
    });
}

// --- CERRAR SESIÓN ---
document.getElementById("btnLogOut").addEventListener("click", () => {
    usuarioActual = null;
    mostrarPantalla('bienvenida');
});

// --- EL RESETEO TOTAL (DOBLE CLIC EN EL TÍTULO) ---
document.getElementById("btnResetTotal").addEventListener("dblclick", () => {
    if(confirm("⚠️ ¿Quieres borrar TODOS los usuarios y datos de Vault Keys?")) {
        localStorage.clear();
        alert("Sistema reseteado.");
        location.reload();
    }
});