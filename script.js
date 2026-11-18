
const input = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");

const musicContainer = document.querySelector("#music-container");
const errorMessage = document.querySelector("#error-message");
const loader = document.querySelector("#loader");

const allBtn = document.querySelector("#all-btn");
const favoritesBtn = document.querySelector("#favorites-btn");
const clearFavoritesBtn = document.querySelector("#clear-favorites-btn");

const sortSelect = document.querySelector("#sort-select");



let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

let currentSongs = [];
let currentView = "all";


searchBtn.addEventListener("click", function () {

    const song = input.value.trim();

    if (song === "") {
        errorMessage.textContent = "Please enter a song or artist name.";
        return;
    }

    getMusic(song);
});



input.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        searchBtn.click();
    }

});


async function getMusic(song) {

    try {

        errorMessage.textContent = "";
        musicContainer.innerHTML = "";

        loader.classList.remove("hidden");

        currentView = "all";

        allBtn.classList.add("active");
        favoritesBtn.classList.remove("active");

        sortSelect.value = "default";

        const url =
            `https://itunes.apple.com/search?term=${encodeURIComponent(song)}&entity=song&limit=20`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to fetch music.");
        }

        const data = await response.json();

        currentSongs = data.results;

        if (currentSongs.length === 0) {
            errorMessage.textContent =
                "No songs found. Try another search.";
            return;
        }

        displayMusic(currentSongs);

    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            "Unable to load music. Please check your internet connection.";

    } finally {

        loader.classList.add("hidden");

    }
}


function displayMusic(songs) {

    musicContainer.innerHTML = "";

    if (songs.length === 0) {
        return;
    }

    songs.forEach(function (song) {

        const card = document.createElement("div");
        card.classList.add("music-card");



        const image = document.createElement("img");

        image.src = song.artworkUrl100 || "";
        image.alt = song.trackName + " album cover";



        const title = document.createElement("h3");

        title.textContent = song.trackName;



        const artist = document.createElement("p");

        artist.textContent = song.artistName;


        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(artist);



        if (song.previewUrl) {

            const audio = document.createElement("audio");

            audio.controls = true;
            audio.src = song.previewUrl;
            audio.preload = "none";

            card.appendChild(audio);

        } else {

            const unavailable = document.createElement("p");

            unavailable.textContent = "Preview not available";

            card.appendChild(unavailable);

        }



        const favoriteBtn = document.createElement("button");

        favoriteBtn.classList.add("favorite-btn");

        const isFavorite = favorites.some(function (item) {
            return item.trackId === song.trackId;
        });

        if (isFavorite) {

            favoriteBtn.textContent = "♥ Remove Favourite";
            favoriteBtn.classList.add("saved");

        } else {

            favoriteBtn.textContent = "♡ Add Favourite";

        }

        favoriteBtn.addEventListener("click", function () {
            toggleFavorite(song);
        });

        card.appendChild(favoriteBtn);

        musicContainer.appendChild(card);

    });

}


function toggleFavorite(song) {

    const existingIndex = favorites.findIndex(function (item) {
        return item.trackId === song.trackId;
    });

    if (existingIndex === -1) {

        favorites.push(song);

    } else {

        favorites.splice(existingIndex, 1);

    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    if (currentView === "favorites") {

        showFavorites();

    } else {

        displaySortedSongs(currentSongs);

    }

}


allBtn.addEventListener("click", showAllSongs);

function showAllSongs() {

    currentView = "all";

    allBtn.classList.add("active");
    favoritesBtn.classList.remove("active");

    errorMessage.textContent = "";

    displaySortedSongs(currentSongs);

}


favoritesBtn.addEventListener("click", showFavorites);

function showFavorites() {

    currentView = "favorites";

    favoritesBtn.classList.add("active");
    allBtn.classList.remove("active");

    errorMessage.textContent = "";

    if (favorites.length === 0) {

        musicContainer.innerHTML = "";

        errorMessage.textContent =
            "You have no favourite songs yet.";

        return;
    }

    displaySortedSongs(favorites);

}


clearFavoritesBtn.addEventListener("click", function () {

    if (favorites.length === 0) {

        errorMessage.textContent =
            "No favourite songs to remove.";

        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to remove all favourite songs?"
    );

    if (confirmDelete) {

        favorites = [];

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

        errorMessage.textContent =
            "All favourites removed!";

        if (currentView === "favorites") {

            musicContainer.innerHTML = "";

        } else {

            displaySortedSongs(currentSongs);

        }

    }

});


sortSelect.addEventListener("change", function () {

    if (currentView === "favorites") {

        displaySortedSongs(favorites);

    } else {

        displaySortedSongs(currentSongs);

    }

});


function displaySortedSongs(songs) {

    const sortedSongs = [...songs];

    if (sortSelect.value === "title") {

        sortedSongs.sort(function (a, b) {
            return a.trackName.localeCompare(b.trackName);
        });

    } else if (sortSelect.value === "artist") {

        sortedSongs.sort(function (a, b) {
            return a.artistName.localeCompare(b.artistName);
        });

    }

    displayMusic(sortedSongs);

}

getMusic("popular songs");
