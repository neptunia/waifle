// todo: yellow error if u guess a character that overlaps some series with the correct answer





const pixelatedImage = document.querySelector("#pixelatedImage");
const guessesList = document.querySelector("#guessesList");
// storying a copy of the original image

const submit = document.querySelector("#submit");
var originalImage;
var ogImg;

var word = "";
var series = "";
var url = "";


var myChart;

var guessStatuses = ["\u2b1c","\u2b1c","\u2b1c","\u2b1c","\u2b1c","\u2b1c"];
var guessTexts = [];

var difficultyLevel = 0;
var guessesMade = 0;

var win=null;

const gameStartDate = new Date("05/03/2022");
let todayDate = new Date();
todayDate.setHours(0,0,0,0);
const daysSinceGameStart = Math.floor((todayDate.getTime() - gameStartDate.getTime())/86400000);

submit.addEventListener("click", async (e) => {
  var guess = document.querySelector("#autoComplete").value;

  handleGuess(guess);

});

function updateGuessBoxes() {
  // DO THIS LATER
  for (var i=0; i< guessesMade; i++) {
    if (guessTexts[i] == word && document.querySelector("#text"+(i+1)).innerHTML.length == 0) {

      var text = document.createTextNode(guessTexts[i]);
      let sp = document.createElement('span');
      sp.className = 'material-symbols-outlined';
      sp.innerHTML = 'done';
      sp.style.removeProperty("lineHeight");
      sp.style.color = "green";
      document.querySelector("#symbol"+(i+1)).appendChild(sp);
      document.querySelector("#text"+(i+1)).appendChild(text);
      
      var currentGuessBox = document.querySelector("#guess"+(i+1));
      currentGuessBox.appendChild(text);
      currentGuessBox.style.borderColor = "lightgray";

      document.querySelector("#modalShare").disabled = false;
      document.querySelector("#modalWinText").innerHTML="Wow you did it! It took you "+guessesMade+" tries."
      submit.disabled = true;
      win = true;
      difficultyLevel = 1000;
    } else if (document.querySelector("#text"+(i+1)).innerHTML.length == 0) {
      let sp = document.createElement('span');
      sp.className = 'material-symbols-outlined';

      if (guessStatuses[i] == "\u2B1B") {
        sp.innerHTML = 'check_box_outline_blank';
        sp.style.color = "gray";
      } else {
        sp.innerHTML = 'close';
        sp.style.color = "red";
      }

      sp.style.removeProperty("lineHeight");
      //sp.style.color = "red";

      var text = document.createTextNode(guessTexts[i]);
      var currentGuessBox = document.querySelector("#guess"+(i+1));
      document.querySelector("#symbol"+(i+1)).appendChild(sp);
      document.querySelector("#text"+(i+1)).appendChild(text);
      currentGuessBox.style.borderColor = "lightgray";
      
      
    }
  }
  if (guessesMade < 6) {
    document.querySelector("#guess"+(guessesMade+1)).style.borderColor = "gray";
  } else {
    submit.disabled = true;
    difficultyLevel = 1000; // hacky fix to depixelate the image
    document.querySelector("#modalShare").disabled = false;
    win = false;
    document.querySelector("#modalWinText").innerHTML="Sorry, you didn't get today's Waifle. The answer was "+word+" ("+series+"). Try again tomorrow!"

  }
}

function saveGuesses() {
  j = {"timestamp":todayDate.getTime(), "difficultyLevel":difficultyLevel, "guessesMade":guessesMade, "guessStatuses":guessStatuses, "guessTexts":guessTexts};
  localStorage.setItem('todaysGuesses', JSON.stringify(j));
}

function loadGuessesIfAvailable() {
  if (localStorage.getItem("todaysGuesses") === null) {
    // they don't exist yet
    j = {"timestamp":todayDate.getTime(), "difficultyLevel":difficultyLevel, "guessesMade":guessesMade, "guessStatuses":guessStatuses, "guessTexts":guessTexts};
    localStorage.setItem('todaysGuesses', JSON.stringify(j));
  } else {
    let stats = JSON.parse(localStorage.getItem("todaysGuesses"));
    if (stats["timestamp"] !== todayDate.getTime()) {
      // it was from a different day
      j = {"timestamp":todayDate.getTime(), "difficultyLevel":difficultyLevel, "guessesMade":guessesMade, "guessStatuses":guessStatuses, "guessTexts":guessTexts};
      localStorage.setItem('todaysGuesses', JSON.stringify(j));
    } else {
      // it was from today so we need to populate the fields
      difficultyLevel = stats["difficultyLevel"];
      guessesMade = stats["guessesMade"];
      guessStatuses = stats["guessStatuses"];
      guessTexts = stats["guessTexts"];
      updateGuessBoxes();
    }
  }

}

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
  guessTexts[guessesMade-1] = guess;

  document.getElementById("autoComplete").value = "";

  if (guess == word) {

    guessStatuses[guessesMade-1] = "\uD83D\uDFE9";

    saveGuesses();
    updateGuessBoxes();

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

    if (guess == "") {
      guess = "Skipped";
      guessTexts[guessesMade-1] = "Skipped";
      guessStatuses[guessesMade-1] = "\u2B1B";
    } else {
      guessStatuses[guessesMade-1] = "\uD83D\uDFE5";
    }

    saveGuesses();
    updateGuessBoxes();
    
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
      document.querySelector("#modalWinText").innerHTML="Sorry, you didn't get today's Waifle. The answer was "+word+" ("+series+"). Try again tomorrow!"
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
        //const pixelIndexPosition = ((x+Math.floor(pixelationFactor/2)) + y * (originalWidth)) * 4;

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
                const source = await fetch("./src/waifus_4.json");
                const data = await source.json();
                var items = data["response"];
                let namesList = items.map(function (currentElement) {
                  var tmp = {}; tmp["data"] = [currentElement["name"],currentElement["show"]]; return tmp;
                }).sort((a,b) => (a["data"][0] > b["data"][1]) ? 1 : -1);
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
            
            keys: ["data"],
            cache: true,
        },
        searchEngine: (query, record) => {
          query = query.toLowerCase();
          const name = record[0];
          const show = record[1];

          if (name.toLowerCase().includes(query)) {
            const idx = name.toLowerCase().indexOf(query);
            let aa = name.substring(0, idx) + "<mark>" + name.substring(idx, idx+query.length) + "</mark>" + name.substring(idx+query.length);
            aa =  aa.replace(" </mark>","&nbsp;</mark>").replace("</mark> ","</mark>&nbsp;")
            return aa.replace(" <mark>","&nbsp;<mark>").replace("<mark> ","<mark>&nbsp;")
            
          }
          else if (show.toLowerCase().includes(query)) {
            return name;
          }

          return false;
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
            maxResults: 10,
            tabSelect: true
          },
          resultItem: {
            element: (item, data) => {
              // Modify Results Item Style
              item.style = "display: flex; justify-content: space-between;";
              // Modify Results Item Content
              //console.log(data);
              //console.log(data.match);
              item.innerHTML = `
              <span style="display: flex; padding-right:40px;">
                ${data.match}
              </span>
              <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;align-items: center; font-size: 10px; font-weight: 100; text-transform: uppercase; color: rgba(0,0,0,.3);">
                ${data.value.data[1]}
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

                autoCompleteJS.input.value = selection.data[0];
                // Console log autoComplete data feedback
                //console.log(feedback);
              },
            },
          },
    });

function toggleTheme() {
  if (localStorage.getItem("brightMode") === "light") {
    localStorage.setItem('brightMode', "dark");
  } else {
    localStorage.setItem('brightMode', "light");
  }
  setTheme();
}

function setTheme() {
  if (localStorage.getItem("brightMode") === "light") {
    document.body.style.backgroundColor = "white";
    document.querySelector('#content').style.color = "black";
    document.querySelector('#headerbar').style.color = "black";
    
  } else {
    document.body.style.backgroundColor = "#121212";
    document.querySelector('#content').style.color = "#eeeeee";
    document.querySelector('#headerbar').style.color = "#eeeeee";
    
  }
}

window.addEventListener('load', function() {


  if (localStorage.getItem("firstTime") === null) {
    localStorage.setItem('firstTime', 'false');
    localStorage.setItem('data', JSON.stringify({"tries":0, "wins":0, "distribution":[]}));
    $('#instructions').modal('show')
  }

  if (localStorage.getItem("brightMode") === null) {
    localStorage.setItem("brightMode", "light");
    setTheme();
  } else {
    setTheme();
  }

  updateStatistics();

  fetch("./src/waifus_4.json")
  .then(response => {
     return response.json();
  })
  .then(data => {

    var items = data.response;
    var item = items[(817 * daysSinceGameStart)%items.length];
    //console.log(item);
    word = item["name"];
    series = item["show"];
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

    loadGuessesIfAvailable();


    const shareButton = document.querySelector("#modalShare");
    shareButton.addEventListener('click', function() {

      if (win === true) {
        navigator.clipboard.writeText("I did today's Waifle (#"+daysSinceGameStart+") in "+guessesMade+" tries!\n\uD83D\uDD0e"+guessStatuses.join("")+"\nhttps://waifle.nowaru.moe");
      } else {
        navigator.clipboard.writeText("I am a stinky poopoo who was unable to solve today's Waifle (#"+daysSinceGameStart+")! https://waifle.nowaru.moe");
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


});


document.querySelector("#themeToggler").addEventListener('click', toggleTheme);
