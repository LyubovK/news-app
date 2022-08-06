// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
// https://newsapi.org/v2/everything?q=bitcoin&apiKey=ef3222971c9e4fb8945c010a17ba996e

const http = customHttp();
const newsService = (function () {
  const apiKey = 'ef3222971c9e4fb8945c010a17ba996e';
  const apiUrl = 'https://newsapi.org/v2';

  return {
    topHeadLines(country = 'ua', category = 'general', cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

//ekements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});
//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

//load news function

const loadNews = () => {
  showLoader();

  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadLines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
};

//function on get response from server

const onGetResponse = (err, res) => {
  removeLoader();

  if (err) {
    showAlert(err, 'error-msg');
  }

  if (!res.articles.length) {
    //show msg
    return;
  }

  renderNews(res.articles);
};

// funct render news

const renderNews = (news) => {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';

  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });
  // console.log(fragment);
  newsContainer.insertAdjacentHTML('afterbegin', fragment);
};

const clearContainer = (container) => {
  // container.innerHTML = '';
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
};

// news item template function
const imgDefault =
  'https://brodnowski.pl/themes/szpital/images/default-img.gif';
const newsTemplate = ({ urlToImage, title, url, description }) => {
  return `
  <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${urlToImage || imgDefault}">
        <span>${title || ''}</span>
      </div>
      <div class="card-content">
        <p>${description || ''}</p>
      </div>
      <div class="card-action">
        <a href="${url}">Read more</a>
      </div>
    </div>
  </div>
  `;
};

const showAlert = (msg, type = 'success') => {
  M.toasts({ html: msg, classes: type });
};

const showLoader = () => {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
    `
  );
};

//remove Loader func

const removeLoader = () => {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
};
