//Once page loads
document.addEventListener("DOMContentLoaded", () => {
    let guessedWords = [[]];
    let guessedCount = 0;
    let space = 1;
    let word = "";
    let guessedIndex = [];
    let otherGuessedIndex = [];
    const keys = document.querySelectorAll(".keyboard-row button");

    //Create squares and fetch a random 5 letter word
    createBoard();
    getNewWord();

    //Check for on screen key presses
    for(let i = 0; i < keys.length; i++){
        keys[i].onclick = ({ target }) => {
            const key = target.getAttribute("id");

            if(key == "ENTER"){
                submit();
                return;
            }

            if(key == "BACKSPACE"){
                del();
                return;
            }

            updateGuessed(key);
        };
    }

    //Check for key presses on keyboard
    document.addEventListener('keydown', (event) => {
        if(event.key.toUpperCase() == "ENTER"){
            submit();
            return;
        }
        if(event.key.toUpperCase() == "BACKSPACE"){
            del();
            return;
        }
        else if(event.key.length > 1){}else{
        updateGuessed(event.key.toUpperCase());
        }
    });
    
    //Create all the squares for all potential guesses
    function createBoard(){
        const gameBoard = document.getElementById("board");

        for (let index = 0; index < 30; index ++) {
            let square = document.createElement("div");
            square.classList.add("square");

            //Allow animations to be added to squares
            square.classList.add("animate__animated");
            square.setAttribute("id", index + 1);
            gameBoard.appendChild(square);
        }
    }

    //Fetch a random 5 letter verb from words API
    function getNewWord() {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                'X-RapidAPI-Key': 'ee5e024ab6msh71f4f531a538e68p1174c4jsnc13e383f05b4'
            }
        };
        
        fetch('https://wordsapiv1.p.rapidapi.com/words/?random=true&lettersMin=5&lettersMax=5&partOfSpeech=verb', options)
        //Convert data to JSON
            .then(response => response.json())
            //Store word as all caps in "word" variable
            .then(response => {
                word = response.word.toUpperCase();
                console.log(response.word);
            })
            .catch(err => console.error(err));
    }
    
    //Get the word currently being input
    function getCurrent() {
        return guessedWords[guessedWords.length - 1];
    }

    //Add an input letter to the current guess
    function updateGuessed(letter) {
        let currentArr = getCurrent();

        if(currentArr.length < 5){
            currentArr.push(letter);
            let availableEl = document.getElementById(String(space));
            availableEl.textContent = letter;
            space += 1;
        }
        //In case shake animation was used, remove class
        currentArr.forEach((letter, index) => {
            setTimeout(() => {
                let firstLetter = guessedCount * 5 + 1;
                const letterID = firstLetter + index;
                const letterEl = document.getElementById(letterID);
                letterEl.classList.remove("animate__shakeX");
            }, 200);
        });
    }

    //When submitting word, check what color a given tile should be
    function getColor(letter, index, currentArr){
        //Record all indexes of perfect matches in the guess
        otherGuessedIndex.forEach(element => {
            guessedIndex.push(element);
        });
        //If a perfect match, return green
        if(word[index] == letter){
            guessedIndex.push(index);
            return "rgb(83, 141, 78)";
        }
        //If the letter matches any of the letters in the word and it has not already been marked
        for(let i = 0; i < 5; i++){
            if(word[i] == letter){
                if(guessedIndex.includes(i)){
                } else {
                    //Double check that this is not a repeat of a perfect match
                    for(let i = 0; i < 5; i++){
                        if(word[i] == currentArr[i]){
                            guessedIndex.push(i);
                        }
                    }
                    //If this letter has not already been marked, indicate it as yellow (correct but not perfect)
                    if(guessedIndex.includes(i)){
                        break;
                    } else {
                        guessedIndex.push(i);
                        return "rgb(181, 159, 59)";
                    }
                }
            }            
        }
        //If the letter is not in the word, return grey
        return "rgb(58, 58, 60)";
    }

    //For when a guessed is submitted
    function submit(){
        let currentArr = getCurrent();
        let currentWord = currentArr.join("");

        //If the word is too short, shake letters to indicate incorrect input
        if(currentArr.length != 5) {
            currentArr.forEach((letter, index) => {
                setTimeout(() => {
                    let firstLetter = guessedCount * 5 + 1;
                    const letterID = firstLetter + index;
                    const letterEl = document.getElementById(letterID);
                    letterEl.classList.add("animate__shakeX");
                }, 200);
            });
        } else {
            //Check with words API if input word is an actual word     
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                    'X-RapidAPI-Key': 'ee5e024ab6msh71f4f531a538e68p1174c4jsnc13e383f05b4'
                }
            };
            
            fetch('https://wordsapiv1.p.rapidapi.com/words/' + currentWord, options)
                .then(response => {
                    //If the input word is not a valid word, shake letters
                    if(!response.ok){
                        currentArr.forEach((letter, index) => {
                            setTimeout(() => {
                                let firstLetter = guessedCount * 5 + 1;
                                const letterID = firstLetter + index;
                                const letterEl = document.getElementById(letterID);
                                letterEl.classList.add("animate__shakeX");
                            }, 200);
                        });
                    }
                    //If the input word is valid
                    else{
                        let firstLetter = guessedCount * 5 + 1;
                        const interval = 200;

                        //Record all the indexes of letters that are perfect guesses
                        for(let i = 0; i < 5; i++){
                            if(word[i] == currentWord[i]){
                                otherGuessedIndex.push(i);
                            }
                        }

                        //For each letter, style the guess and keyboard appropriately every 200ms
                        currentArr.forEach((letter, index) => {
                            setTimeout(() => {
                                //Get the appropriate tile color for each guessed letter
                                const tileColor =  getColor(letter, index, currentArr);

                                //Get the div of letter in question
                                const letterID = firstLetter + index;
                                const letterEl = document.getElementById(letterID);
                                
                                //Flip in the appropriate color for each letter
                                letterEl.classList.add("animate__flipInX");
                                letterEl.style = ('background-color:' + tileColor + ';border-color:' + tileColor);

                                //Get the div of keyboard character in question
                                const keyboardID = letter.toUpperCase();
                                const keyboardEL = document.getElementById(keyboardID);

                                //Logic to determine what color to style the keyboard letters on screen
                                if(tileColor == "rgb(83, 141, 78)"){
                                    keyboardEL.style = ('background-color:' + tileColor + ';border-color:' + tileColor);    
                                } else if(tileColor == "rgb(181, 159, 59)"){
                                    if(keyboardEL.style.backgroundColor != "rgb(83, 141, 78)"){
                                        keyboardEL.style = ('background-color:' + tileColor + ';border-color:' + tileColor);
                                    }
                                }
                                else if(tileColor == "rgb(58, 58, 60)"){
                                    if((keyboardEL.style.backgroundColor == "rgb(83, 141, 78)") || (keyboardEL.style.backgroundColor == "rgb(181, 159, 59)")){
                                    }
                                    else{
                                        keyboardEL.style = ('background-color:' + tileColor + ';border-color:' + tileColor);
                                    }
                                }
                            }, interval * index);
                        });
                        
                        guessedCount += 1;

                        //Check win/loss conditions
                        if((guessedWords.length == 6) && (word != currentWord)){
                            window.alert('Sorry, you are out of guesses. The word was ' + word);
                        }                

                        //Move guessed word array to next word
                        guessedWords.push([]);
                        //Reset current guessed word indexes
                        guessedIndex = [];
                        otherGuessedIndex = [];
                    }
                    if(word === (currentWord)){
                        window.alert('Congratulations, you got it! Click anywhere to play again.');
                        document.onclick = function reloader() {
                            location.reload();
                        }
                    }
                })
                .catch(err => console.error(err));        
        }
    }

    //Function to delete letters in the current guess
    function del(){
        let currentArr = getCurrent();

        if(currentArr.length > 0){
            let availableEl = document.getElementById(String(space - 1));
            availableEl.textContent = "";
            currentArr.pop();
            space -= 1;

        }
        //Clear animations if any
        currentArr.forEach((letter, index) => {
            setTimeout(() => {
                let firstLetter = guessedCount * 5 + 1;
                const letterID = firstLetter + index;
                const letterEl = document.getElementById(letterID);
                letterEl.classList.remove("animate__shakeX");
            }, 200);
        });
    }
});