var grid = {width: 40, height: 40};
var markTable = [];

function gridInitialize(){
	for(var i = 0 ; i < grid.height ; i ++){
		var row = [];
		var mark = [];
		for(var j = 0 ; j < grid.width ; j ++){
			row.push(0);
			mark.push(false);
		}
		grid[i] = row;
		markTable.push(mark);
	}
}

function isInsideGrid(x, y){
    if(x > -1 && x < grid.width && y > -1 && y < grid.height){
        return true;
    }
    else{
        return false;
    }
}

function check(root, cell){
	var first = !markTable[cell.x][cell.y];
	var second = !markTable[Math.floor((root.x + cell.x) / 2)][Math.floor((root.y + cell.y) / 2)];

	return (first && second);
}

function destroyWall(root, cell){
	markTable[cell.x][cell.y] = true;
	markTable[Math.floor((root.x + cell.x) / 2)][Math.floor((root.y + cell.y) / 2)] = true;
	grid[cell.x][cell.y] = 1;
	grid[Math.floor((root.x + cell.x) / 2)][Math.floor((root.y + cell.y) / 2)] = 1;
}

function drill(probability){
	for(var i = 0 ; i < grid.height ; i ++){
		for(var j = 0 ; j < grid.width ; j ++){
			if(grid[i][j] == 0){
				var rand = Math.floor(Math.random() * 100) / (100 - probability);
				if(rand > 1){
					grid[i][j] = 1;
				}
			}
		}
	}
}


function generator(){
	var randomIndexSource = Math.floor(Math.random() * 3);
	var stack = [];

	stack.push({x: 0, y: randomIndexSource});
	while(stack.length > 0){
		var node = stack.pop();
		var gcandidate = [{x:node.x, y:node.y - 2}, 
						 {x:node.x - 2, y:node.y}, 
						 {x:node.x + 2, y:node.y},  
						 {x:node.x, y:node.y + 2}]
		var neighbors = []
		for(var i = 0 ; i < gcandidate.length ; i ++){
			if(isInsideGrid(gcandidate[i].x, gcandidate[i].y) && check(node, gcandidate[i])){
				neighbors.push(gcandidate[i]);
			}
		}
		while(neighbors.length > 0){
			var randomIndex = Math.floor(Math.random() * neighbors.length);
			var neighbor = neighbors.splice(randomIndex, 1)[0];
			var probability = Math.floor(Math.random() * 100) / 30;
			if(probability > 1){
				destroyWall(node, neighbor);
				stack.push(neighbor);
			}
		}


	}
	drill(70);

}

function mazeGenerating(){
    gridInitialize();
    generator();
}


// Deploy thuật toán như sau:
/*
    1. Khởi tạo openList
    2. Khởi tạo closedList, đặt node xuất phát vào trong openList (có thể đặt hàm f có node bằng 0)
    3. Vòng lặp while(openList không rỗng))
        a. Tìm node có f nhở nhất trong openList, đặt node là node q
        b. Pop q khởi openList
        c. Tạo ra 8 successor (các node lân cần) của q và đặt tọa độ cha của chúng là tọa độ của q
        d. Vòng lặp for(mỗi successor của q)
            i. nếu successor là đích thì dừng tìm kiếm

            Tính g, h, f = g + h cho successor

            ii. Nếu successor này đã có trong openList và successor trong openList f nhở hơn successor hiện tại thì bỏ qua successor này
            
            iii. Nếu successor đã tồn tại trong closedList thì skip successor này

           Kết thúc vòng for.
        e. Push q vào closedList
       Kết thúc vòng while
*/


function distance(a, b){
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
}

class cell{
    constructor(x, y, parent, g){
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.isVisited = false;
        this.g = g;
    }

    evaluateFValue(destination, source){
        this.f = this.g + this.heuristic5(destination, source);
    }

    heuristic1(destination, source){
        return distance(this, destination)
    }

    heuristic2(destination, source){
        var CS = distance(this, source);
        var CD = distance(this, destination);
        var SD = distance(source, destination);
        return Math.abs(((CS**2 + SD**2 - CD**2) / (2 * CS * SD)) - 1);
    }

    heuristic3(destination, source){
        return Math.abs(destination.x - this.x) + Math.abs(destination.y + this.y)
    }

    heuristic4(){
        return 0;
    }

    heuristic5(destination, source){
        return 2 * this.heuristic1(destination, source) + this.heuristic2(destination, source);
    }

    heuristic6(destination, source){
        var obstacle = 0
        obstacle += isInsideGrid(this.x, this.y - 1) && isWall(this.x, this.y - 1) ? 1 : 0;
        obstacle += isInsideGrid(this.x, this.y + 1) && isWall(this.x, this.y + 1) ? 1 : 0;
        obstacle += isInsideGrid(this.x - 1, this.y) && isWall(this.x - 1, this.y) ? 1 : 0;
        obstacle += isInsideGrid(this.x + 1, this.y) && isWall(this.x + 1, this.y) ? 1 : 0;

        return this.heuristic5(destination, source) - 10000 * obstacle;
    }
}

var gridDetail = [];
var openList = [];

var pickedSource = false;
var pickedDestination = false;
var source = null;
var destination = null;

var considered = [];
var result = null;
var hasPath = false;


function initialize(){
    for(var i = 0 ; i < grid.height ; i ++){
        var row = []
        for(var j = 0 ; j < grid.width ; j ++){
            var cellDetail = new cell(i, j, null, null);
            row.push(cellDetail)
        }
        gridDetail.push(row);
    }
}

function isDestination(x, y, destination){
    return (x === destination.x && y === destination.y);
}

function isWall(x, y){
    return (grid[x][y] === 0);
}

function isInsideGrid(x, y){
    return (x > -1 && x < grid.width && y > -1 && y < grid.height);
}

function pathTracing(){
    var temp_x = gridDetail[destination.x][destination.y].parent.x;
    var temp_y = gridDetail[destination.x][destination.y].parent.y;

    var path = [];
    path.push({x: destination.x, y: destination.y});

    while(temp_x !== source.x || temp_y !== source.y){
        var parent = gridDetail[temp_x][temp_y]

        temp_x = parent.parent.x;
        temp_y = parent.parent.y;
        path.push({x: parent.x, y: parent.y});
    }
    path.push({x: source.x, y: source.y});

    return path;
}

function samePositionInOpenList(cell){
    for(var i = 0 ; i < openList.length ; i ++){
        if(openList[i].x == cell.x && openList[i].y == cell.y){
            return {cell:openList[i], index:i};
        }
    }
    return null;
}

function insertIntoOpenList(cell){
    var index = 0;
    while(index < openList.length && openList[index].f < cell.f){
        index ++;
    }

    if(index === openList.length){
        openList.push(cell);
    } else {
        openList.splice(index, 0, cell);
    }
    
}

function updateOpenList(index, cell){
    var idx = index;
    openList.splice(index, 1);

    while(index > -1 && openList[index].f > cell.f){
        index --;
    }

    if(index === -1){
        openList.unshift(cell);
    } else {
        openList.splice(index, 0, cell);
    }
}

function checkGrid(){
    return !(isDestination(source.x, source.y, destination) || isWall(source.x, source.y) || isWall(destination.x, destination.y) || !isInsideGrid(source.x, source.y) || !isInsideGrid(destination.x, destination.y))
}

function AStarAlgorithm(){
    initialize();
    if(!checkGrid()) return null;

    insertIntoOpenList(gridDetail[source.x][source.y]);
    while(openList.length > 0){
        var current = openList.shift();
        var candidate = [{x:current.x, y:current.y - 1}, 
                        {x:current.x - 1, y:current.y}, 
                        {x:current.x + 1, y:current.y},  
                        {x:current.x, y:current.y + 1}]

        var neighbors = [];
        for(let i = 0 ; i < candidate.length ; i ++){
            if(isInsideGrid(candidate[i].x, candidate[i].y) && !isWall(candidate[i].x, candidate[i].y) && !gridDetail[candidate[i].x][candidate[i].y].isVisited){
                gridDetail[candidate[i].x][candidate[i].y].parent = current;
                gridDetail[candidate[i].x][candidate[i].y].g = current.g + 1;
                neighbors.push(gridDetail[candidate[i].x][candidate[i].y]);
                considered.push({x : candidate[i].x, y : candidate[i].y})
            }
        }

        for(let i = 0 ; i < neighbors.length ; i ++){
            var successor = neighbors[i];

            if(isDestination(successor.x, successor.y, destination)){
                hasPath = true;
                return pathTracing();
            }

            successor.evaluateFValue(destination, source);
            var samePosition = samePositionInOpenList(successor);
            if(samePosition !== null){
                if(samePosition.cell.g > successor.g){
                    updateOpenList(samePosition, successor);
                    continue;
                }
            } else{
                insertIntoOpenList(neighbors[i]);
            }
        }

        gridDetail[current.x][current.y].isVisited = true;
    }
    return null;
}

function search(){
    result = AStarAlgorithm();
}

// UI creation

var gwidth = 1000;
var gheight = 1000;
var cellWidth = 20;
var cellHeight = 20;
var allowToRun = false;
var createMaze = false;
var selectSD = true;

function setup(){
    mazeGenerating();
    pickedSource = false;
    pickedDestination = false;
    createCanvas(gwidth + cellWidth, gheight + cellHeight)
    for(var i = 0 ; i < grid.width ; i ++){
        for(var j = 0 ; j < grid.height ; j ++){
            if(grid[i][j] == 1) {
                fill(255)
            } else{
                fill(0)
            }
            rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }

}

function mouseDragged(){
    if(createMaze){
        var i = Math.floor(mouseX / cellWidth);
        var j = Math.floor(mouseY / cellWidth);
        grid[i][j] = 0;
        fill(0);
        rect(Math.floor(mouseX / cellWidth) * cellWidth, Math.floor(mouseY / cellWidth) * cellHeight, cellWidth, cellHeight)
    }
}

function mousePressed(){
    if(selectSD){
        var x = Math.floor(mouseX / cellWidth);
        var y = Math.floor(mouseY / cellHeight);

        if(isInsideGrid(x, y) && !isWall(x, y)){    
            if(pickedSource){
                if(pickedDestination){
                    alert("Da chon diem xuat phat va diem dich")
                } else{
                    if(x == source.x && y == source.y){
                        alert("Diem xuat phat va diem dich trung nhau")
                    } else{
                        destination = {x: Math.floor(mouseX / cellWidth), y: Math.floor(mouseY / cellHeight)};
                        fill(0, 255, 0);
                        rect(destination.x * cellWidth, destination.y * cellHeight, cellWidth, cellHeight)
                        pickedDestination = true;

                        search();
                        loop();
                    }
                } 
            } else{
                source = {x: Math.floor(mouseX / cellWidth), y: Math.floor(mouseY / cellHeight)};
                fill(255, 0, 0);
                rect(source.x * cellWidth, source.y * cellHeight, cellWidth, cellHeight)
                pickedSource = true;
            }
        }
    } else if(createMaze){
        var i = Math.floor(mouseX / cellWidth);
        var j = Math.floor(mouseY / cellWidth);
        grid[i][j] = 0;
        fill(0);
        rect(Math.floor(mouseX / cellWidth) * cellWidth, Math.floor(mouseY / cellWidth) * cellHeight, cellWidth, cellHeight)
    }
}

var indexConsidered = 0;
var doneConsidered = false;
function draw(){
    frameRate(60);
    if(source == null || destination == null){
        var indexPath = 0;
        noLoop();
    } else{
        if(!doneConsidered){
            fill(255, 255, 102)
            rect(considered[indexConsidered].x * cellWidth, considered[indexConsidered].y * cellHeight, cellWidth, cellHeight);
            indexConsidered ++;
            doneConsidered = indexConsidered >= considered.length ? true : false;
        } else{
            result.shift();
            for(var i = 0 ; i < result.length ; i ++){
                fill(191, 64, 64)
                rect(result[i].x * cellWidth, result[i].y * cellHeight, cellWidth, cellHeight);
            }
            fill(0, 255, 0)
            rect(destination.x * cellWidth, destination.y * cellHeight, cellWidth, cellHeight);
            fill(255, 0, 0)
            rect(source.x * cellWidth, source.y * cellHeight, cellWidth, cellHeight);

            noLoop();
        }
    }
}
$("#reload").on("click", function(){
    location.reload();
})

$("#createMaze").on("click", function(){
    createMaze = true;
    selectSD = false;
})

$("#selectSD").on("click", function(){
    createMaze = false;
    selectSD = true;
})

$("#clearMaze").on("click", function(){
    for(var i = 0 ; i < grid.width ; i ++){
        for(var j = 0 ; j < grid.height ; j ++){
            grid[i][j] = 1;
            fill(255);
            rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }
})
