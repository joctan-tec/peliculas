let moviesArray = [];

const calificacionSignificados = {
    0: "🗑️ Inmirable. Sin ningún valor artístico, técnico o narrativo. Pérdida total de tiempo.",
    1: "❌ Muy mala. Desorganizada, mal actuada, aburrida. Difícil de terminar.",
    2: "🚫 Mala. Tiene uno o dos elementos rescatables, pero en general falla en casi todo.",
    3: "⚠️ Débil. Mal ritmo, guion flojo, actuaciones pobres. Podría haber sido mejor.",
    4: "😕 Regular-baja. Algunas ideas interesantes, pero mal ejecutadas.",
    5: "😐 Regular. Ni buena ni mala. Cumple lo básico, pero no deja huella.",
    6: "👍 Aceptable. Entretenida, con aspectos sólidos aunque no sobresalientes.",
    7: "😀 Buena. Bien hecha, te atrapa, con momentos destacables.",
    8: "👏 Muy buena. Gran ejecución, actuaciones, guion o dirección sobresalientes.",
    9: "🔥 Excelente. Impactante, original o muy bien lograda. Una experiencia memorable.",
    10: "🏆 Obra maestra. Casi perfecta. Referente en su género. Repetible y atemporal."
};

const fetchMovies = async () => {
    try {
        const response = await fetch("http://localhost:5000/peliculas");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data.peliculas;
    } catch (error) {
        console.error("There has been a problem with your fetch operation:", error);
    }
};

const cargarLocalStorage = () => {
    // Se carga la ultima pelicula vista desde el localStorage
    const lastWatchedMovie = localStorage.getItem("ultimaPeliculaVista");
    if (lastWatchedMovie) {
        const movie = JSON.parse(lastWatchedMovie);
        mostrarPeliculaSeleccionada(movie);
    }
}

const guardarLocalStorage = (movie) => {
    // Se guarda la ultima pelicula vista en el localStorage
    localStorage.setItem("ultimaPeliculaVista", JSON.stringify(movie));
}


const mostrarPeliculaSeleccionada = (movie) => {
    const displayContainer = document.getElementById("selected-movie-display");
    if (!displayContainer || !movie.enlace) return;

    displayContainer.innerHTML = `
        <p class="text-2xl font-bold mb-2">🎬 Última Película seleccionada: ${movie.nombre}</p>
        <a href="${movie.enlace}" target="_blank" class="text-blue-400 underline">Haz clic aquí para verla</a>
    `;
};

const marcarPeliculaComoVista = async (titulo) => {
    try {
        const response = await fetch(
            `http://localhost:5000/marcar_vista?titulo=${encodeURIComponent(titulo)}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al marcar la película como vista:", error);
        return null;
    }
};

const redirectToMovieLink = (movie) => {
    const displayContainer = document.getElementById("selected-movie-display");
    if (!displayContainer || !movie.enlace) return;

    displayContainer.innerHTML = `
        <p class="text-2xl font-bold mb-2">🎬 Película seleccionada: ${movie.nombre}</p>
        <a href="${movie.enlace}" target="_blank" class="text-blue-400 underline">Haz clic aquí para verla</a>
    `;
};

const selectRandomMovie2watch = async () => {
    console.log("Selecting a random movie to watch...");
    if (moviesArray.length === 0) {
        console.error("No movies available to select from");
        return;
    }

    const unwatchedMovies = moviesArray.filter((movie) => !movie.ya_vista);
    if (unwatchedMovies.length === 0) {
        console.error("No unwatched movies available");
        return;
    }

    const randomIndex = Math.floor(Math.random() * unwatchedMovies.length);
    const selectedMovie = unwatchedMovies[randomIndex];

    console.log("Selected movie to watch:", selectedMovie);

    // Guardar la película seleccionada en el localStorage
    guardarLocalStorage(selectedMovie);

    const resultado = await marcarPeliculaComoVista(selectedMovie.nombre);
    if (resultado) {
        displayMoviesCarrousel(); // Actualiza carrousel
        mostrarPeliculaSeleccionada(selectedMovie); // Muestra nombre y enlace
    }
};

function showNotification({ type = "success", title = "", message = "", duration = 3000 }) {
    const notification = document.getElementById("notification");
    const iconContainer = document.getElementById("notification-icon");
    const iconSlot = document.getElementById("notification-icon-svg");
    const notifTitle = document.getElementById("notification-title");
    const notifMessage = document.getElementById("notification-message");

    // Reset clases
    iconContainer.classList.remove("bg-emerald-500", "bg-yellow-500", "bg-red-500");
    notifTitle.classList.remove("text-emerald-500", "text-yellow-500", "text-red-500");

    // Íconos SVG como string
    const icons = {
        success: `<svg class="w-6 h-6 text-white fill-current" viewBox="0 0 20 20"><path d="M16.7 5.3a1 1 0 00-1.4 0L8 12.6 4.7 9.3a1 1 0 10-1.4 1.4l4 4a1 1 0 001.4 0l8-8a1 1 0 000-1.4z"/></svg>`,
        warning: `<svg class="w-6 h-6 text-white fill-current" viewBox="0 0 20 20"><path d="M8.257 3.099c.763-1.36 2.683-1.36 3.446 0l6.518 11.637c.75 1.34-.213 3.014-1.723 3.014H3.462c-1.51 0-2.473-1.674-1.723-3.014L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v2a1 1 0 01-1 1z"/></svg>`,
        error: `<svg class="w-6 h-6 text-white fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.54-10.46a1 1 0 00-1.42-1.42L10 8.59 7.88 6.46a1 1 0 00-1.42 1.42L8.59 10l-2.13 2.12a1 1 0 001.42 1.42L10 11.41l2.12 2.13a1 1 0 001.42-1.42L11.41 10l2.13-2.12z"/></svg>`
    };

    // Asignar clases y contenido según tipo
    switch (type) {
        case "success":
            iconContainer.classList.add("bg-emerald-500");
            notifTitle.classList.add("text-emerald-500");
            break;
        case "warning":
            iconContainer.classList.add("bg-yellow-500");
            notifTitle.classList.add("text-yellow-500");
            break;
        case "error":
            iconContainer.classList.add("bg-red-500");
            notifTitle.classList.add("text-red-500");
            break;
    }

    // Establecer el icono SVG y el contenido textual
    iconSlot.innerHTML = icons[type] || icons.success;
    notifTitle.textContent = title;
    notifMessage.textContent = message;

    // Mostrar
    notification.style.display = "flex";
    notification.style.opacity = "1";

    // Ocultar automáticamente
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.style.display = "none";
        }, 300); // Espera la transición
    }, duration);
}


const addMovie = async (event) => {
    event.preventDefault();
    const movie = {
        nombre: event.target.title.value,
        enlace: event.target.link.value,
        imagen: event.target.poster.value,
    };

    try {
        const response = await fetch("http://localhost:5000/agregar_pelicula", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(movie),
        });

        if (!response.ok) {
            throw new Error("No se pudo agregar la película");
        }

        const data = await response.json();
        console.log("Película agregada:", data);

        showNotification({
            type: "success",
            title: "Éxito",
            message: "Película agregada correctamente.",
            duration: 4000
        });


    } catch (error) {
        console.error("Error al agregar película:", error);

        showNotification({
            type: "error",
            title: "Error",
            message: "No se pudo agregar la película.",
            duration: 4000
        });
    }
    const modal = document.getElementById("dialog-add-movie");
    if (modal) {
        modal.close();
    }
    // Limpiar el formulario
    event.target.reset();
    // Actualizar el carrusel de películas
    displayMoviesCarrousel();


};

function submitRating(event) {
    event.preventDefault();

    const modal = document.getElementById("dialog-rate-movie");
    const movieId = modal.dataset.movieId;
    const ratingNovio = parseInt(document.getElementById("rating-novio").value);
    const ratingNovia = parseInt(document.getElementById("rating-novia").value);

    fetch("http://localhost:5000/calificar_pelicula", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nombre: movieId, // Asegúrate de que estás enviando el ID correcto
            calificacion_novio: ratingNovio,
            calificacion_novia: ratingNovia,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al calificar la película");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Calificación enviada:", data);
            showNotification({
                type: "success",
                title: "Éxito",
                message: "Calificación enviada correctamente.",
                duration: 4000
            });
            // Actualizar el carrousel de películas
            displayMoviesCarrousel();
            
        })
        .catch((error) => {
            console.error("Error al enviar la calificación:", error);
            showNotification({
                type: "error",
                title: "Error",
                message: "No se pudo enviar la calificación.",
                duration: 4000
            });
        }   );

        // Cerrar el modal
        modal.close();


}

const displayWatchedMoviesCarrousel = async (watchedMovies) => {
    const carrouselContainerWatched = document.getElementById("movies-carrousel-watched");
    carrouselContainerWatched.innerHTML = "";

    watchedMovies.forEach((movie) => {
        const movieDiv = document.createElement("div");
        movieDiv.className =
            "flex flex-col w-64 min-w-64 max-w-64 bg-gray-700 p-4 rounded-lg shadow-lg movie-card hover:bg-gray-800 transition duration-300 ease-in-out cursor-pointer hover:scale-102 hover:shadow-xl hover:shadow-gray-600 hover:rotate-1";

        const img = document.createElement("img");
        img.src = movie.imagen;
        img.alt = movie.nombre;
        img.className = "w-full h-full object-cover rounded-md mb-2";

        const title = document.createElement("h2");
        title.className = "text-xl text-white";
        title.textContent = movie.nombre;

        const watchedDate = document.createElement("p");
        watchedDate.className = "text-sm text-gray-400 mt-2";
        watchedDate.textContent = `Visto el: ${movie.fecha_vista}`;

        // Calificación
        const calificacionNovio = movie.calificacion_novio ?? 0;
        const calificacionNovia = movie.calificacion_novia ?? 0;
        const promedio = (calificacionNovio + calificacionNovia) / 2;

        const estrellas = document.createElement("div");
        const calificacionTexto = document.createElement("p");
        calificacionTexto.className = "text-sm text-gray-300 mt-1";

        if (promedio === 0) {
            calificacionTexto.textContent = "Calificación: No disponible aún, haz clic para calificar";
        } else {
            calificacionTexto.textContent = `Calificación: ${promedio.toFixed(1)} / 10`;

            estrellas.className = "flex items-center mt-1";
            const estrellasTotales = 5;
            const estrellasLlenas = Math.round((promedio / 10) * estrellasTotales);

            for (let i = 0; i < estrellasTotales; i++) {
                const estrella = document.createElement("span");
                estrella.textContent = i < estrellasLlenas ? "★" : "☆";
                estrella.className = "text-yellow-400 text-lg";
                estrellas.appendChild(estrella);
            }
        }

        // Agregar al contenedor
        movieDiv.appendChild(img);
        movieDiv.appendChild(title);
        movieDiv.appendChild(watchedDate);
        movieDiv.appendChild(calificacionTexto);
        movieDiv.appendChild(estrellas);

        movieDiv.addEventListener("click", () => {
    const modal = document.getElementById("dialog-rate-movie");

    if (modal) {
        // Mostrar el nombre de la peli (podés tener un elemento con ID 'modal-title' si querés mostrarlo)
        // modal.querySelector("#modal-title").textContent = movie.nombre;

        // Establecer los sliders con la calificación si ya existen
        const inputNovio = modal.querySelector("#rating-novio");
        const inputNovia = modal.querySelector("#rating-novia");

        inputNovio.value = movie.calificacion_novio ?? 5;
        inputNovia.value = movie.calificacion_novia ?? 5;

        updateRatingMeaning("novio");
        updateRatingMeaning("novia");

        // Abrir el modal
        modal.showModal();

        // Podrías guardar temporalmente cuál película se está calificando
        modal.dataset.movieId = movie.id || movie.nombre; // si tenés ID mejor
    }
});


        carrouselContainerWatched.appendChild(movieDiv);
    });
};

const displayMoviesCarrousel = async () => {
    const movies = await fetchMovies();
    moviesArray = movies; // Array global
    console.table(moviesArray);

    const carrouselContainerPending = document.getElementById("movies-carrousel-pending");

    if (!movies || movies.length === 0) {
        carrouselContainerPending.innerHTML = "<p>No movies available</p>";
        return;
    }

    carrouselContainerPending.innerHTML = "";

    // Películas vistas
    const watchedMovies = movies.filter((movie) => movie.ya_vista);
    watchedMovies.sort((b, a) => new Date(b.fecha_vista) - new Date(a.fecha_vista));

    if (watchedMovies.length > 0) {
        await displayWatchedMoviesCarrousel(watchedMovies);
    } else {
        const carrouselContainerWatched = document.getElementById("movies-carrousel-watched");
        carrouselContainerWatched.innerHTML = "<p>No watched movies available</p>";
    }

    // Películas pendientes
    movies.forEach((movie) => {
        if (movie.ya_vista) return;

        const movieDiv = document.createElement("div");
        movieDiv.className =
            "flex flex-col w-64 min-w-64 max-w-64 bg-gray-700 p-4 rounded-lg shadow-lg movie-card";

        const img = document.createElement("img");
        img.src = movie.imagen;
        img.alt = movie.nombre;
        img.className = "w-full h-full object-cover rounded-md mb-2";

        const title = document.createElement("h2");
        title.className = "text-xl text-white";
        title.textContent = movie.nombre;

        movieDiv.appendChild(img);
        movieDiv.appendChild(title);

        carrouselContainerPending.appendChild(movieDiv);
    });
};

const scrollCarrousel = (direction, carrouselType) => {
    const carrouselContainer = document.getElementById(
        carrouselType === 1
            ? "movies-carrousel-pending"
            : "movies-carrousel-watched"
    );

    const cards = carrouselContainer.querySelectorAll(".movie-card");
    const visibleIndex = getCenteredCardIndex(carrouselContainer, cards);

    const nextIndex = Math.max(0, Math.min(cards.length - 1, visibleIndex + (direction === 1 ? 1 : -1)));
    cards[nextIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
};

function getCenteredCardIndex(container, cards) {
    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
        const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
        const containerCenter = container.getBoundingClientRect().left + container.offsetWidth / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
}

    function updateRatingMeaning(tipo) {
        const value = document.getElementById(`rating-${tipo}`).value;
        document.getElementById(`rating-meaning-${tipo}`).textContent = `(${value}/10) - ${calificacionSignificados[value]}`;
    }

document.addEventListener("DOMContentLoaded", () => {
    displayMoviesCarrousel();
    cargarLocalStorage(); // Cargar la última película vista

    const btn = document.getElementById("verPeliBtn");
    const btn_add_movie = document.getElementById("addMovieBtn");
    const closeBtns = document.querySelectorAll(".close");
    if (btn) {
        btn.addEventListener("click", async function (e) {
            e.preventDefault(); // Previene cualquier comportamiento predeterminado
            e.stopPropagation(); // Por si algún listener padre lo maneja
            await selectRandomMovie2watch();
        });
    }

    closeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            btn.parentElement.close();
        });
    });

    btn_add_movie.addEventListener("click", async function (e) {
        e.preventDefault(); // Previene cualquier comportamiento predeterminado
        e.stopPropagation(); // Por si algún listener padre lo maneja
        const modal = document.getElementById("dialog-add-movie");
        if (modal) {
            modal.showModal();
        }
    });




});
