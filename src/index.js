// todo: yellow error if u guess a character that overlaps some series with the correct answer





const pixelatedImage = document.querySelector("#pixelatedImage");
const guessesList = document.querySelector("#guessesList");
// storying a copy of the original image

const submit = document.querySelector("#submit");
var originalImage;
var ogImg;

var word = "";
var url = "";
var myChart;

var guessStatuses = ["\u2b1c","\u2b1c","\u2b1c","\u2b1c","\u2b1c","\u2b1c"];

var difficultyLevel = 0;
var guessesMade = 0;

var win=null;

submit.addEventListener("click", async (e) => {
  var guess = document.querySelector("#autoComplete").value;

  handleGuess(guess);

});

function updateStatistics() {
  const submit = document.querySelector("#modalStatistics");
  let stats = JSON.parse(localStorage.getItem("data"));
  if (stats["tries"] == 0) {
    submit.innerHTML = "No games recorded";
  } else {
    submit.innerHTML = "";
    document.querySelector("#gamesPlayed").innerHTML = stats["tries"];
    document.querySelector("#winPct").innerHTML = parseInt(stats["wins"]/stats["tries"]*100)+"%";

    let occurrences = [0,0,0,0,0,0];
    for (const num of stats["distribution"]) {
      if (num > 0) {
        occurrences[num-1] += 1;
      }
    }
    //console.log(occurrences);

    // bar graph stuff

    const ctx = document.getElementById('myChart');
    if (myChart) {    myChart.destroy();  }
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1', '2', '3', '4', '5', '6'],
            datasets: [{
                label: 'Frequency',
                data: occurrences,
                backgroundColor: 'rgba(255, 128, 128, 1)',
                
                borderWidth: 0,
                borderRadius: Number.MAX_VALUE,
            }]
        },
        options: {
            plugins: {
              title: {
                display: true,
                text: 'Guess distribution'
              },
              legend: {
                display: false,
              },
            },
            indexAxis: 'y',
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                      display: false
                    }
                },
                x: {
                    beginAtZero: true,
                    grid: {
                      display: false
                    },
                    ticks: {
                      precision: 0
                    }
                }
            }
        }
    });



  }
}

function handleGuess(guess) {
  guessesMade += 1;

  document.getElementById("autoComplete").value = "";

  if (guess == word) {

    guessStatuses[guessesMade-1] = "\uD83D\uDFE9";

    var text = document.createTextNode(guess);
    let sp = document.createElement('span');
    sp.className = 'material-symbols-outlined';
    sp.innerHTML = 'done';
    sp.style.removeProperty("lineHeight");
    sp.style.color = "green";
    document.querySelector("#symbol"+guessesMade).appendChild(sp);
    document.querySelector("#text"+guessesMade).appendChild(text);
    
    var currentGuessBox = document.querySelector("#guess"+guessesMade);
    currentGuessBox.appendChild(text);
    currentGuessBox.style.borderColor = "lightgray";

    pixelateImage(originalImage, 1);

    document.querySelector("#modalShare").disabled = false;
    document.querySelector("#modalWinText").innerHTML="Wow you did it! It took you "+guessesMade+" tries."
    submit.disabled = true;
    win = true;

    let stats = JSON.parse(localStorage.getItem("data"));
    stats["tries"] += 1;
    stats["wins"] += 1;
    stats["distribution"].push(guessesMade);
    localStorage.setItem('data', JSON.stringify(stats));
    updateStatistics();


    $('#exampleModal').modal('show');

  } else {


    let sp = document.createElement('span');
    sp.className = 'material-symbols-outlined';

    if (guess == "") {
      guess = "Skipped";
      sp.innerHTML = 'check_box_outline_blank';
      sp.style.color = "gray";
      guessStatuses[guessesMade-1] = "\u2B1B";
    } else {
      sp.innerHTML = 'close';
      sp.style.color = "red";
      guessStatuses[guessesMade-1] = "\uD83D\uDFE5";
    }

    sp.style.removeProperty("lineHeight");
    //sp.style.color = "red";

    var text = document.createTextNode(guess);
    var currentGuessBox = document.querySelector("#guess"+guessesMade);

    document.querySelector("#symbol"+guessesMade).appendChild(sp);

    document.querySelector("#text"+guessesMade).appendChild(text);

    currentGuessBox.style.borderColor = "lightgray";
    if (guessesMade >= 6) {
      submit.disabled = true;
      pixelateImage(originalImage, 1);
      let stats = JSON.parse(localStorage.getItem("data"));
      stats["tries"] += 1;
      stats["distribution"].push(-1);
      localStorage.setItem('data', JSON.stringify(stats));
      updateStatistics();

      document.querySelector("#modalShare").disabled = false;
      win = false;
      document.querySelector("#modalWinText").innerHTML="Sorry, you didn't get today's Waifle. The answer was "+word+". Try again tomorrow!"
      $('#exampleModal').modal('show');

    } else {
      document.querySelector("#guess"+(guessesMade+1)).style.borderColor = "gray";
      pixelateImage(originalImage, Math.ceil(230 / 2 ** (difficultyLevel + 1)));
      difficultyLevel += 1;
    }

  }


}


function pixelateImage(originalImage, pixelationFactor) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const originalWidth = originalImage.width;
  const originalHeight = originalImage.height;


  const canvasWidth = originalWidth;
  const canvasHeight = originalHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  context.drawImage(originalImage, 0, 0, originalWidth, originalHeight);

  const originalImageData = context.getImageData(
    0,
    0,
    originalWidth,
    originalHeight
  ).data;

  if (pixelationFactor !== 0) {
    for (let y = 0; y < originalHeight; y += pixelationFactor) {
      for (let x = 0; x < originalWidth; x += pixelationFactor) {
        // extracting the position of the sample pixel
        const pixelIndexPosition = (x + y * originalWidth) * 4;

        // drawing a square replacing the current pixels
        context.fillStyle = `rgba(
          ${originalImageData[pixelIndexPosition]},
          ${originalImageData[pixelIndexPosition + 1]},
          ${originalImageData[pixelIndexPosition + 2]},
          ${originalImageData[pixelIndexPosition + 3]}
        )`;
        context.fillRect(x, y, pixelationFactor, pixelationFactor);
      }
    }
  }
  pixelatedImage.src = canvas.toDataURL();
  pixelatedImage.style.visibility='visible';
  pixelatedImage.style.opacity='1';
  
}

const autoCompleteJS = new autoComplete({
        placeHolder: "Search character names...",
        data: {
            src: async () => {
              try {
                // Loading placeholder text
                document.getElementById("autoComplete").setAttribute("placeholder", "Loading...");
                // Fetch External Data Source
                const source = await fetch("./src/waifus_3.json");
                const data = await source.json();
                var items = data.response;
                let namesList = items.map(function (currentElement) {
                  return currentElement["name"];
                }).sort();
                //console.log(namesList);
                // Post Loading placeholder text
                document.getElementById("autoComplete").setAttribute("placeholder", autoCompleteJS.placeHolder);
                // Returns Fetched data
                return namesList;
              } catch (error) {
                console.log(error);
                return error;
              }
            },
            cache: true,
        },
        resultsList: {
            element: (list, data) => {
              const info = document.createElement("p");
              if (data.results.length > 0) {
                info.innerHTML = `Displaying <strong>${data.results.length}</strong> out of <strong>${data.matches.length}</strong> results`;
              } else {
                info.innerHTML = `Found <strong>${data.matches.length}</strong> matching results for <strong>"${data.query}"</strong>`;
              }
              list.prepend(info);
            },
            noResults: true,
            maxResults: 5,
            tabSelect: true
          },
          resultItem: {
            element: (item, data) => {
              // Modify Results Item Style
              item.style = "display: flex; justify-content: space-between;";
              // Modify Results Item Content
              item.innerHTML = `
              <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                ${data.match}
              </span>`;
            },
            highlight: true
          },
        events: {
            input: {
              focus() {
                if (autoCompleteJS.input.value.length) autoCompleteJS.start();
              },
              selection(event) {
                const feedback = event.detail;
                autoCompleteJS.input.blur();
                // Prepare User's Selected Value
                const selection = feedback.selection.value;
                //console.log(selection);
                //console.log(feedback);
                // Replace Input value with the selected value
                autoCompleteJS.input.value = selection;
                // Console log autoComplete data feedback
                //console.log(feedback);
              },
            },
          },
    });

window.addEventListener('load', function() {


  if (localStorage.getItem("firstTime") === null) {
    localStorage.setItem('firstTime', 'false');
    localStorage.setItem('data', JSON.stringify({"tries":0, "wins":0, "distribution":[]}));
    $('#instructions').modal('show')
  }

  updateStatistics();

  fetch("./src/waifus_3.json")
  .then(response => {
     return response.json();
  })
  .then(data => {

    var items = data.response;     
    var item = items[Math.floor(Math.random()*items.length)];
    //console.log(item);
    word = item["name"];
    url = item["image"];
    //console.log(url);
    pixelatedImage.style.visibility='hidden';
    pixelatedImage.style.opacity='0';

    ogImg = new Image();
    ogImg.crossOrigin="anonymous";
    ogImg.onload = function() {originalImage = ogImg.cloneNode(true);pixelateImage(originalImage, Math.ceil(230 / 2 ** (difficultyLevel + 1)));difficultyLevel += 1;ogImg.onload=null;}
    ogImg.src = url;

    
    //pixelatedImage.onload = function() {originalImage = pixelatedImage.cloneNode(true);pixelateImage(originalImage, Math.ceil(230 / 2 ** (difficultyLevel + 1)));difficultyLevel += 1;pixelatedImage.onload=null;}
    //pixelatedImage.src = url;
    document.querySelector("#guess"+(guessesMade+1)).style.borderColor = "gray";


    const shareButton = document.querySelector("#modalShare");
    shareButton.addEventListener('click', function() {

      if (win === true) {
        navigator.clipboard.writeText("I did today's Waifle in "+guessesMade+" tries!\n\uD83D\uDD0e"+guessStatuses.join("")+"\nhttps://neptunia.github.io/waifle/");
      } else {
        navigator.clipboard.writeText("I am a stinky poopoo who was unable to solve today's Waifle! https://neptunia.github.io/waifle/");
      }

      var span = document.getElementById('fader');
    
      span.style.transition = 'none';
      span.style.opacity = '1';
      
      /* This line seems to 'reset' the element so that the transition can be run again. */
      void span.offsetWidth;
      
      span.style.transition = 'opacity 1s';
      span.style.opacity = '0';
      
    })
    
    
  }
  );


})


