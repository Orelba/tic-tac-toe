const Player = (sign, name) => {
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

  let _currentGameMode = 'PvP'
  let _currentPlayer = null
  let _startingPlayer = null

  const _sleepRandomTimeBetween = (minMs, maxMs) => {
    const randomTimeMs = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs)
    return new Promise((resolve) => { setTimeout(resolve, randomTimeMs) })
  }

  const _getCurrentPlayer = () => _currentPlayer

  const _setCurrentPlayer = player => _currentPlayer = player

  const getStartingPlayer = () => _startingPlayer

  const _setStartingPlayer = player => _startingPlayer = player

  const togglePlayer = () => {
    if (_getCurrentPlayer() === playerX) _setCurrentPlayer(opponentO)
    else if (_getCurrentPlayer() === opponentO) _setCurrentPlayer(playerX)
  }

  const getPlayerNames = () => {
    return { playerX: playerX.name, opponentO: opponentO.name }
  }

  const _setPlayerNames = (playerName, opponentName) => {
    if (playerName !== '') playerX.name = playerName.toString()
    if (opponentName !== '') opponentO.name = opponentName.toString()
  }

  const toggleGameMode = () => {
    if (_currentGameMode === 'PvP') {
      _currentGameMode = 'PvAI'
      displayController.renderAiOverlay()
      opponentO.name = 'AI'
    } else {
      _currentGameMode = 'PvP'
      displayController.renderPvPOverlay()
      opponentO.name = 'Player O'
    }
    displayController.renderGameModeBtn(_currentGameMode)
  }

  const start = () => {
    const playerXName = document.getElementById('player-name').value
    const opponentOName = (_currentGameMode === 'PvP') ? document.getElementById('opponent-name').value : 'AI'

    _setPlayerNames(playerXName, opponentOName)
    _setCurrentPlayer(Math.random() < 0.5 ? playerX : opponentO)
    _setStartingPlayer(_getCurrentPlayer())

    displayController.renderNames()
    displayController.renderCurrentPlayerOutline(_getCurrentPlayer())
    gameBoard.clear()
    displayController.renderBoard()
    displayController.toggleOverlay()

    if (_isAiTurn()) {
      _PlayAiMove(true)
    }
  }

  const evaluate = (b) => {

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

  const isMovesLeft = (board) => {
    const board1D = board.flat()
    if (board1D.includes('_')) return true
    return false
  }

  const _checkForWin = () => {
    let winner = null

    if (evaluate(gameBoard.board) === 10) {
      winner = playerX
      return winner
    } else if (evaluate(gameBoard.board) === -10) {
      winner = opponentO
      return winner
    } else {
      return false
    }
  }

  const _checkForEndCondition = () => {
    if (_checkForWin() !== false || isMovesLeft(gameBoard.board) === false) {
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

  const _appendPlayerMove = (player, index) => {
    const board1D = gameBoard.board.flat()
    const board2D = []

    if (board1D[index] === '_') {
      board1D[index] = player.sign
      togglePlayer()
    }

    while (board1D.length) board2D.push(board1D.splice(0, 3))
    gameBoard.board = board2D
  }

  const _isAiTurn = () => {
    if (_currentGameMode === 'PvAI' && _currentPlayer === opponentO) return true
    return false
  }

  const _generateRandomMove = () => {
    let emptySlots = []

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (gameBoard.board[i][j] === '_') {
          emptySlots.push([i, j])
        }
      }
    }

    randomIndex = Math.floor(Math.random() * emptySlots.length)
    randomSlot = emptySlots[randomIndex]

    let row = randomSlot[0]
    let col = randomSlot[1]
    return { row, col }
  }

  const _PlayAiMove = (firstMove = false) => {
    let move = { row: -1, col: -1 }

    if (!firstMove) move = aiLogic.findBestMove(gameBoard.board) // skip the slow AI algorithm for a speedy random start move.

    if (move.row === -1 || move.col === -1) move = _generateRandomMove()
    gameBoard.board[move.row][move.col] = 'o'

    displayController.renderBoard(gameBoard.board)

    _setCurrentPlayer(playerX)
    displayController.renderCurrentPlayerOutline(_getCurrentPlayer())
  }

  const makeMove = async (index) => {
    if (_checkForEndCondition() === false) {
      if (!_isAiTurn()) {
        _appendPlayerMove(_getCurrentPlayer(), index)
        displayController.renderBoard(gameBoard.board)
        displayController.renderCurrentPlayerOutline(_getCurrentPlayer())
        if (_isAiTurn() && _checkForEndCondition() === false) {
          await _sleepRandomTimeBetween(700, 1400)
          _PlayAiMove()
        }
        _checkForEndCondition()
      }
    }
  }

  const goBack = () => {
    if (_checkForWin() !== false || isMovesLeft(gameBoard.board) === false) {
      _checkForEndCondition()
    } else {
      displayController.toggleOverlay()
    }
  }

  return {
    getStartingPlayer,
    getPlayerNames,
    toggleGameMode,
    start,
    evaluate,
    isMovesLeft,
    makeMove,
    goBack
  }
})()

const aiLogic = (() => {
  class Move {
    constructor() {
      let row
      let col
    }
  }

  let player = 'x'
  let opponent = 'o'

  const minimax = (board, depth, isMax) => {
    let score = gameController.evaluate(board)

    if (score === 10 || score === -10) return score
    if (gameController.isMovesLeft(board) === false) return 0

    if (isMax) {
      let best = -10000

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '_') {
            board[i][j] = player
            best = Math.max(best, minimax(board, depth + 1, !isMax))
            board[i][j] = '_'
          }
        }
      }
    } else {
      let best = 10000

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '_') {
            board[i][j] = opponent
            best = Math.min(best, minimax(board, depth + 1, !isMax))
            board[i][j] = '_'
          }
        }
      }
      return best
    }
  }

  const _isMaximizer = () => {
    const maximizer = gameController.getStartingPlayer()
    if (maximizer.sign === 'o') return true
    return false
  }

  const findBestMove = (board) => {
    let bestVal = -10000
    let bestMove = new Move()
    bestMove.row = -1
    bestMove.col = -1

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '_') {
          board[i][j] = player
          let moveVal = minimax(board, 0, _isMaximizer())
          board[i][j] = '_'

          if (moveVal > bestVal) {
            bestMove.row = i
            bestMove.col = j
            bestVal = moveVal
          }
        }
      }
    }
    return bestMove
  }

  return { findBestMove }
})()

const displayController = (() => {
  const elFields = document.querySelectorAll('.field')
  const elStartBtn = document.querySelector('.start')
  const elRestartBtn = document.querySelector('.restart')
  const elSettingsBtns = document.querySelectorAll('.settings-btn')
  const elGameModeBtn = document.querySelector('.game-mode')

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

    const playerNames = gameController.getPlayerNames()
    if (playerNames['playerX'] !== 'Player X') {
      elPlayerXNameCell.innerHTML = `${playerNames['playerX']} X`
    } else {
      elPlayerXNameCell.innerHTML = 'Player X'
    }
    if (playerNames['opponentO'] !== 'Player O') {
      elOpponentONameCell.innerHTML = `${playerNames['opponentO']} O`
    } else {
      elOpponentONameCell.innerHTML = 'Player O'
    }
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

  const _renderSettings = () => {
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

  const renderGameModeBtn = (mode) => {
    if (mode === 'PvP') {
      elGameModeBtn.innerHTML = 'Player VS. Player'
    } else if (mode === 'PvAI') {
      elGameModeBtn.innerHTML = 'Player VS. AI'
    }
  }

  const renderAiOverlay = () => {
    const opponentONameInput = document.getElementById('opponent-name')
    const elOverlayInputHeader = document.querySelector('.input-header')

    opponentONameInput.classList.add('hidden')
    elOverlayInputHeader.innerHTML = 'Name'
  }

  const renderPvPOverlay = () => {
    const opponentONameInput = document.getElementById('opponent-name')
    const elOverlayInputHeader = document.querySelector('.input-header')

    opponentONameInput.value = ''
    opponentONameInput.classList.remove('hidden')
    elOverlayInputHeader.innerHTML = 'Names'
  }

  const _init = (() => {
    elFields.forEach((field, index) => {
      field.addEventListener('click', gameController.makeMove.bind(this, index))
    })

    elStartBtn.addEventListener('click', gameController.start)
    elRestartBtn.addEventListener('click', gameController.start)
    elSettingsBtns.forEach(btn => btn.addEventListener('click', _renderSettings))
    elGameModeBtn.addEventListener('click', gameController.toggleGameMode)
  })()

  return {
    renderBoard,
    renderNames,
    renderCurrentPlayerOutline,
    toggleOverlay,
    renderGameEndAnnouncement,
    renderGameModeBtn,
    renderAiOverlay,
    renderPvPOverlay
  }
})()