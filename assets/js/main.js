console.log('Sucesso!');

const regionButtons = document.querySelectorAll('.region-btn');
const pokemonsContainer = document.querySelector('.pokemons');

async function fetchPokemonData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
}

async function fetchPokemonsByRegion(region) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=151&offset=${region * 151}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const pokemonPromises = data.results.map(async pokemon => {
            const pokemonData = await fetchPokemonData(pokemon.url);
            const types = pokemonData.types.map(typeObj => typeObj.type.name);
            const image = pokemonData.sprites.front_default;
            const number = `#${pokemonData.id.toString().padStart(3, '0')}`;
            return { number, name: pokemon.name, types, image, region };
        });
        const regionPokemons = await Promise.all(pokemonPromises);
        return regionPokemons;
    } catch (error) {
        console.error('Error fetching Pokémon list:', error);
    }
}

async function init() {
    const pokemonsList = await fetchPokemonsByRegion(0); // Inicia com a região Kanto

    regionButtons.forEach((button, index) => {
        button.addEventListener('click', async () => {
            regionButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const region = index;
            const regionPokemons = await fetchPokemonsByRegion(region);
            renderPokemons(regionPokemons);
        });
    });

    renderPokemons(pokemonsList);
}

function renderPokemons(pokemonsList) {
    pokemonsContainer.innerHTML = '';

    pokemonsList.forEach(pokemon => {
        const typesHTML = pokemon.types.map(type => {
            const typeClass = `type-${type}`;
            return `<li class="type ${typeClass}">${type}</li>`;
        }).join('');

        // Use o primeiro tipo como base para a cor de fundo
        const backgroundType = pokemon.types[0];

        const pokemonHTML = `
            <li class="pokemon type-${backgroundType}">
                <span class="number">${pokemon.number}</span>
                <span class="name">${pokemon.name}</span>

                <div class="detail">
                    <ol class="types">
                        ${typesHTML}
                    </ol>

                    <img src="${pokemon.image}" alt="${pokemon.name}">
                </div>
            </li>
        `;

        pokemonsContainer.innerHTML += pokemonHTML;
    });
}

init();
