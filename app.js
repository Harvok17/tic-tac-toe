const Player = (name) => {
  return { name };
};

const menuModule = (function () {
  return {
    createPlayer: function () {
      const PLAYER_ONE = document.getElementById("player-1").value;
      this.playerOne = Player(PLAYER_ONE);
    },

    createHuman: function () {
      const PLAYER_TWO = document.getElementById("player-2").value;
      this.playerTwo = Player(PLAYER_TWO);
    },

    createComp: function () {
      this.computer = Player("Deep Blue");
    },

    setOpponent: function (opp) {
      this.opponent = opp;
    },

    setChoice: function (sym) {
      this.symbol = sym;
    },

    clearInput: function () {
      const inputs = document.querySelectorAll(`#player-1, #player-2`);
      Array.from(inputs).forEach((input) => {
        input.value = "";
      });
    },
  };
})();

const gameBoard = (function () {
  const mainBoard = Array.from(Array(9).keys());
  return {
    mainBoard,
  };
})();

const displayController = (function () {
  return {
    displayMove: function (loc, move) {
      const tile = document.getElementById(loc);
      if (!tile) {
        return;
      }
      tile.classList.add(move);
    },

    displayWinner: function (winner) {
      const endContainer = document.querySelector(".end-container");
      const winMessage = document.querySelector(".winner");
      const playAgain = document.querySelector(".play-again");

      endContainer.style.transform = "translateY(0)";
      winMessage.innerText = `${winner}`;
      playAgain.addEventListener("click", function () {
        location.reload(true);
      });
    },
  };
})();

const game = (function (gmBoard, dispCtrl) {
  const tiles = document.querySelectorAll(".tile");
  const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2],
  ];

  return {
    PlayGame: function (huPlayer, opponent, versusMode) {
      let current = huPlayer.move;
      let isGameOver = false;
      for (let i = 0; i < tiles.length; i++) {
        tiles[i].addEventListener("click", turnClick);
      }
      function turnClick(e) {
        if (versusMode == "human") {
          if (typeof gmBoard.mainBoard[e.target.id] == "number") {
            if (current == huPlayer.move) {
              turn(e.target.id, current);
              current = opponent.move;
            } else if (current == opponent.move) {
              turn(e.target.id, current);
              current = huPlayer.move;
            }
          }
        } else {
          if (typeof gmBoard.mainBoard[e.target.id] == "number") {
            turn(e.target.id, huPlayer.move);
            if (!isGameOver) turn(bestSpot(), opponent.move);
          }
        }
      }

      function turn(squareID, currPlayerMove) {
        gmBoard.mainBoard[squareID] = currPlayerMove;
        dispCtrl.displayMove(squareID, currPlayerMove);
        let gameWon = checkWin(gmBoard.mainBoard, currPlayerMove);
        if (gameWon) gameOver(gameWon);
        checkTie(gameWon);
      }

      function checkWin(board, playerMove) {
        let plays = board.reduce(
          (a, e, i) => (e === playerMove ? a.concat(i) : a),
          []
        );
        let gameWon = null;
        for (let [index, win] of winCombos.entries()) {
          if (win.every((elem) => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, playerMove: playerMove };
            break;
          }
        }
        return gameWon;
      }

      function gameOver(gameWon) {
        isGameOver = true;
        for (let i = 0; i < tiles.length; i++) {
          tiles[i].removeEventListener("click", turnClick);
        }

        if (gameWon.playerMove == huPlayer.move) {
          dispCtrl.displayWinner(`${huPlayer.name} wins!`);
        } else if (gameWon.playerMove == opponent.move) {
          dispCtrl.displayWinner(`${opponent.name} wins!`);
        }
      }

      function checkTie(gameWon) {
        if (emptySquares(gmBoard.mainBoard).length == 0 && !gameWon) {
          for (let i = 0; i < tiles.length; i++) {
            tiles[i].removeEventListener("click", turnClick);
          }
          dispCtrl.displayWinner("It's a Tie!");
        }
      }

      function emptySquares(board) {
        return board.filter((s) => typeof s == "number");
      }

      function bestSpot() {
        return minimax(gmBoard.mainBoard, opponent.move).index;
      }

      function minimax(newBoard, player) {
        let availSpots = emptySquares(newBoard);

        if (checkWin(newBoard, huPlayer.move)) {
          return { score: -10 };
        } else if (checkWin(newBoard, opponent.move)) {
          return { score: 10 };
        } else if (availSpots.length === 0) {
          return { score: 0 };
        }

        let moves = [];
        for (let i = 0; i < availSpots.length; i++) {
          let move = {};
          move.index = newBoard[availSpots[i]];
          newBoard[availSpots[i]] = player;

          if (player == opponent.move) {
            let result = minimax(newBoard, huPlayer.move);
            move.score = result.score;
          } else {
            let result = minimax(newBoard, opponent.move);
            move.score = result.score;
          }

          newBoard[availSpots[i]] = move.index;

          moves.push(move);
        }

        let bestMove;
        if (player === opponent.move) {
          let bestScore = -10000;
          for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
              bestScore = moves[i].score;
              bestMove = i;
            }
          }
        } else {
          let bestScore = 10000;
          for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
              bestScore = moves[i].score;
              bestMove = i;
            }
          }
        }

        return moves[bestMove];
      }
    },
  };
})(gameBoard, displayController);

const controller = (function (menu) {
  const menuContainer = document.querySelector(".menu-container");
  const playerTwoInput = document.getElementById("player-2");
  const vsComp = document.getElementById("vs-comp");
  const vsHum = document.getElementById("vs-human");
  const xBtn = document.getElementById("x-btn");
  const oBtn = document.getElementById("o-btn");
  const START = document.querySelector(".start");

  function switchActive(off, on) {
    off.classList.remove("active");
    on.classList.add("active");
  }

  vsComp.addEventListener("click", function () {
    vsComp.dataset.content = "WARNING: Unbeatable"
    vsHum.style.backgroundColor = "transparent";
    switchActive(vsHum, vsComp);
    menu.setOpponent("computer");
    playerTwoInput.style.display = "none";
  });

  vsHum.addEventListener("click", function () {
    vsComp.dataset.content = ""
    vsComp.style.backgroundColor = "transparent";
    switchActive(vsComp, vsHum);
    menu.setOpponent("human");
    playerTwoInput.style.display = "block";
  });

  xBtn.addEventListener("click", function () {
    oBtn.style.backgroundColor = "transparent";
    switchActive(oBtn, xBtn);
    menu.setChoice("x");
  });

  oBtn.addEventListener("click", function () {
    xBtn.style.backgroundColor = "transparent";
    switchActive(xBtn, oBtn);
    menu.setChoice("o");
  });

  START.addEventListener("click", function () {
    menu.createPlayer();
    let versus = menu.opponent;
    let player = menu.playerOne;
    let opponent;

    if (player.name == "") {
      player.name = "Player 1";
    }

    if (!versus) {
      vsComp.style.backgroundColor = "#f76c6c";
      vsHum.style.backgroundColor = "#f76c6c";
      return;
    }
    if (!menu.symbol) {
      xBtn.style.backgroundColor = "#f76c6c";
      oBtn.style.backgroundColor = "#f76c6c";
      return;
    }

    if (versus == "computer") {
      menu.createComp();
      opponent = menu.computer;
      if (menu.symbol == "x") {
        player.move = "x";
        opponent.move = "o";
      } else if (menu.symbol == "o") {
        player.move = "o";
        opponent.move = "x";
      }

      game.PlayGame(player, opponent, versus);
    } else if (versus == "human") {
      menu.createHuman();
      opponent = menu.playerTwo;
      if (opponent.name == "") {
        opponent.name = "Player 2";
      }
      if (menu.symbol == "x") {
        player.move = "x";
        opponent.move = "o";
      } else if (menu.symbol == "o") {
        player.move = "o";
        opponent.move = "x";
      }
      game.PlayGame(player, opponent, versus);
    }

    menu.clearInput();
    menuContainer.classList.add("hide");
  });
})(menuModule);
