const modal = document.getElementById("miModal");
const abrir = document.getElementById("abrir");
const cerrar = document.getElementById("cerrar");

abrir.addEventListener("click", () => {
    modal.showModal(); // abre como modal (bloquea fondo)
});

cerrar.addEventListener("click", () => {
    modal.close(); // cierra el modal
});