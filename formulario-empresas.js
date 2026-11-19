const contenedorFormularioEmpresas = document.querySelector("#formulario-empresas");
const botonAgenda = document.querySelector(".botonAgendaFlotante");

if (contenedorFormularioEmpresas && botonAgenda && "IntersectionObserver" in window) {
    const observarFormularioEmpresas = new IntersectionObserver(([entrada]) => {
        botonAgenda.hidden = entrada.isIntersecting;
    });

    observarFormularioEmpresas.observe(contenedorFormularioEmpresas);
}
