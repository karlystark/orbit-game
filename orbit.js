
/** TO DO:
 * - multiple levels with three or four sliders (possibly can choose num sliders
 * and then also easy/medium/hard for each)
 * - bug: clean up message change, seems to be jumping a bit between instructions
 * and success/fail message.
 */

/******************* GAME PLAY LOGIC  **********************/

document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll(".slider-circle");
  const easyLevelButton = document.querySelector("#easyLevelButton");
  const mediumLevelButton = document.querySelector("#mediumLevelButton");
  const hardLevelButton = document.querySelector("#hardLevelButton");
  const randomLevelButton = document.querySelector("#randomLevelButton");
  const twoSlidersButton = document.querySelector("#twoSlidersButton");
  const threeSlidersButton = document.querySelector("#threeSlidersButton");
  const fourSlidersButton = document.querySelector("#fourSlidersButton");
  const chooseAnotherLevelButton = document.querySelector("#chooseLevelButton");

  let intervalSpeeds = []; // Speeds for each slider
  let intervals = [];
  let numSliders;
  let isSliderClicked = new Array(sliders.length).fill(false);
  let positions = new Array(sliders.length).fill(0);
  let lastCross = new Array(sliders.length).fill(-1);

  const instructions = `these planets are moving at different speeds, but we want them to
  align on the red middle line at the same time. click on the planets and set them in orbit!`;


  easyLevelButton.addEventListener('click', function () {
    handleLevelChange([20, 30]);
  });

  mediumLevelButton.addEventListener('click', function () {
    handleLevelChange([10, 20]);
  });

  hardLevelButton.addEventListener('click', function () {
    handleLevelChange([3, 15]);
  });

  randomLevelButton.addEventListener('click', function () {
    const randomSpeed1 = Math.floor(Math.random() * 29) + 2; //random num between 2 and 30
    const randomSpeed2 = Math.floor(Math.random() * 29) + 2;

    if (Math.abs(randomSpeed1 - randomSpeed2) > 5) {
      handleLevelChange([randomSpeed1, randomSpeed2]);
    } else {
      handleLevelChange([(randomSpeed1 + 5), randomSpeed2]);
    }
  });


  chooseAnotherLevelButton.addEventListener('click', function () {
    resetGame();
    hideSliders();
    hideMessage();
    showWelcome();
  });

  /** handleLevelChange - readies game dependent on level selected.
   * params:
   *    - newIntervalSpeeds: array of speeds determined by level selected.
  */
  function handleLevelChange(newIntervalSpeeds) {
    intervalSpeeds = newIntervalSpeeds;
    hideWelcome();
    showSliders();
    showMessage(instructions);
    startSliders();
  }

  /** startSliders - initializes slider movement, checks alignment.  */
  function startSliders() {
    sliders.forEach((slider, index) => {
      clearInterval(intervals[index]);
      const sliderWidth = slider.parentElement.offsetWidth - slider.offsetWidth; // max movement range for slider

      slider.addEventListener('click', () => {
        if (!isSliderClicked[index]) { // makes sure slider has only been clicked once
          intervals[index] = setInterval(() => { // sets up repeating interval based on interval speed
            positions[index] += 2; // Increment position by 2px each time interval runs
            if (positions[index] > sliderWidth) { // if slider reaches end of allowable range
              positions[index] = 0; // Reset to start
            }
            slider.style.left = positions[index] + 'px'; // update DOM with position

            // Check alignment when crossing the middle
            const center = slider.parentElement.offsetWidth / 2;
            const sliderCenter = positions[index] + slider.offsetWidth / 2;
            if (Math.abs(sliderCenter - center) < 1.5 && lastCross[index] !== positions[index]) { // if slider circle is within 1.5px of slider center
              lastCross[index] = positions[index]; // updates lastCross array with current position
              checkAlignment();
            }
          }, intervalSpeeds[index]);
          isSliderClicked[index] = true; // sets isSliderClicked to true to prevent being able to click again and re-initialize setInterval
        }
      });
    });
  };

  /******************* GAME WINNING LOGIC *******************/


  /** checkAlignment - checks the position of the slider circle in relationship
   * to the center of the slider. if both circles have crossed the line within
   * the given threshold, they are aligned. calls showMessage with winning or
   * losing message and pauses sliders.
  */
  function checkAlignment() {
    console.log("check alignment triggered!");
    const messageContainer = document.getElementById("#gameMessage");

    const aligned = Array.from(sliders).every(slider => {
      const rect = slider.getBoundingClientRect(); //get position of slider circle
      const parentRect = slider.parentElement.getBoundingClientRect(); //get position of slider's parent element (slider)
      const center = parentRect.left + parentRect.width / 2; // calculate center horizontal point of parent element
      return Math.abs(center - (rect.left + rect.width / 2)) < 15.1; // is slider within 15.1 pixels of parent container?
    });

    if (aligned) { //are all sliders aligned?
      showMessage("Congratulations! You've won!", "win.png");
      pauseSliders();
    } else {
      showMessage("sorry, try again", "fail.png");
      pauseSliders();
    }
  }


  /*********** DOM MANIPULATION LOGIC ************/


  /** add click handler to reset button to trigger game reset */
  document.getElementById('resetButton').addEventListener('click', function () {
    console.log("reset button clicked");
    resetGame();
  });

  /** showMessage - sets messageText area content to message text
   * that is passed into function and sets display to block (visible)
   *
   * params:
   *    - message: string
   *    - imageUrl: string
   */
  function showMessage(message, imageUrl = "") {
    const gameMessage = document.getElementById("message-container");
    gameMessage.innerHTML = '';

    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.width = '120px';
      img.style.height = 'auto';
      gameMessage.appendChild(img);
    }
    const text = document.createElement('p');
    text.textContent = message;
    gameMessage.appendChild(text);

    document.getElementById('gameMessage').style.display = 'block';
  }

  /** hideMessage - resets display of gameMessage to none, hiding message */
  function hideMessage() {
    document.getElementById('gameMessage').style.display = 'none';
  }

  /** showSliders - show game board */
  function showSliders() {
    document.getElementById('slider-container').style.display = 'block';
  }

  /** hideSliders - hide slider game board */
  function hideSliders() {
    document.getElementById('slider-container').style.display = "none";
  }

  /** showWelcome - shows welcome page */
  function showWelcome() {
    document.getElementById('welcome-container').style.display = "block";
  }

  /** hideWelcome - hides welcome page */
  function hideWelcome() {
    document.getElementById('welcome-container').style.display = "none";
  }

  /** pauseSliders - clears interval for each slider, pausing them in their place. */
  function pauseSliders() {
    sliders.forEach((slider, index) => {
      clearInterval(intervals[index]);
    });
  }

  /** resetGame - resets game logic, including isSliderClicked, positions,
   * lastCross, message, intervals, and position of circles */
  function resetGame() {
    isSliderClicked.fill(false);
    positions.fill(0);
    lastCross.fill(-1);

    showMessage(instructions);

    sliders.forEach((slider, index) => {
      clearInterval(intervals[index]);
      slider.style.left = '0px';
      delete intervals[index];
    });

    startSliders();
  }
});

