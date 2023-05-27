/*
ToDo:
- Get word -> random word from api -> show unrevealed "word"
	- categories / word length adjastable ?
- Guess letters: 
	- input: key is pressed + virtual keyboard
	- check if word incluedes letter and where
- lives: 
	- display lives and update them
	- visual hangman ?
*/
const wordBox = document.getElementById('word');

function getWord () {
	let word;
	fetch(`https://www.wordgamedb.com/api/v1/words/random`)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status}`);
			}
			return response.json();
		})
			.then((json) => {
				console.log(json.word)
				renderWord(json.word)
			})
			.catch((err) => console.error(`Fetch problem: ${err.message}`));
}

function renderWord(word) {
	for (let i = 0; i < word.length; i++) {
		wordBox.innerHTML += `<div class="letter"></div>`;
	}
}

getWord()

