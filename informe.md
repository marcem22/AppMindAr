Botón de Compartir Nativo

Compartir desde el visor 3D: Se incorporó un botón de compartir en la pantalla de cada experiencia, alineado al diseño existente, que invoca el menú nativo del dispositivo para enviar el link del objeto por WhatsApp, Instagram, Telegram o mail.
Link del objeto con preview: El compartir envía el link limpio de la experiencia (no el archivo 3D) y, cuando el sistema lo permite, adjunta la imagen de preview del objeto.
Compartir en modo proyección AR (iOS): Se configuró canonicalWebPageURL sobre el .usdz para que, al usar el compartir dentro de AR Quick Look, se envíe el link de la experiencia y no el archivo .usdz.
Navegación en links compartidos: Se corrigió la flecha de volver para visitas que abren un objeto desde un link compartido: al no existir historial previo, redirige al inicio de la aplicación.
URL corta de compartido: Se implementó un formato compacto de link (?ref=categoria.modelo) compatible con el share de Quick Look y con la carga completa del objeto desde el catálogo.