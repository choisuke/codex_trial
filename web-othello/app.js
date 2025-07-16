const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

const BOARD_SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = -1;

let board = [];
let currentPlayer = BLACK;

function initBoard() {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
    const mid = BOARD_SIZE / 2;
    board[mid - 1][mid - 1] = WHITE;
    board[mid][mid] = WHITE;
    board[mid - 1][mid] = BLACK;
    board[mid][mid - 1] = BLACK;
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', handleCellClick);
            if (board[y][x] !== EMPTY) {
                const disc = document.createElement('div');
                disc.className = 'disc';
                disc.style.backgroundColor = board[y][x] === BLACK ? 'black' : 'white';
                cell.appendChild(disc);
            }
            boardElement.appendChild(cell);
        }
    }
    updateStatus();
}

function inBounds(x, y) {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

function getFlips(x, y, dx, dy, player) {
    const flips = [];
    let cx = x + dx;
    let cy = y + dy;
    while (inBounds(cx, cy) && board[cy][cx] === -player) {
        flips.push([cx, cy]);
        cx += dx;
        cy += dy;
    }
    if (inBounds(cx, cy) && board[cy][cx] === player) {
        return flips;
    }
    return [];
}

function validMoves(player) {
    const moves = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== EMPTY) continue;
            const directions = [
                [1, 0], [-1, 0], [0, 1], [0, -1],
                [1, 1], [-1, -1], [1, -1], [-1, 1]
            ];
            for (const [dx, dy] of directions) {
                if (getFlips(x, y, dx, dy, player).length) {
                    moves.push([x, y]);
                    break;
                }
            }
        }
    }
    return moves;
}

function makeMove(x, y, player) {
    if (board[y][x] !== EMPTY) return false;
    let flipped = [];
    const directions = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [-1, -1], [1, -1], [-1, 1]
    ];
    for (const [dx, dy] of directions) {
        const flips = getFlips(x, y, dx, dy, player);
        flipped = flipped.concat(flips);
    }
    if (flipped.length === 0) return false;
    board[y][x] = player;
    for (const [fx, fy] of flipped) {
        board[fy][fx] = player;
    }
    return true;
}

function handleCellClick(event) {
    const x = parseInt(event.currentTarget.dataset.x, 10);
    const y = parseInt(event.currentTarget.dataset.y, 10);
    if (makeMove(x, y, currentPlayer)) {
        currentPlayer = -currentPlayer;
        if (validMoves(currentPlayer).length === 0) {
            currentPlayer = -currentPlayer;
            if (validMoves(currentPlayer).length === 0) {
                endGame();
                return;
            }
        }
        renderBoard();
    }
}

function updateStatus() {
    const blackCount = board.flat().filter(v => v === BLACK).length;
    const whiteCount = board.flat().filter(v => v === WHITE).length;
    statusElement.textContent = `黒: ${blackCount}  白: ${whiteCount}  ${currentPlayer === BLACK ? '黒の番です' : '白の番です'}`;
}

function endGame() {
    const blackCount = board.flat().filter(v => v === BLACK).length;
    const whiteCount = board.flat().filter(v => v === WHITE).length;
    let message = `ゲーム終了 黒:${blackCount} 白:${whiteCount} `;
    if (blackCount > whiteCount) message += '黒の勝ち！';
    else if (whiteCount > blackCount) message += '白の勝ち！';
    else message += '引き分け';
    statusElement.textContent = message;
    boardElement.querySelectorAll('.cell').forEach(cell => {
        cell.removeEventListener('click', handleCellClick);
    });
}

initBoard();
renderBoard();
