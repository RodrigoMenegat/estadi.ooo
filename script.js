function startGame() {

	Promise.all([
	    d3.csv("./csv/primeira-temporada.csv"),
	    d3.csv("./csv/primeira-temporada-estadios-validos.csv"),
	]).then(([answerStadiums, validNames]) => {

		// Game status object
		let gameStatus = {
			'gameover': false,
			'chancesLeft': 5,
			'chancesTaken': 0,
			'hintsTaken': 1,
			'hintsLeft': 4,
			'string': '⚽⚽⚽⚽⚽'
		}


		// Helper functions
		const parseTime = d3.timeParse("%d/%m/%Y");
		const formatTime = d3.timeFormat("%d/%m/%Y");

		// Get today's date
		let today = new Date();

		// Format today's date to dd/mm/yyyy
		today = formatTime(today);

		// Select todays information
		let todayStadium = answerStadiums.filter(d => d.dia == today)[0]

		// Set the correct answer
		const correctAnswer = todayStadium.nome;

		// Fill the elements in the page
		// First, the images
		let image = document.querySelector(".stadium-image");
		image.src = "img/" + todayStadium.arquivo;

		// Select the chances
		let chances = document.querySelectorAll(".try");
		console.log(chances);

		// // Then, the hints
		let hints = document.querySelectorAll(".hint");
		let counter = 1;
		for (let hint of hints) {
			hint.textContent = todayStadium["dica_" + counter];
			counter += 1;
		}

		// Populate the fuzzy selector
		let nameList = validNames.map(d => d.estadios);
		let input = document.querySelector(".answer-box");
		new Awesomplete(input, {
			list: nameList,
			maxItems: 3,
			minChars: 1
		});

		// Clipboard copy button
		new ClipboardJS('.copyme-btn');
		let copyButton = document.querySelector(".copyme-btn");

		copyButton.addEventListener("click", function(target) {
		  
		    // Reveal the click tooltip
		    copyButton.classList.add("justclicked");
		    
		    // .5 seconds later, hide the splash
		    setTimeout(function(){
		     copyButton.classList.remove("justclicked");
		      
		      // >> Set cookie to visited here <<
		    }, 500); 
		});





		// Adds information at the overlay
		let stadiumName = document.querySelector(".stadium-name");
		let stadiumLocation = document.querySelector(".location");
		let suggestedBy = document.querySelector(".suggested-by");

		stadiumName.textContent = todayStadium.nome;
		stadiumLocation.textContent = todayStadium.cidade + ", " + todayStadium.estado;
		suggestedBy.textContent = "sugerido por " + todayStadium.sugestao_de;

		// Adding event listener
		input.addEventListener("awesomplete-selectcomplete", function(event) {
			handleAnswer(event.text, correctAnswer, gameStatus);
			event.target.value = "";
		});

		// Addinv event listener on helper
		let helpButton = document.querySelector(".how");
		helpButton.addEventListener("click", function(event) {

			let helpOverlay = document.querySelector(".helper")

			if (helpOverlay.classList.contains("help-inactive")) {
				helpOverlay.classList.remove("help-inactive");
				helpOverlay.classList.add("help-active");
			}

			else if (helpOverlay.classList.contains("help-active")) {
				helpOverlay.classList.remove("help-active");
				helpOverlay.classList.add("help-inactive");

			}

			let helpButton = document.querySelector(".how");

			if (helpButton.classList.contains("help-inactive")) {
				helpButton.classList.remove("help-inactive");
				helpButton.classList.add("help-active");
			}

			else if (helpButton.classList.contains("help-active")) {
				helpButton.classList.remove("help-active");
				helpButton.classList.add("help-inactive");

			}

			let interactionContainer = document.querySelector(".interaction-container");

			if (interactionContainer.classList.contains("help-inactive")) {
				interactionContainer.classList.remove("help-inactive");
				interactionContainer.classList.add("help-active");
			}

			else if (interactionContainer.classList.contains("help-active")) {
				interactionContainer.classList.remove("help-active");
				interactionContainer.classList.add("help-inactive");
			}

		});


		update(gameStatus, chances, hints);


		//////////////////////
		// HELPER FUNCTIONS //
		//////////////////////

		function handleAnswer(answer, correctAnswer, gameStatus) {
			if (answer == correctAnswer) {
				rightAnswer(gameStatus);
			}

			else {
				wrongAnswer(gameStatus);
			}

			update(gameStatus, chances, hints);

			console.log(gameStatus);
		}


		function rightAnswer(gameStatus) {
			gameStatus.gameover = true;
		}


		function wrongAnswer(gameStatus){
			// Remove one 'life'
			gameStatus.chancesLeft -= 1;
			gameStatus.chancesTaken += 1;
			gameStatus.hintsTaken += 1;
			gameStatus.hintsLeft -= 1;

			if (gameStatus.chancesLeft <= 0) {
				gameStatus.gameover = true;
			}
		}


		function update(gameStatus, chances, hints) {


			// Add missed chances
 			for (const index of [...Array(gameStatus.chancesTaken).keys()]) {
 				chances[index].innerText = '❌';
 			}

			// Reveal hint

			if (gameStatus.hintsLeft >= 0) {
				for (const index of [...Array(gameStatus.hintsTaken).keys()]) {
					hints[index].classList.remove('concealed');
					hints[index].classList.add('revealed');
				}
			}

			// Updates the share string
			gameStatus.string = '❌'.repeat(gameStatus.chancesTaken) + '⚽'.repeat(gameStatus.chancesLeft);

			let score = document.querySelector(".score");
			score.textContent = gameStatus.string;


			if (gameStatus.gameover) {
				let overlay = document.querySelector("#overlay");

				overlay.classList.remove("gameon");
				overlay.classList.add("gameover");

				let gameArea = document.querySelector(".icon-container");
				gameArea.classList.remove("gameon");
				gameArea.classList.add("gameover");

				let hintArea = document.querySelector(".hint-container");
				hintArea.classList.remove("gameon");
				hintArea.classList.add("gameover");



				let copyButton = document.querySelector(".copyme-btn");
				let text = document.querySelector(".copyme").textContent;
  				copyButton.setAttribute("data-clipboard-text", text); 

			}


		}




	}).catch(function(err) {
	    console.log(err);
	})


}

startGame();