const Player = (sign, name = undefined) => {
  return { sign, name }
}

const gameBoard = (() => {
  let board = [
    ['_', '_', '_'],
    ['_', '_', '_'],
    ['_', '_', '_']
  ]

  const clear = () => {
    for (row = 0; row < 3; row++) {
      for (col = 0; col < 3; col++) {
        gameBoard.board[row][col] = '_'
      }
    }
  }

  return { board, clear }
})()

const gameController = (() => {
  const playerX = Player('x', 'Player X')
  const opponentO = Player('o', 'Player O')

  let _currentPlayer = Math.random() < 0.5 ? playerX : opponentO

  const getCurrentPlayer = () => _currentPlayer

  const setCurrentPlayer = player => _currentPlayer = player

  const togglePlayer = () => {
    if (getCurrentPlayer() === playerX) setCurrentPlayer(opponentO)
    else if (getCurrentPlayer() === opponentO) setCurrentPlayer(playerX)
  }

  const getPlayerNames = () => {
    return { playerX: playerX.name, opponentO: opponentO.name }
  }

  const setPlayerNames = (playerName, opponentName) => {
    if (playerName !== '') playerX.name = playerName.toString()
    if (opponentName !== '') opponentO.name = opponentName.toString()
  }

  const start = () => {
    const playerXName = document.getElementById('player-name').value
    const opponentOName = document.getElementById('opponent-name').value

    displayController.toggleOverlay()

    setPlayerNames(playerXName, opponentOName)
    displayController.renderNames()
    
    gameBoard.clear()
    displayController.renderBoard()

    displayController.renderCurrentPlayerOutline(getCurrentPlayer())
  }

  const restart = () => {
    displayController.toggleOverlay()
    gameBoard.clear()
    displayController.renderBoard()
  }

  const evaluate = () => {
    const b = gameBoard.board

    // Check Rows for X or O victory.
    for (let row = 0; row < 3; row++) {
      if (b[row][0] == b[row][1] && b[row][1] == b[row][2]) {
        if (b[row][0] == playerX.sign) return +10
        else if (b[row][0] == opponentO.sign) return -10
      }
    }

    // Check Columns for X or O victory.
    for (let col = 0; col < 3; col++) {
      if (b[0][col] == b[1][col] && b[1][col] == b[2][col]) {
        if (b[0][col] == playerX.sign) return +10
        else if (b[0][col] == opponentO.sign) return -10
      }
    }

    // Check for Diagonal X or O victory.
    if (b[0][0] == b[1][1] && b[1][1] == b[2][2]) {
      if (b[0][0] == playerX.sign) return +10
      else if (b[0][0] == opponentO.sign) return -10
    }

    if (b[0][2] == b[1][1] && b[1][1] == b[2][0]) {
      if (b[0][2] == playerX.sign) return +10
      else if (b[0][2] == opponentO.sign) return -10
    }
  }

  const goBack = () => {
    if (_checkForWin() !== false || _checkForTie() === true) {
      _checkForEndCondition()
    } else {
      displayController.toggleOverlay()
    }
  }

  const _checkForWin = () => {
    let winner = null

    if (evaluate() === 10) {
      winner = playerX
      return winner
    } else if (evaluate() === -10) {
      winner = opponentO
      return winner
    } else {
      return false
    }
  }

  const _checkForTie = () => {
    const board1D = gameBoard.board.flat()
    if(board1D.includes('_')) return false
    return true
  }

  const _checkForEndCondition = () => {
    if(_checkForWin() !== false || _checkForTie() === true) {
      if (_checkForWin() !== false) _endGame('win')
      else _endGame('tie')
      return true
    }
    return false
  }

  const _endGame = (endCondition) => {
    let winner = "It's a tie"
    if (endCondition === 'win') winner = `${_checkForWin().name} wins!`

    displayController.renderGameEndAnnouncement(winner)
  }

  const _appendMove = (player, index) => {
    const board1D = gameBoard.board.flat()
    const board2D = []

    if (board1D[index] === '_') {
      board1D[index] = player.sign
      togglePlayer()
    }

    while (board1D.length) board2D.push(board1D.splice(0, 3))
    gameBoard.board = board2D
  }

  const playerMove = (index) => {
    if (_checkForEndCondition() === false) {
      _appendMove(getCurrentPlayer(), index)
      displayController.renderBoard(gameBoard.board)
      _checkForEndCondition()
      displayController.renderCurrentPlayerOutline(getCurrentPlayer())
    }
  }

  return {
    getCurrentPlayer,
    setCurrentPlayer,
    getPlayerNames,
    setPlayerNames,
    start,
    restart,
    evaluate,
    goBack,
    playerMove
  }
})()

const displayController = (() => {
  const elFields = document.querySelectorAll('.field')
  const elStartBtn = document.querySelector('.start')
  const elRestartBtn = document.querySelector('.restart')
  const elSettingsBtns = document.querySelectorAll('.settings-btn')

  const renderBoard = () => {
    const board1D = gameBoard.board.flat()
    const fieldArray = [...elFields]

    fieldArray.map((field, index) => {
      field.innerHTML = ''
      if (board1D[index] === 'x') {
        const xSign = document.createElement('div')
        const line1 = document.createElement('div')
        const line2 = document.createElement('div')

        xSign.classList.add('x-sign')
        xSign.appendChild(line1)
        xSign.appendChild(line2)
        field.appendChild(xSign)
      } else if (board1D[index] === 'o') {
        const oSign = document.createElement('div')

        oSign.classList.add('circle')
        field.appendChild(oSign)
      }
    })
  }

  const renderNames = () => {
    const elPlayerXNameCell = document.querySelector('.player')
    const elOpponentONameCell = document.querySelector('.opponent')

    playerNames = gameController.getPlayerNames()
    if (playerNames['playerX'] !== 'Player X') elPlayerXNameCell.innerHTML = `${playerNames['playerX']} X`
    if (playerNames['opponentO'] !== 'Player O') elOpponentONameCell.innerHTML = `${playerNames['opponentO']} O`
  }
  
  const renderCurrentPlayerOutline = (currentPlayer) => {
    const elPlayerXNameCell = document.querySelector('.player')
    const elOpponentONameCell = document.querySelector('.opponent')

    if (currentPlayer.sign === 'x') {
      elOpponentONameCell.classList.remove('current')
      elPlayerXNameCell.classList.add('current')
    } else {
      elPlayerXNameCell.classList.remove('current')
      elOpponentONameCell.classList.add('current')
    }
  }

  const toggleOverlay = () => {
    const elOverlay = document.querySelector('.overlay')
    elOverlay.classList.toggle('hidden')
  }

  const renderGameEndAnnouncement = (winner) => { 
    const elOverlay = document.querySelector('.overlay')
    const elGameControls = document.querySelector('.game-controls')
    const elAnnounce = document.querySelector('.announce')
    const elAnnounceText = document.querySelector('.announce-text')

    elAnnounceText.innerHTML = winner

    elGameControls.classList.add('hidden')
    elAnnounce.classList.remove('hidden')

    elOverlay.classList.remove('hidden')
  }

  const _renderChangeWarning = () => {
    const elChangeWarning = document.querySelector('.change-warning')
    elChangeWarning.classList.remove('hidden')
  }

  const renderSettings = () => {
    const elOverlay = document.querySelector('.overlay')
    const elAnnounce = document.querySelector('.announce')
    const elGameControls = document.querySelector('.game-controls')
    const elGameControlsButtons = document.querySelector('.game-controls-buttons')
    const playerXNameInput = document.getElementById('player-name')
    const opponentONameInput = document.getElementById('opponent-name')

    elAnnounce.classList.add('hidden')
    elGameControls.classList.remove('hidden')
    elStartBtn.innerHTML = 'Restart Game'

    if (!document.querySelector('.go-back')) {
      const btn = document.createElement('button')
      btn.classList.add('go-back')
      btn.innerHTML = 'Go Back'
      elGameControlsButtons.appendChild(btn)
      btn.addEventListener('click', gameController.goBack)

      playerXNameInput.addEventListener('input', _renderChangeWarning)
      opponentONameInput.addEventListener('input', _renderChangeWarning)
    }

    elOverlay.classList.remove('hidden')
  }

  const _init = (() => {
    elFields.forEach((field, index) => {
      field.addEventListener('click', gameController.playerMove.bind(this, index))
    })

    elStartBtn.addEventListener('click', gameController.start)
    elRestartBtn.addEventListener('click', gameController.restart)
    elSettingsBtns.forEach(btn => btn.addEventListener('click', renderSettings))
  })()

  return {
    renderBoard,
    renderNames,
    renderCurrentPlayerOutline,
    toggleOverlay,
    renderGameEndAnnouncement,
    renderSettings
  }
})()

// To do:
// AI or Person

// make overlay buttons in mobile smaller and aligned to center