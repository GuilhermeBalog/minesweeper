const Game = {
    width: 10,
    height: 8,
    bombs: 10,
    field: [],
    gameOver: false,

    colors: {
        0: '#acacac',
        1: '#3178fa',
        2: '#348206',
        3: '#f94340',
        4: '#143b81',
        5: '#7f1e1c',
        6: '#1e807e',
        7: '#000000',
        8: '#808080',
        bomb: '#ee2222'
    },
    message: "Welcome to Minesweeper!",
    goodMessages: ["Good Work!", "Fine moviment!", "Keep this way!"],
    messageFunction: undefined,
    containerElement: document.querySelector('#root'),

    // data methods
    init: function(){
        this.initField()
        this.placeBombs()
        this.placeNumbers()
    },

    initField: function(){
        this.field = new Array(this.width * this.height)
        for (let i = 0; i < this.field.length; i++) {
            this.field[i] = { 
                value: 0,
                opened: false, 
                marked: false,
            }
        }
    },

    placeBombs: function(){
        for (let i = 0; i < this.bombs; i++) {
            this.field[i].value = -1 
        }
        this.field.sort((a, b) => {
            return 0.5 - Math.random()
        })
    },

    placeNumbers: function(){
        for (let i = 0; i < this.field.length; i++) {
            if(this.field[i].value != -1) {
                this.field[i].value = this.countBombs(i)
            }
        }
    },

    countBombs: function(index){
        let total = 0

        const aroundIndexes = this.getAroundIndexes(index)
        aroundIndexes.forEach(i => {
            if(this.hasBombAt(i)) total++
        })

        return total
    },

    hasBombAt: function(index){
        return this.field[index].value == -1
    },

    getAroundIndexes: function(index){
        const aroundIndexes = []

        // up
        if (index - this.width >= 0) {
            aroundIndexes.push(index - this.width)
        }

        // down
        if (index + this.width < this.field.length) {
            aroundIndexes.push(index + this.width)
        }

        // left
        if ((index % this.width) - 1 >= 0) {
            aroundIndexes.push(index - 1)
        }

        // right
        if ((index % this.width) + 1 < this.width) {
            aroundIndexes.push(index + 1)
        }

        // up left
        if (index - this.width >= 0 && (index % this.width) - 1 >= 0) {
            aroundIndexes.push(index - this.width - 1)
        }

        // up right
        if (index - this.width >= 0 && (index % this.width) + 1 < this.width) {
            aroundIndexes.push(index - this.width + 1)
        }

        // down left
        if (index + this.width < this.field.length && (index % this.width) - 1 >= 0) {
            aroundIndexes.push(index + this.width - 1)
        }

        // down right
        if (index + this.width < this.field.length && (index % this.width) + 1 < this.width) {
            aroundIndexes.push(index + this.width + 1)
        }

        return aroundIndexes
    },

    openCell: function (index) {

        if (this.field[index].marked || this.gameOver) {
            return
        }

        if(this.field[index].opened){
            const aroundIndexes = this.getAroundIndexes(index)

            const markedAroundIndexes = aroundIndexes.filter(i => {
                return this.field[i].marked
            })
            
            const closedAroundIndexes = aroundIndexes.filter(i => {
                return this.field[i].opened == false
            })

            if(markedAroundIndexes.length > 0 && markedAroundIndexes.length == this.countBombs(index)){
                console.log(closedAroundIndexes)
                closedAroundIndexes.forEach(i => {
                    if(!this.field[index].marked){
                        this.openCell(i)
                    }
                })
            }
            return
        }

        this.field[index].opened = true

        if (this.hasBombAt(index)) {
            this.messagePlayer('You lose! Click to play again')
            this.openAllBombs()
            this.messageFunction = this.resetGame
            this.gameOver = true
            this.draw()
            return
        }

        if (this.field[index].value == 0) {
            const randomGoodMessage = this.getRandomGoodMessage()
            this.messagePlayer(randomGoodMessage)

            const aroundIndexes = this.getAroundIndexes(parseInt(index))
            aroundIndexes.forEach(i => {
                if (this.field[i].value != -1) {
                    this.openCell(i)
                }
            })
        }

        this.draw()
        this.checkWin()
    },

    getRandomGoodMessage(){
        const randomIndex = this.randomInt(0, this.goodMessages.length)
        return this.goodMessages[randomIndex]
    },

    randomInt(min, max){
        return Math.floor(Math.random() * (max - min)) + min;
    },

    openAllBombs: function(){
        this.field.forEach((cell, index) => {
            if(this.hasBombAt(index)){
                cell.opened = true
            }
        })
    },

    checkWin: function () {
        const closedCells = this.field.filter(cell => {
            return cell.opened == false
        })
        if (closedCells.length == this.bombs) {
            this.messagePlayer('You Win! Click to Play again')
            this.messageFunction = this.resetGame
            this.gameOver = true
        }
    },

    toggleMarkCell: function(index){
        this.field[index].marked = !this.field[index].marked
    },

    resetGame: function(){
        this.gameOver = false
        this.message = "Minesweeper!"
        this.messageFunction = function(){}
        this.init()
        this.draw()
    },

    // render methods
    draw: function(){
        this.containerElement.innerHTML = ''
        this.containerElement.appendChild(this.createControlsElement())
        this.containerElement.appendChild(this.createFieldElement())
    },

    createControlsElement: function(){
        const title = document.createElement('h1')
        title.innerHTML = 'Minesweeper'

        const rows = createNumberInputBlock('rows', this.height)
        const columns = createNumberInputBlock('columns', this.width)
        const bombs = createNumberInputBlock('bombs', this.bombs)

        const button = document.createElement('button')
        button.innerHTML = 'Save and Play'
        button.onclick = () => {this.updateSettings()}

        const aside = document.createElement('aside')
        aside.appendChild(title)
        aside.appendChild(rows)
        aside.appendChild(columns)
        aside.appendChild(bombs)
        aside.appendChild(button)

        return aside

        function createNumberInputBlock(name, value){
            const input = document.createElement('input')
            input.type = 'number'
            input.id = name
            input.value = value

            const label = document.createElement('label')
            label.htmlFor = name
            label.innerHTML = name

            const inputBlock = document.createElement('div')
            inputBlock.className = 'input-block'
            inputBlock.appendChild(label)
            inputBlock.appendChild(input)

            return inputBlock
        }
    },

    createFieldElement: function(){
        const table = document.createElement('table');
        for (let i = 0; i < this.height; i++) {
            const tr = document.createElement('tr')
        
            for (let j = 0; j < this.width; j++) {
                const index = (i * this.width) + j
                const td = document.createElement('td')

                if(this.field[index].opened){
                    td.className = 'open'
                } else {
                    td.className = 'closed'
                }

                let symbol = this.field[index].value
                
                if (symbol == 0) {
                    symbol = '&nbsp;'
                    td.style.color = this.colors["0"]
                } else if (symbol == -1) {
                    symbol = '&ofcir;'
                    td.style.color = this.colors.bomb
                } else {
                    td.style.color = this.colors[symbol]
                }
                
                if (this.field[index].marked) {
                    td.className = 'marked'
                    symbol = '&trianglelefteq;'
                    td.style.color = this.colors.bomb
                }

                td.innerHTML = symbol
                td.id = 'cell-' + index
                
                td.onclick = () => {
                    this.openCell(index)
                }
                td.onauxclick = (e) => {
                    e.preventDefault()
                    this.toggleMarkCell(index)
                    this.draw()
                }
                td.oncontextmenu = (e) => {
                    e.preventDefault()
                }

                tr.appendChild(td)
            }
            table.appendChild(tr)
        }

        const messageContainer = document.createElement('div')
        messageContainer.className = 'message'
        messageContainer.innerHTML = this.message
        messageContainer.onclick = () => { this.messageFunction() }


        const fieldContainer = document.createElement('main')
        fieldContainer.appendChild(table)
        fieldContainer.appendChild(messageContainer)
        
        return fieldContainer
    },

    updateSettings: function(){
        this.height = parseInt(document.getElementById('rows').value)
        this.width = parseInt(document.getElementById('columns').value)
        this.bombs = parseInt(document.getElementById('bombs').value)

        this.resetGame()
    },

    messagePlayer: function(message){
        this.message = message
        this.draw()
    }
}

Game.init()
Game.draw()
