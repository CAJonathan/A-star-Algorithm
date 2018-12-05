var grid = {width: 30, height: 30};
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



// Algorithm


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

    evaluateFValue(destination, source, index){
        this.f = this.g + 2 * this.heuristic1(destination, source);
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
        var dx = Math.abs(destination.x - this.x);
        var dy = Math.abs(destination.y - this.y);
        return dx > dy ? 10 * dx + 14 * dy : 14 * dx + 10 * dy
    }

    heuristic4(){
        return Math.max(Math.abs(destination.x - this.x), Math.abs(destination.y + this.y));
    }

    heuristic5(destination, source){
        return 2 * this.heuristic1(destination, source) + this.heuristic2(destination, source);
    }
}

var gridDetail = [];
var openList = [];
var closeList = [];

var pickedS = false;
var pickedD = false;
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

function samePositionInList(cell, list){
    for(var i = 0 ; i < list.length ; i ++){
        if(list[i].x == cell.x && list[i].y == cell.y){
            return {cell:list[i], index:i};
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
    openList.splice(index, 1);
    insertIntoOpenList(cell);
}

function updateCell(x, y, parent, g){
    gridDetail[x][y].parent = parent;
    gridDetail[x][y].g = g;
    var index = $('input[name=heuristic]:checked').val()
    gridDetail[x][y].evaluateFValue(destination, source, index);
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
        if(isDestination(current.x, current.y, destination)){
            hasPath = true;
            return pathTracing();
        }

        var candidate = [{x:current.x, y:current.y - 1}, 
                        {x:current.x - 1, y:current.y}, 
                        {x:current.x + 1, y:current.y},  
                        {x:current.x, y:current.y + 1}]
        if($('input[name=diagonal]:checked').val() == "allowdiagonal"){
            candidate.push({x:current.x - 1, y:current.y - 1})
            candidate.push({x:current.x - 1, y:current.y + 1})
            candidate.push({x:current.x + 1, y:current.y - 1})  
            candidate.push({x:current.x + 1, y:current.y + 1})
        }

        var neighbors = [];
        for(let i = 0 ; i < candidate.length ; i ++){
            if(isInsideGrid(candidate[i].x, candidate[i].y) && !isWall(candidate[i].x, candidate[i].y)){
                neighbors.push(candidate[i]);
                if(!samePositionInList(candidate[i], considered)) considered.push({x : candidate[i].x, y : candidate[i].y})
            }
        }

        neighbors.forEach(successor => {
            var scDist = current.g + distance(successor, current);

            var samePositionO = samePositionInList(successor, openList);
            var samePositionC = samePositionInList(successor, closeList);

            if(samePositionO !== null){
                if(samePositionO.cell.g > scDist){
                    updateCell(successor.x, successor.y, current, scDist)
                    updateOpenList(samePositionO.index, gridDetail[successor.x][successor.y]);
                }
            } else if(samePositionC !== null){
                if(samePositionC.cell.g > scDist){
                    updateCell(successor.x, successor.y, current, scDist)
                    closeList.splice(samePositionC.index, 1);
                    insertIntoOpenList(gridDetail[successor.x][successor.y])
                }
            } else {
                updateCell(successor.x, successor.y, current, scDist)
                insertIntoOpenList(gridDetail[successor.x][successor.y]);
            }
        })
        closeList.push(current);
    }
    return null;
}

function search(){
    result = AStarAlgorithm();
}

// UI creation

var gwidth = 801;
var gheight = 801;
var cellWidth = 20;
var cellHeight = 20;
var allowToRun = false;
var createMaze = false;
var selectSD = true;

function setup(){
    mazeGenerating();
    pickedS = false;
    pickedD = false;
    var canvas = createCanvas(gwidth + cellWidth, gheight + cellHeight)
    canvas.parent('sketch-holder');
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
    var x = Math.floor(mouseX / cellWidth);
    var y = Math.floor(mouseY / cellHeight);
    if(selectSD){
        if(isInsideGrid(x, y) && !isWall(x, y)){    
            if(pickedS){
                if(pickedD){
                    pickedD = false;
                    considered = [];
                    result = [];
                    indexConsidered = 0;
                    doneConsidered = false;

                    source = {x, y};
                    fill(255, 0, 0);
                    rect(source.x * cellWidth, source.y * cellHeight, cellWidth, cellHeight)
                    pickedS = true;

                } else{
                    if(x == source.x && y == source.y){
                        alert("Diem xuat phat va diem dich trung nhau")
                    } else{
                        destination = {x: x, y: y};
                        fill(0, 255, 0);
                        rect(destination.x * cellWidth, destination.y * cellHeight, cellWidth, cellHeight)
                        pickedD = true;

                        search();
                        console.log(result.length + " - " + considered.length)
                        loop();
                    }
                } 
            } else{
                source = {x, y};
                fill(255, 0, 0);
                rect(source.x * cellWidth, source.y * cellHeight, cellWidth, cellHeight)
                pickedS = true;
            }
        }
    } else if(createMaze){
        grid[x][y] = 0;
        fill(0);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
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
    $("#mode").text("Customize the maze")
})

$("#selectSD").on("click", function(){
    createMaze = false;
    selectSD = true;
    console.log(333)
    $("#mode").text("Select source and destination")
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
