/*
ToDo:
- Get word -> random word from api -> show unrevealed "word"
	- categories / word length adjastable ?
- Guess letters: 
	- input: key is pressed + virtual keyboard
	- check if letter has been tried + display all submitted letters
	- check if word incluedes letter and where
- lives: 
	- display lives and update them
	- visual hangman ?
*/
const wordBox = document.getElementById('word');
const submittedLettersList = document.getElementById('submittedLetters')
const livesBox = document.getElementById('lives')
let lives = 10;
let occurrence = [];
const word = localStorage.getItem('word' || '');


function renderWord(word) {
	for (let i = 0; i < word.length; i++) {
		wordBox.innerHTML += `<div class="letter"></div>`;
	}
}

function wrongLetter(letter) {
	console.log(`there is no ${letter} in this word`);
}


function checkLetter(letter, word) {
	// check if letter exists in word
	if (word.indexOf(letter) !== -1) {
		// check where letter exists in word
		let position = word.indexOf(letter)
		while(position !== -1) {
			occurrence.push(word.indexOf(letter, position))
			position = word.indexOf(letter, position +1)
		}
		console.log(occurrence)
		//return occurrence
		renderLetter(letter, occurrence)
	} else {
		wrongLetter(letter)
	}
}

function renderLetter(letter, occurrence) {
	let letters = document.querySelectorAll('.letter')
	console.log(letters)
	for (let i = 0; i < occurrence.length; i++) {
		let j = occurrence[i]
		letters[j].innerHTML = `<span>${letter}</span>`
	}
}


async function getWord() {
	const response = await fetch(`https://www.wordgamedb.com/api/v1/words/random`)
	if (!response.ok) {
		const message = `An error has occured: ${response.status}`;
    throw new Error(message);
	}
	const newWord = await response.json()
	return newWord;
}

getWord()
	.then(newWord => {
		localStorage.setItem('word', newWord.word)
		console.log(word)
		renderWord(word)
		checkLetter('e', word)
	})
	.catch(error => error.message)