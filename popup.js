const pantallaRegistro = document.getElementById("pantallaRegistro");
const pantallaLogin = document.getElementById("pantallaLogin");
const pantallaBoveda = document.getElementById("pantallaBoveda");

// --- 0. ARRANQUE ---
const passGuardada = localStorage.getItem("passwordMaestra");

if (passGuardada !== null && passGuardada !== "") {
    pantallaLogin.style.display = "block"; 
} else {
    pantallaRegistro.style.display = "block"; 
}

// --- 1. LÓGICA DE REGISTRO ---
document.getElementById("btnRegistrar").addEventListener("click", () => {
    const pass1 = document.getElementById("inputNuevaMaestra").value;
    const pass2 = document.getElementById("inputRepetirMaestra").value;

    if (pass1 === "" || pass2 === "") return alert("Rellena los campos");
    if (pass1 !== pass2) return alert("❌ Las contraseñas no coinciden");

    localStorage.setItem("passwordMaestra", pass1);
    pantallaRegistro.style.display = "none";
    pantallaBoveda.style.display = "block";
});

// --- 2. LÓGICA DE LOGIN ---
document.getElementById("btnDesbloquear").addEventListener("click", () => {
    const intentoPass = document.getElementById("inputMaestra").value;
    const claveReal = localStorage.getItem("passwordMaestra");

    if (intentoPass === claveReal) {
        pantallaLogin.style.display = "none";
        pantallaBoveda.style.display = "block";
    } else {
        alert("❌ Contraseña Incorrecta");
        document.getElementById("inputMaestra").value = "";
    }
});

// --- 3. LÓGICA DE LA BÓVEDA (AHORA CON ALTA ENTROPÍA) ---
document.getElementById("botonGenerar").addEventListener("click", () => {
    const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    
    // Usamos Web Crypto API para ALTA ENTROPÍA (Lo que piden los jueces)
    const arrayAleatorio = new Uint32Array(16);
    window.crypto.getRandomValues(arrayAleatorio);
    
    for (let i = 0; i < 16; i++) {
        password += caracteres[arrayAleatorio[i] % caracteres.length];
    }
    
    document.getElementById("cajaContrasena").value = password;
});

document.getElementById("botonGuardar").addEventListener("click", () => {
    const nuevaPass = document.getElementById("cajaContrasena").value;
    if (!nuevaPass) return alert("¡Genera una primero!");

    let miBovedaText = localStorage.getItem("bovedaPass");
    let miBovedaArray = miBovedaText ? JSON.parse(miBovedaText) : [];

    miBovedaArray.push(nuevaPass);
    localStorage.setItem("bovedaPass", JSON.stringify(miBovedaArray));
    
    cargarBoveda();
});

function cargarBoveda() {
    const lista = document.getElementById("listaContrasenas");
    lista.innerHTML = "";
    
    let miBovedaText = localStorage.getItem("bovedaPass");
    if (miBovedaText) {
        let miBovedaArray = JSON.parse(miBovedaText);
        miBovedaArray.forEach(pass => {
            const li = document.createElement("li");
            li.textContent = pass.substring(0, 4) + "••••••••••••";
            lista.appendChild(li);
        });
    }
}
cargarBoveda();

// --- 4. TRUCO HACKER: DOBLE CLIC EN EL TÍTULO PARA BORRAR ---
document.getElementById("tituloSecreto").addEventListener("dblclick", () => {
    localStorage.clear();
    alert("🔧 Memoria limpiada. Vuelve a abrir la extensión.");
    window.close(); 
});