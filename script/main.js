const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const SERVER = 'https://api.themoviedb.org/3';
const API_KEY = 'ee71f56347382cd174feffd4e475522a';
const leftMenu = document.querySelector('.left-menu'),
  image = document.querySelectorAll('.tv-card__img'),
  hamburger = document.querySelector('.hamburger'),
  tvShowsList = document.querySelector('.tv-shows__list'),
  modal = document.querySelector('.modal'),
  tvShows = document.querySelector('.tv-shows'),
  tvCardImg = document.querySelector('.tv-card__img'),
  modalTitle = document.querySelector('.modal__title'),
  genresList = document.querySelector('.genres-list'),
  rating = document.querySelector('.rating'),
  description = document.querySelector('.description'),
  modalLink = document.querySelector('.modal__link'),
  searchForm = document.querySelector('.search__form'),
  searchFormInput = document.querySelector('.search__form-input'),
  preloader = document.querySelector('.preloader'),
  dropdown = document.querySelectorAll('.dropdown'),
  tvShowsHead = document.querySelector('.tv-shows__head'),
  posterWrapper = document.querySelector('.poster__wrapper'),
  modalContent = document.querySelector('.modal__content');

const loading = document.createElement('div');
loading.className = 'loading';

const DBService = class {
  constructor() {
    this.SERVER = 'https://api.themoviedb.org/3';
    this.API_KEY = 'ee71f56347382cd174feffd4e475522a';
  }
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`не получил данные по адрессу ${url}`);
    }
  };

  getTestData = () => {
    return this.getData('test.json');
  };
  getTestCard = () => {
    return this.getData('card.json');
  };

  getSearchResult = (query) => {
    return this.getData(
      `${this.SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`
    );
  };
  getTvShows = (id) => {
    return this.getData(
      `${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`
    );
  };

  getTopRated = () =>
    this.getData(
      `${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`
    );

  getPopular = () =>
    this.getData(
      `${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`
    );
  getAiringToday = () =>
    this.getData(
      `${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`
    );
  getOnTheAir = () =>
    this.getData(
      `${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`
    );
};

const renderCard = (response, target) => {
  tvShowsList.textContent = '';

  if (response.results.length === 0) {
    loading.remove();
    tvShowsHead.textContent = 'По вашему запросу сериалов не найдено...';
    return;
  }
  tvShowsHead.textContent = target ? target.textContent : 'Результат поиска ';

  response.results.forEach((item) => {
    const {
      backdrop_path: backdrop,
      name: title,
      poster_path: poster,
      vote_average: vote,
      id,
    } = item;
    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : IMG_URL == IMG_URL;
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : ' ';

    const card = document.createElement('li');
    card.classList.add('tv-shows__item');
    idTV = id;
    console.log(item);

    card.innerHTML = `
        <a href="#" id ="${idTV}" class="tv-card">
        ${voteElem}
        <img class="tv-card__img"
            src="${posterIMG} "
            data-backdrop="${backdropIMG} "
            alt="${title}">
        <h4 class="tv-card__head">${title}</h4>
    </a>
        `;
    {
      loading.remove();
      tvShowsList.append(card);
    }
  });
};

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = searchFormInput.value.trim();
  if (value) {
    tvShows.append(loading);
    searchFormInput.value = '';

    new DBService().getSearchResult(value).then(renderCard);
  }
});

//открытие/закрытие меню
const closeDropdown = () => {
  dropdown.forEach((item) => {
    item.classList.remove('active');
  });
};

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropdown();
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropdown();
  }
});

leftMenu.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;
  const dropdown = target.closest('.dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
  }

  if (target.closest('#top-rated')) {
    new DBService()
      .getTopRated()
      .then((response) => renderCard(response, target));
  }
  if (target.closest('#popular')) {
    new DBService()
      .getPopular()
      .then((response) => renderCard(response, target));
  }
  if (target.closest('#week')) {
    new DBService()
      .getAiringToday()
      .then((response) => renderCard(response, target));
  }
  if (target.closest('#today')) {
    new DBService()
      .getOnTheAir()
      .then((response) => renderCard(response, target));
  }

  if (target.closest('#search')) {
    tvShowsList.textContent = '';
    tvShowsHead.textContent = '';
  }
});
//смена карточки
const changeImage = (event) => {
  const card = event.target.closest('.tv-shows__item');

  if (card) {
    const img = card.querySelector('.tv-card__img');

    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
  }
};
tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

//открытие модельного окна

tvShowsList.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target,
    card = target.closest('.tv-card');
  if (card) {
    preloader.style.display = 'block';
    new DBService()
      .getTvShows(card.id)
      .then(
        ({
          poster_path: posterPath,
          name: title,
          genres,
          vote_average: voteAverage,
          overview,
          homepage,
        }) => {
          if (posterPath) {
            tvCardImg.src = IMG_URL + posterPath;
            tvCardImg.alt = title;
            posterWrapper.style.display = '';
            modalContent.style.paddingLeft = '';
          } else {
            posterWrapper.style.display = 'none';
            modalContent.style.paddingLeft = '20px';
          }
          tvCardImg.src = IMG_URL + posterPath;
          tvCardImg.alt = title;
          modalTitle.textContent = title;
          genresList.textContent = '';
          genres.forEach((item) => {
            genresList.innerHTML += `<li>${item.name}</li>`;
          });

          rating.textContent = voteAverage;
          description.textContent = overview;
          modalLink.href = homepage;
        }
      )
      .then(() => {
        // document.body.style.overflow = "hidden";
        modal.style.backgroundColor = 'rgba(26, 25, 25, 0.7)';
        modal.classList.remove('hide');
      })
      .then(() => {
        preloader.style.display = '';
      });
  }
});

//закрытие

modal.addEventListener('click', (event) => {
  if (
    event.target.closest('.cross') ||
    event.target.classList.contains('modal')
  ) {
    modal.classList.add('hide');
  }
});
