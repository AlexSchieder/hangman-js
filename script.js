var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const wordBox = document.getElementById('word');
const failedLettersList = document.getElementById('submittedLetters');
const lifesBox = document.querySelector('#lifes p span');
const dialog = document.getElementsByTagName('dialog')[0];
let life = 10;
let failedLetters = [];
let submittedLetters = [];
let occurrence = [];
let solvedLetters = [];
const buttons = document.querySelectorAll('#keyboard button');
const keyboard = document.getElementById('keyboard');
function updateLife(num) {
    life -= num;
    if (lifesBox)
        lifesBox.innerText = `${life}`;
}
function updateFailedLetter(letter) {
    failedLetters.push(letter);
    if (failedLettersList) {
        failedLettersList.insertAdjacentHTML('beforeend', `<li>${letter}</li>`);
    }
}
function listenForLetter(word) {
    for (let button of buttons) {
        button.addEventListener('click', () => checkLetter(button.innerText, word));
    }
    document.body.addEventListener('keydown', (e) => {
        if (/\b[a-z]\b/.test(e.key) && (!dialog || !dialog.open)) {
            checkLetter(e.key, word);
        }
    });
}
function renderDialog(message, button, finished) {
    if (dialog) {
        dialog.innerHTML = `
		<form method="dialog">
			<p>${message}</p>
			<menu>
				<button>${button}</button>
			</menu>
		</form>`;
        if (!dialog.open)
            dialog.showModal();
        if (finished) {
            console.log('restart');
            dialog.addEventListener('close', restart);
        }
    }
}
function renderWord(word) {
    for (let i = 0; i < word.length; i++) {
        if (wordBox)
            wordBox.innerHTML += `<div class="letter"></div>`;
    }
}
function wrongLetter(letter) {
    renderDialog(`There is no ${letter} in this word.`, 'ok');
    updateLife(1);
    updateFailedLetter(letter);
    if (!life)
        renderDialog(`You run out of lifes.`, 'try again', true);
}
function checkLetter(letter, word) {
    if (submittedLetters.includes(letter)) {
        renderDialog(`You already tried ${letter}.`, 'ok');
    }
    else if (dialog) {
        if (dialog.open) {
            dialog.close();
        }
        submittedLetters.push(letter);
        // check if letter exists in word
        if (word.indexOf(letter) !== -1) {
            // check where letter exists in word
            let position = word.indexOf(letter);
            while (position !== -1) {
                occurrence.push(word.indexOf(letter, position));
                solvedLetters.push(word.indexOf(letter, position));
                position = word.indexOf(letter, position + 1);
            }
            renderLetter(letter, occurrence, word);
            occurrence = [];
        }
        else {
            wrongLetter(letter);
        }
    }
}
function renderLetter(letter, occurrence, word) {
    let letters = document.querySelectorAll('.letter');
    for (let i = 0; i < occurrence.length; i++) {
        let j = occurrence[i];
        letters[j].innerHTML = `<span>${letter}</span>`;
    }
    if (solvedLetters.length == word.length) {
        renderDialog('Hurra! You solved it.', 'New word', true);
    }
}
function getWord() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://www.wordgamedb.com/api/v1/words/random`);
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const newWord = yield response.json();
        return newWord;
    });
}
function reset() {
    if (wordBox && failedLettersList) {
        life = 10;
        wordBox.innerHTML = '';
        failedLettersList.innerHTML = '';
        updateLife(0);
        occurrence = [];
        submittedLetters = [];
        failedLetters = [];
        solvedLetters = [];
    }
}
function restart() {
    reset();
    getWord()
        .then(newWord => {
        console.log(newWord.word);
        renderWord(newWord.word);
        listenForLetter(newWord.word);
    })
        .catch(error => error.message);
}
restart();
