import './style.css'

const canvas = document.querySelector<HTMLCanvasElement>("#tetris-canvas")!;
const context = canvas.getContext("2d")!;

const BOARD_HEIGHT = 20, BOARD_WIDTH = 10, BLOCK_SIZE = 48;
const CANVAS_HEIGHT = BOARD_HEIGHT * BLOCK_SIZE, CANVAS_WIDTH = BOARD_WIDTH * BLOCK_SIZE;

canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

const DIM_ALPHA = 0.625;
let GAME_OVER: boolean = false;
document.getElementById("game-over-div")!.style.display = "none";
document.getElementById("kill")!.addEventListener("click", function() {
	GAME_OVER = true;
});

let frame_count = 0;
let frame_count_array = Array(2000).fill(0);
let score = 0;

const colors = [
	"white",
	"red",
	"yellow",
	"violet",
	"cyan",
	"skyblue",
	"limegreen",
	"orange"
];

const board = [
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
];

interface TetrisShape {
	side: number,
	map: number[][]
}

const shapes: TetrisShape[] = [
	{
		side: 2,
		map: [
			[1, 1],
			[1, 1]
		]
	},
	{
		side: 3,
		map: [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0]
		]
	},
	{
		side: 3,
		map: [
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0]
		]
	},
	{
		side: 3,
		map: [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0]
		]
	},
	{
		side: 4,
		map: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		]
	}
];

interface TetrisPiece {
	pos: {
		r: number,
		c: number
	},
	shape: TetrisShape,
	color: string,
	color_id: number
}

const curr: TetrisPiece = {
	pos: {
		r: 8,
		c: 3
	},
	shape: shapes[0],
	color: colors[5],
	color_id: 5
};
let ghost: TetrisPiece;


function valid_pos(piece: TetrisPiece, r: number, c: number): boolean {
	for(let i = 0; i < piece.shape.side; i++) {
		for(let j = 0; j < piece.shape.side; j++) {
			if(
				piece.shape.map[i][j] &&
				!(
					0 <= (r + i) && (r + i) < BOARD_HEIGHT &&
					0 <= (c + j) && (c + j) < BOARD_WIDTH &&
					board[r + i][c + j] === -1
				)
			) return false;
		}
	}
	return true;
}

function out_of_bounds_c(piece: TetrisPiece): boolean {
	for(let i = 0; i < piece.shape.side; i++) {
		for(let j = 0; j < piece.shape.side; j++) {
			if(
				piece.shape.map[i][j] &&
				!(
					0 <= (piece.pos.c + j) && (piece.pos.c + j) < BOARD_WIDTH
				)
			) return true;
		}
	}
	return false;
}

function out_of_bounds(piece: TetrisPiece): boolean {
	for(let i = 0; i < piece.shape.side; i++) {
		for(let j = 0; j < piece.shape.side; j++) {
			if(
				piece.shape.map[i][j] &&
				!(
					0 <= (piece.pos.r + i) && (piece.pos.r + i) < BOARD_HEIGHT &&
					0 <= (piece.pos.c + j) && (piece.pos.c + j) < BOARD_WIDTH
				)
			) return true;
		}
	}
	return false;
}

function rotate(piece: TetrisPiece) : void {
	const new_shape: TetrisShape["map"] = piece.shape.map.map((row, r) => row.map((_cell, c) => piece.shape.map[piece.shape.side - 1 - c][r]));
	const new_piece: TetrisPiece = JSON.parse(JSON.stringify(piece));
	new_piece.shape.map = new_shape;

	while(out_of_bounds_c(new_piece)) {
		if(new_piece.pos.c < 0)
			new_piece.pos.c++;
		else
			new_piece.pos.c--;
	}

	while(!valid_pos(new_piece, new_piece.pos.r, new_piece.pos.c)) {
		new_piece.pos.r--;
		if(out_of_bounds(new_piece)) return;
	}

	piece.pos.r = new_piece.pos.r;
	piece.pos.c = new_piece.pos.c;
	piece.shape.map = new_shape;
}

function solidify_piece(piece: TetrisPiece): void {
	for(let i = 0; i < piece.shape.side; i++) {
		for(let j = 0; j < piece.shape.side; j++) {
			if(piece.shape.map[i][j]) {
				board[piece.pos.r + i][piece.pos.c + j] = piece.color_id;
			}
		}
	}

	delete_rows_if_full(piece);
	reset_piece(curr);
}

function reset_piece(piece: TetrisPiece): void {
	piece.pos.r = 2, piece.pos.c = 3;
	piece.color_id = Math.floor(Math.random() * colors.length);
	piece.color = colors[piece.color_id];
	piece.shape = shapes[Math.floor(Math.random() * shapes.length)];

	while(!valid_pos(piece, piece.pos.r, piece.pos.c)) {
		piece.pos.r--;
		if(piece.pos.r < -3) {
			GAME_OVER = true;
			break;
		}
	}
}

function delete_rows_if_full(hint: TetrisPiece): void {
	const rows_to_be_removed: number[] = [];

	for(let i = 0; i < hint.shape.side; i++) {
		if(0 > hint.pos.r + i || hint.pos.r + i >= BOARD_HEIGHT) continue;
		if(board[hint.pos.r + i].every(value => value !== -1)) {
			rows_to_be_removed.push(hint.pos.r + i);
		}
	}

	rows_to_be_removed.forEach(r => {
		board.splice(r, 1);
		board.unshift(Array(BOARD_WIDTH).fill(-1));
	});

	score += rows_to_be_removed.length;
}


document.addEventListener("keydown", event => {
	if(!GAME_OVER) {
		if((event.key === "ArrowLeft" || event.key === "a") && valid_pos(curr, curr.pos.r, curr.pos.c - 1)) {
			curr.pos.c--;
		}
		if((event.key === "ArrowRight" || event.key === "d") && valid_pos(curr, curr.pos.r, curr.pos.c + 1)) {
			curr.pos.c++;
		}
		if((event.key === "ArrowDown" || event.key === "s") && valid_pos(curr, curr.pos.r + 1, curr.pos.c)) {
			curr.pos.r++;
		}
		if(event.key === "ArrowUp" || event.key === "w") {
			rotate(curr);
		}
		if(event.key === " ") {
			solidify_piece(ghost);
		}
	}
});

const restart_button = document.getElementById("restart-button")!
restart_button.addEventListener("click", function() {
	GAME_OVER = false;
	score = 0;
	window.requestAnimationFrame(update);
	document.getElementById("game-over-div")!.style.display = "none";

	for(let i = 0; i < BOARD_HEIGHT; i++) {
		for(let j = 0; j < BOARD_WIDTH; j++) {
			board[i][j] = -1;
		}
	}
	reset_piece(curr);
});

function render_piece(piece: TetrisPiece): void {
	context.fillStyle = piece.color;
	for(let i = 0; i < piece.shape.side; i++) {
		for(let j = 0; j < piece.shape.side; j++) {
			if(piece.shape.map[i][j]) {
				context.fillRect((piece.pos.c + j) * 1, (piece.pos.r + i) * 1, 1, 1);
			}
		}
	}
}

function render() {
	context.fillStyle = "#282828";
	context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

	for(let r = 0; r < BOARD_HEIGHT; r++) {
		for(let c = 0; c < BOARD_HEIGHT; c++) {
			if(board[r][c] !== -1) {
				context.fillStyle = colors[board[r][c]];
				context.fillRect(c * 1, r * 1, 1, 1);
			}
		}
	}

	ghost = JSON.parse(JSON.stringify(curr));
	ghost.color = "#525252"
	while(valid_pos(ghost, ghost.pos.r + 1, ghost.pos.c)) {
		ghost.pos.r++;
	}
	render_piece(ghost);
	render_piece(curr);

	if(GAME_OVER) {
		context.fillStyle = `rgba(0, 0, 0, ${DIM_ALPHA})`;
		context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

		document.getElementById("game-over-div")!.style.display = "flex";
		restart_button.focus();
	}

	document.querySelector("#score-span")!.innerHTML = `${score}`;

	const millis = performance.now();
	document.querySelector("#frame-rate-span")!.innerHTML = `
		${(++frame_count - frame_count_array[(millis + 1000) % 2000])}
	`;

	for(let i = 0; i < 30; i++)
		frame_count_array[(millis + i) % 2000] = frame_count;
}

function update() {
	render();

	if(!GAME_OVER) {
		window.requestAnimationFrame(update);
	}
}

update();
