const API_URL = 'https://popcon.ga:3000';

function getResponse(url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.addEventListener('load', function() {
      resolve(xhr.response);
    });
    xhr.addEventListener('error', function() {
      reject(xhr.statusText);
    });
    xhr.send();
  });
}

getResponse(API_URL).then(
  value => {
    console.log(value);
  },
  error => {
    console.error(error);
  }
);
