![Logo]()



Gemini ha dicho
🔐 Vault Keys: Tu Bóveda Digital Definitiva
¿Cansado de usar la misma contraseña para todo o de darle a "He olvidado mi contraseña" cada dos por tres? Aquí es donde entra Vault Keys, una extensión para Chrome que transforma tu navegador en una caja fuerte impenetrable.

A nivel técnico, es un proyecto súper elegante y bien optimizado. A nivel de usuario, es literalmente un salvavidas. Te explico exactamente qué hace y por qué es tan brutal.

🚀 ¿Cómo funciona por debajo del capó?
A diferencia de las apps comerciales que suben tus datos a servidores lejanos, Vault Keys está programado con una filosofía Offline-First (todo se queda en tu ordenador). Funciona a través de cuatro pilares clave:

Almacenamiento Local (Local Storage): No hay bases de datos en la nube que un hacker pueda robar. Toda tu bóveda se guarda encriptada directamente en la memoria de tu navegador Chrome. Si te cortan el internet, tu gestor sigue funcionando al 100%.

Seguridad de Acceso Estricta: Para entrar, necesitas una Clave Maestra (que te obliga a usar letras, números y un mínimo de 8 caracteres) y validar un formato de correo real.

Inyección en el DOM (Auto-rellenado): Esta es la verdadera magia. Cuando le das al botón de "INYECTAR", la extensión lanza un script que rastrea la web en la que estás buscando las cajas de texto (los <input>). Cuando detecta los campos de usuario y contraseña, inyecta los datos directamente en el código de la página web sin que tú toques el teclado.

Recuperación Criptográfica: Si olvidas tu Clave Maestra, no hay un botón mágico que te mande un email. Usa un sistema de "Recovery Key" (como las carteras de criptomonedas). Al registrarte te da un código secreto y único (ej. VK-X89J21). Si lo pierdes, despídete de tus contraseñas. Esto garantiza que nadie, ni siquiera el creador de la app, pueda entrar a tu cuenta.

🛡️ Los Motores de Generación
Crear contraseñas seguras es un arte, y esta extensión tiene dos motores de generación distintos:

Motor Matemático Local: Utiliza la criptografía de tu propio ordenador (window.crypto.getRandomValues) para generar una cadena de 16 caracteres totalmente caótica. Además, viene preparado para contrastar esa contraseña contra una base de datos local (un rockyou_mini.txt o leyendo por tandadas) para asegurarse de que la contraseña generada no es una de las típicas que usan los hackers para reventar cuentas.

Motor Avanzado por API: Si quieres verdadera aleatoriedad, la extensión se conecta a los servidores de Random.org, que generan números aleatorios basándose en ruido atmosférico real, creando contraseñas humanamente imposibles de predecir.

⭐ ¿Por qué es tan buena esta aplicación?
Básicamente, porque te da el control total sin devorar los recursos de tu PC. Las extensiones de Chrome tienen que ser ligeras, y el código de Vault Keys está tan optimizado que no colapsa la memoria RAM ni aunque haga cálculos complejos.

Para que lo veas más claro, aquí tienes una comparación rápida:

Característica	🔑 Vault Keys	☁️ Gestores en la Nube	📝 El bloc de notas del móvil
Privacidad	Total. Los datos no salen de tu PC.	Tus datos viven en servidores de terceros.	Cualquiera que coja tu móvil lo ve.
Velocidad	Instantánea. Inyecta el código en milisegundos.	Depende de tu conexión a internet.	Tienes que copiar y pegar a mano.
Seguridad de Creación	Comprueba bases de datos y ruido atmosférico.	Generadores estándar.	"MiPerroToby2024"
Diseño y UX	Estética Dark Mode con notificaciones elegantes.	Interfaces lentas y llenas de publicidad.	Aburrido y desorganizado.
En resumen: es un proyecto que coge tecnologías web puras (HTML, CSS, Vanilla JavaScript, Regex y la API de Chrome) y las exprime al máximo para darte una herramienta de ciberseguridad que puedes usar en tu día a día.
*Proyecto creado para el Reto Gradiant - HackUDC 2026*
