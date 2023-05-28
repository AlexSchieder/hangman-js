const wordBox = document.getElementById('word');
const submittedLettersList = document.getElementById('submittedLetters')
const lifesBox = document.querySelector('#lifes p span')
const dialog = document.getElementById('dialog')

let lifes = 10;
let occurrence = [];
let submittedLetters = [];
let solvedLetters = [];

//virtual Keyboard
const buttons = document.querySelectorAll('#keyboard button');
const keyboard = document.getElementById('keyboard');
//const reg = /[a-z]/

function listenForLetter(word) {
	for (let button of buttons) {
		button.addEventListener('click', () => {
			checkLetter(button.innerText, word)
		})
	}
	
	document.body.addEventListener('keydown', (e) => {
		if (/\b[a-z]\b/.test(e.key) && !dialog.open) {
			checkLetter(e.key, word)
		}
	})
}

function renderDialog(message, button, finished) {
	dialog.innerHTML=`
	<form method="dialog">
		<p>${message}</p>
		<menu>
			<button>${button}</button>
		</menu>
	</form>`
	if (!dialog.open) {
		dialog.showModal()
		if (finished) {
			dialog.addEventListener('close', restart)
		}
	}
}


// virtual keyboard end

function renderWord(word) {
	for (let i = 0; i < word.length; i++) {
		wordBox.innerHTML += `<div class="letter"></div>`;
	}
}

function wrongLetter(letter) {
	renderDialog(`There is no ${letter} in this word.`, 'ok')
	lifes -= 1
	renderLife()
}

function renderLife() {
	lifesBox.innerText = lifes
}


function checkLetter(letter, word) {
	if (submittedLetters.includes(letter)) {
		renderDialog(`You already tried ${letter}.`, 'ok')
	} else {
		if (dialog.open) { dialog.close() }
		submittedLetters.push(letter)
		submittedLettersList.insertAdjacentHTML('beforeend', `<li>${letter}</li>`)
		// check if letter exists in word
		if (word.indexOf(letter) !== -1) {
			// check where letter exists in word
			let position = word.indexOf(letter)
			while(position !== -1) {
				occurrence.push(word.indexOf(letter, position))
				solvedLetters.push(word.indexOf(letter, position))
				position = word.indexOf(letter, position +1)
			}
			renderLetter(letter, occurrence, word)
			occurrence = [];
		} else {
			wrongLetter(letter)
		}
	}
}

function renderLetter(letter, occurrence, word) {
	let letters = document.querySelectorAll('.letter')
	for (let i = 0; i < occurrence.length; i++) {
		let j = occurrence[i]
		letters[j].innerHTML = `<span>${letter}</span>`
	}
	if(solvedLetters.length == word.length) {
		renderDialog('Hurra! You solved it.', 'New word', true)
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

function reset () {
	wordBox.innerHTML = ''
	submittedLettersList.innerHTML = ''
	lifes = 10;
	renderLife()
	occurrence = [];
	submittedLetters = [];
	solvedLetters = [];
}

function restart() {
	reset()
	getWord()
	.then(newWord => {
		console.log(newWord.word)
		renderWord(newWord.word)
		listenForLetter(newWord.word)
	})
	.catch(error => error.message)
}

restart()