const cabecera = document.querySelector(".ctnHeader");
const botonMenu = cabecera.querySelector(".botonMenu");
const menuPrincipal = document.querySelector("#menuPrincipal");
const vistaMenuCompacto = window.matchMedia("(max-width: 1270px)");

function mostrarMenu(abierto) {
    botonMenu.setAttribute("aria-expanded", String(abierto));
    menuPrincipal.inert = !abierto;
}

function actualizarMenu() {
    botonMenu.hidden = !vistaMenuCompacto.matches;
    mostrarMenu(!vistaMenuCompacto.matches);
}

botonMenu.addEventListener("click", () => {
    mostrarMenu(botonMenu.getAttribute("aria-expanded") === "false");
});

menuPrincipal.addEventListener("click", (evento) => {
    if (vistaMenuCompacto.matches && evento.target.closest("a")) {
        mostrarMenu(false);
    }
});

cabecera.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && vistaMenuCompacto.matches && !menuPrincipal.inert) {
        mostrarMenu(false);
        botonMenu.focus();
    }
});

document.addEventListener("pointerdown", (evento) => {
    if (vistaMenuCompacto.matches && !menuPrincipal.inert && !cabecera.contains(evento.target)) {
        mostrarMenu(false);
    }
});

function actualizarSombraCabecera() {
    cabecera.classList.toggle("conScroll", window.scrollY > 12);
}

vistaMenuCompacto.addEventListener("change", actualizarMenu);
window.addEventListener("scroll", actualizarSombraCabecera, { passive: true });
cabecera.classList.add("menuListo");
actualizarMenu();
actualizarSombraCabecera();

const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
const sensibilidadArrastre = 2;

function iniciarCarrusel(carrusel) {
    const pista = carrusel.querySelector(".pistaCarrusel");
    const tarjetas = Array.from(pista.children);
    const controles = carrusel.querySelector(".controlesCarrusel");
    const puntosCarrusel = carrusel.querySelector(".puntosCarrusel");
    const flechaAnterior = controles.querySelector('[data-paso="-1"]');
    const flechaSiguiente = controles.querySelector('[data-paso="1"]');
    const etiquetas = {
        fase: "Mostrar fase",
        perfil: "Mostrar desde el perfil",
        testimonio: "Mostrar testimonio"
    };
    const etiquetaPunto = etiquetas[carrusel.dataset.carrusel];

    let posiciones = [0];
    let puntoActivo = 0;
    let arrastre = null;

    function actualizarControles() {
        flechaAnterior.disabled = pista.scrollLeft <= posiciones[0] + 1;
        flechaSiguiente.disabled = pista.scrollLeft >= posiciones.at(-1) - 1;
        Array.from(puntosCarrusel.children).forEach((punto, indice) => {
            punto.setAttribute("aria-current", String(indice === puntoActivo));
        });
    }

    function irAPosicion(indice) {
        if (indice < 0) return;

        pista.scrollTo({
            left: posiciones[indice],
            behavior: movimientoReducido.matches ? "instant" : "smooth"
        });
    }

    function posicionMasCercana() {
        const desplazamiento = pista.scrollLeft;
        return posiciones.reduce((indiceCercano, posicion, indice) => {
            return Math.abs(desplazamiento - posicion) < Math.abs(desplazamiento - posiciones[indiceCercano])
                ? indice
                : indiceCercano;
        }, 0);
    }

    function actualizarPuntoActivo() {
        puntoActivo = posicionMasCercana();
        actualizarControles();
    }

    function actualizarCarrusel() {
        const maximo = Math.max(0, pista.scrollWidth - pista.clientWidth);
        const centroPista = pista.getBoundingClientRect().left + pista.clientWidth / 2;
        posiciones = maximo <= 1 ? [0] : [...new Set(tarjetas.map((tarjeta) => {
            const rect = tarjeta.getBoundingClientRect();
            const centroTarjeta = rect.left + rect.width / 2;
            const distancia = pista.scrollLeft + centroTarjeta - centroPista;
            return Math.max(0, Math.min(Math.round(distancia), maximo));
        }))];

        const hayDesplazamiento = posiciones.length > 1;
        controles.hidden = !hayDesplazamiento;
        pista.classList.toggle("desplazable", hayDesplazamiento);
        pista.tabIndex = hayDesplazamiento ? 0 : -1;

        if (puntosCarrusel.childElementCount !== posiciones.length) {
            const puntos = posiciones.map((_, indice) => {
                const punto = document.createElement("button");
                punto.type = "button";
                punto.className = "puntoCarrusel";
                punto.setAttribute("aria-label", `${etiquetaPunto} ${indice + 1}`);
                punto.setAttribute("aria-controls", pista.id);
                punto.addEventListener("click", () => irAPosicion(indice));
                return punto;
            });

            puntosCarrusel.replaceChildren(...puntos);
        }

        actualizarPuntoActivo();
    }

    flechaAnterior.addEventListener("click", () => {
        irAPosicion(posiciones.findLastIndex(posicion => posicion < pista.scrollLeft - 1));
    });
    flechaSiguiente.addEventListener("click", () => {
        irAPosicion(posiciones.findIndex(posicion => posicion > pista.scrollLeft + 1));
    });

    // El ratón arrastra la fila; en pantallas táctiles se conserva el gesto nativo.
    pista.addEventListener("pointerdown", (evento) => {
        if (evento.pointerType !== "mouse" || evento.button !== 0 || posiciones.length < 2) return;

        evento.preventDefault();
        arrastre = {
            puntero: evento.pointerId,
            inicioX: evento.clientX,
            inicioScroll: pista.scrollLeft
        };
    });

    window.addEventListener("pointermove", (evento) => {
        if (!arrastre || arrastre.puntero !== evento.pointerId) return;
        if (!(evento.buttons & 1)) {
            terminarArrastre(evento);
            return;
        }

        const distancia = evento.clientX - arrastre.inicioX;
        if (Math.abs(distancia) < 3 && !pista.classList.contains("arrastrando")) return;

        pista.classList.add("arrastrando");
        pista.scrollLeft = arrastre.inicioScroll - distancia * sensibilidadArrastre;
    });

    function terminarArrastre(evento) {
        if (!arrastre || arrastre.puntero !== evento.pointerId) return;
        arrastre = null;
        pista.classList.remove("arrastrando");
    }

    window.addEventListener("pointerup", terminarArrastre);
    window.addEventListener("pointercancel", terminarArrastre);

    pista.addEventListener("scroll", actualizarPuntoActivo, { passive: true });
    new ResizeObserver(actualizarCarrusel).observe(pista);
}

document.querySelectorAll("[data-carrusel]").forEach(iniciarCarrusel);

// Cada entrada se activa una vez sin escuchar el scroll de la página.
if ("IntersectionObserver" in window && !movimientoReducido.matches) {
    const observarEntradas = new IntersectionObserver((entradas, observador) => {
        entradas.forEach(({ isIntersecting, target }) => {
            if (!isIntersecting) return;

            observador.unobserve(target);
            if (!movimientoReducido.matches && !target.matches(":focus-within")) {
                target.classList.add("entradaActiva");
            }
        });
    }, { rootMargin: "0px 0px 32px" });

    document.querySelectorAll("[data-entrada]").forEach((elemento) => {
        observarEntradas.observe(elemento);
    });

    function limpiarEntrada(evento) {
        if (evento.animationName === "aparecer") {
            evento.target.classList.remove("entradaActiva");
        }
    }

    document.addEventListener("animationend", limpiarEntrada);
    document.addEventListener("animationcancel", limpiarEntrada);
}
