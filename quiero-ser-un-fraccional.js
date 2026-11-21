const formularioPostulacion = document.querySelector("#formularioPostulacion");
const pasosPostulacion = Array.from(formularioPostulacion.querySelectorAll("[data-paso-postulacion]"));
const textoProgreso = formularioPostulacion.querySelector("#textoProgreso");
const nombrePasoPostulacion = formularioPostulacion.querySelector("#nombrePasoPostulacion");
const indicadorProgreso = formularioPostulacion.querySelector("progress");
const listaPasosPostulacion = formularioPostulacion.querySelector(".listaPasosPostulacion");
const marcasPostulacion = Array.from(listaPasosPostulacion.children);
const botonAnterior = formularioPostulacion.querySelector("[data-anterior]");
const botonSiguiente = formularioPostulacion.querySelector("[data-siguiente]");
const enlaceEnvioOficial = formularioPostulacion.querySelector("[data-envio-oficial]");
let pasoActual = 0;

function validarOpciones(grupo) {
    const casillas = Array.from(grupo.querySelectorAll('input[type="checkbox"]'));
    const marcadas = casillas.filter(casilla => casilla.checked).length;
    const maximo = Number(grupo.dataset.maximo);
    let mensaje = "";

    if (marcadas === 0) mensaje = "Selecciona al menos una opción.";
    if (maximo && marcadas > maximo) mensaje = `Selecciona hasta ${maximo} opciones.`;

    casillas[0].setCustomValidity(mensaje);
}

function validarPaso() {
    const paso = pasosPostulacion[pasoActual];
    paso.querySelectorAll("[data-opciones-requeridas]").forEach(validarOpciones);
    return Array.from(paso.querySelectorAll("input, select, textarea")).every(campo => campo.reportValidity());
}

function mostrarPaso(indice) {
    pasosPostulacion[pasoActual].hidden = true;
    const paso = pasosPostulacion[indice];
    paso.hidden = false;
    pasoActual = indice;

    const esUltimo = indice === pasosPostulacion.length - 1;
    nombrePasoPostulacion.textContent = paso.dataset.pasoPostulacion;
    textoProgreso.textContent = `Paso ${indice + 1} de ${pasosPostulacion.length}`;
    indicadorProgreso.value = indice + 1;
    listaPasosPostulacion.style.setProperty("--avance-pasos", indice / (pasosPostulacion.length - 1));
    marcasPostulacion.forEach((marca, posicion) => {
        marca.classList.toggle("pasoCompleto", posicion < indice);
        if (posicion === indice) marca.setAttribute("aria-current", "step");
        else marca.removeAttribute("aria-current");
    });
    botonAnterior.hidden = indice === 0;
    botonSiguiente.hidden = esUltimo;
    enlaceEnvioOficial.hidden = !esUltimo;
    textoProgreso.scrollIntoView({ block: "start" });
    paso.querySelector("h2").focus({ preventScroll: true });
}

formularioPostulacion.addEventListener("submit", evento => evento.preventDefault());
formularioPostulacion.addEventListener("change", evento => {
    const grupo = evento.target.closest("[data-opciones-requeridas]");
    if (grupo) validarOpciones(grupo);
});

botonAnterior.addEventListener("click", () => mostrarPaso(pasoActual - 1));
botonSiguiente.addEventListener("click", () => {
    if (validarPaso()) mostrarPaso(pasoActual + 1);
});
