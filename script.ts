const wordBox = document.getElementById('word')
const failedLettersList = document.getElementById('submittedLetters')
const lifesBox: HTMLElement | null = document.querySelector('#lifes p span')
const dialog: HTMLDialogElement | null = document.getElementsByTagName('dialog')[0]

let life: number = 10
let failedLetters: string[] = [];
let submittedLetters: string[] = [];
let occurrence: number[] = [];
let solvedLetters: number[] = [];

const buttons: NodeListOf<HTMLElement> = document.querySelectorAll('#keyboard button');
const keyboard = document.getElementById('keyboard');

function updateLife(num: number) {
	life -= num
	if (lifesBox) lifesBox.innerText = `${life}`
}

function updateFailedLetter(letter: string) {
	failedLetters.push(letter)
	if (failedLettersList) {
		failedLettersList.insertAdjacentHTML('beforeend', `<li>${letter}</li>`)
	}
}

function listenForLetter(word : string): void {
	for (let button of buttons) {
		button.addEventListener('click', () => checkLetter(button.innerText, word))
	}
	
	document.body.addEventListener('keydown', (e) => {
		if (/\b[a-z]\b/.test(e.key) && ( !dialog || !dialog.open)) {
			checkLetter(e.key, word)
		}
	})
}

function renderDialog(message: string, button: string, finished?: boolean) {
	if (dialog) {
		dialog.innerHTML=`
		<form method="dialog">
			<p>${message}</p>
			<menu>
				<button>${button}</button>
			</menu>
		</form>`

		if (!dialog.open) dialog.showModal()
		if (finished) {
			console.log('restart')
			dialog.addEventListener('close', restart)
		}
	}
}

function renderWord(word: string) {
	for (let i = 0; i < word.length; i++) {
		if (wordBox) wordBox.innerHTML += `<div class="letter"></div>`;
	}
}

function wrongLetter(letter: string) {
	renderDialog(`There is no ${letter} in this word.`, 'ok')
	updateLife(1)
	updateFailedLetter(letter)
	if(!life) renderDialog(`You run out of lifes.`, 'try again', true)
}

function checkLetter(letter: string, word: string) {
	if (submittedLetters.includes(letter)) {
		renderDialog(`You already tried ${letter}.`, 'ok')
	} else if(dialog) {
		if (dialog.open) { dialog.close() }
		submittedLetters.push(letter);
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

function renderLetter(letter: string, occurrence: number[], word: string) {
	let letters = document.querySelectorAll('.letter')
	for (let i = 0; i < occurrence.length; i++) {
		let j = occurrence[i]
		letters[j].innerHTML = `<span>${letter}</span>`
	}
	if(solvedLetters.length == word.length) {
		renderDialog('Hurra! You solved it.', 'New word', true)
	}
}

interface NewWord {
  readonly [word: string]: string;
}

async function getWord() {
	const response = await fetch(`https://www.wordgamedb.com/api/v1/words/random`)
	if (!response.ok) {
		const message = `An error has occured: ${response.status}`;
    throw new Error(message);
	}
	const newWord: NewWord = await response.json()
	return newWord;
}

function reset () {
	if(wordBox && failedLettersList) {
		life = 10;
		wordBox.innerHTML = ''
		failedLettersList.innerHTML = ''
		updateLife(0)
		occurrence = []
		submittedLetters = []
		failedLetters = []
		solvedLetters = []
	}
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