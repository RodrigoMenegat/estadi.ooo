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
			maxItems: 3
		});

		// Adds information at the overlay
		let stadiumName = document.querySelector(".stadium-name");
		let stadiumLocation = document.querySelector(".location");

		stadiumName.textContent = todayStadium.nome;
		stadiumLocation.textContent = todayStadium.cidade + ", " + todayStadium.estado;

		// Adding event listener
		input.addEventListener("awesomplete-select", function(event) {
			handleAnswer(event.text, correctAnswer, gameStatus);
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

			if (gameStatus.chancesLeft <= 0) {
				gameStatus.gameover = true;
			}
		}


		function update(gameStatus, chances, hints) {

			if (gameStatus.gameover) {
				let overlay = document.querySelector("#overlay");

				overlay.classList.remove("gameon");
				overlay.classList.add("gameover");
			}

			else {

				// Add missed chances
	 			for (const index of [...Array(gameStatus.chancesTaken).keys()]) {
	 				chances[index].innerText = '❌';
	 			}

				// Add missed hints
	 			for (const index of [...Array(gameStatus.hintsTaken).keys()]) {

					hints[index].classList.remove('hidden');
					hints[index].classList.add('visible');
				}

				// Updates the share string
				gameStatus.string = '❌'.repeat(gameStatus.chancesTaken) + '⚽'.repeat(gameStatus.chancesLeft);

				let score = document.querySelector(".score");
				score.textContent = gameStatus.string;

			}


		}




	}).catch(function(err) {
	    console.log(err);
	})


}

startGame();