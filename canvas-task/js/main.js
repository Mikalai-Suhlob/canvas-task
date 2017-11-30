function Point(px, py) {
    this.x = px;
    this.y = py;
}

function Polygon(c, clr) {

    this.points = new Array();
    this.center = c;
    this.color = clr;
    
}

Polygon.prototype.addPoint = function(p) {
    this.points.push(p);
};


Polygon.prototype.addAbsolutePoint = function(p) {
    this.points.push( { "x": p.x - this.center.x, "y": p.y - this.center.y } );
};

Polygon.prototype.getNumberOfSides = function() {
    return this.points.length;
};


Polygon.prototype.draw = function(ctx) {

    ctx.save();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x + this.center.x, this.points[0].y + this.center.y);
    for (var i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x + this.center.x, this.points[i].y + this.center.y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    
};


Polygon.prototype.containsPoint = function(pnt) {
    
    var nvert = this.points.length;
    var testx = pnt.x;
    var testy = pnt.y;
    
    var vertx = new Array();
    for (var q = 0; q < this.points.length; q++) {
        vertx.push(this.points[q].x + this.center.x);
    }
    
    var verty = new Array();
    for (var w = 0; w < this.points.length; w++) {
        verty.push(this.points[w].y + this.center.y);
    }

    var i, j = 0;
    var c = false;
    for (i = 0, j = nvert - 1; i < nvert; j = i++) {
        if ( ((verty[i]>testy) !== (verty[j]>testy)) &&
                (testx < (vertx[j]-vertx[i]) * (testy-verty[i]) / (verty[j]-verty[i]) + vertx[i]) )
            c = !c;
    }
    return c;
    
};

Polygon.prototype.intersectsWith = function(other) {
    
    var axis = new Point();
    var tmp, minA, maxA, minB, maxB;
    var side, i;
    var smallest = null;
    var overlap = 99999999;

    for (side = 0; side < this.getNumberOfSides(); side++)
    {
        if (side === 0)
        {
            axis.x = this.points[this.getNumberOfSides() - 1].y - this.points[0].y;
            axis.y = this.points[0].x - this.points[this.getNumberOfSides() - 1].x;
        }
        else
        {
            axis.x = this.points[side - 1].y - this.points[side].y;
            axis.y = this.points[side].x - this.points[side - 1].x;
        }

        tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
        axis.x /= tmp;
        axis.y /= tmp;

        minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
        for (i = 1; i < this.getNumberOfSides(); i++)
        {
            tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
            if (tmp > maxA)
                maxA = tmp;
            else if (tmp < minA)
                minA = tmp;
        }

        tmp = this.center.x * axis.x + this.center.y * axis.y;
        minA += tmp;
        maxA += tmp;

        minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
        for (i = 1; i < other.getNumberOfSides(); i++)
        {
            tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
            if (tmp > maxB)
                maxB = tmp;
            else if (tmp < minB)
                minB = tmp;
        }
        tmp = other.center.x * axis.x + other.center.y * axis.y;
        minB += tmp;
        maxB += tmp;

        if (maxA < minB || minA > maxB) {
            return false;
        } else {
            var o = (maxA > maxB ? maxB - minA : maxA - minB);
            if (o < overlap) {
                overlap = o;
                smallest = {x: axis.x, y: axis.y};
            }
        }
    }

    for (side = 0; side < other.getNumberOfSides(); side++)
    {
        if (side === 0)
        {
            axis.x = other.points[other.getNumberOfSides() - 1].y - other.points[0].y;
            axis.y = other.points[0].x - other.points[other.getNumberOfSides() - 1].x;
        }
        else
        {
            axis.x = other.points[side - 1].y - other.points[side].y;
            axis.y = other.points[side].x - other.points[side - 1].x;
        }

        tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
        axis.x /= tmp;
        axis.y /= tmp;

        minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
        for (i = 1; i < this.getNumberOfSides(); i++)
        {
            tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
            if (tmp > maxA)
                maxA = tmp;
            else if (tmp < minA)
                minA = tmp;
        }

        tmp = this.center.x * axis.x + this.center.y * axis.y;
        minA += tmp;
        maxA += tmp;

        minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
        for (i = 1; i < other.getNumberOfSides(); i++)
        {
            tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
            if (tmp > maxB)
                maxB = tmp;
            else if (tmp < minB)
                minB = tmp;
        }

        tmp = other.center.x * axis.x + other.center.y * axis.y;
        minB += tmp;
        maxB += tmp;

        if (maxA < minB || minA > maxB) {
            return false;
        } else {
            var o = (maxA > maxB ? maxB - minA : maxA - minB);
            if (o < overlap) {
                overlap = o;
                smallest = {x: axis.x, y: axis.y};
            }
        }
    }

    return {"overlap": overlap + 0.001, "axis": smallest};
    
};




var dragInfo = null;
var container = document.getElementById("container");
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

var ctx = canvas.getContext("2d");

    
var triangle1 = new Polygon( {"x":50, "y":50 }, "#00FF00" );

triangle1.addPoint({"x":20, "y":20});
triangle1.addPoint({"x":500, "y":20});
triangle1.addPoint({"x":500, "y":200});
    
var triangle2 = new Polygon( {"x":100, "y":520 }, "#0000FF");
triangle2.addAbsolutePoint({"x":150, "y":570});
triangle2.addAbsolutePoint({"x":130, "y":170});
triangle2.addAbsolutePoint({"x":170, "y":170});
triangle2.addAbsolutePoint({"x":200, "y":250});
    
var objs = new Array();
objs.push(triangle1);
objs.push(triangle2);


function drawStuff() {

    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    if (triangle1.intersectsWith(triangle2)) {
        triangle1.color = "#FF0000";
        triangle2.color = "#FF0000";
    } else {
        triangle1.color = "#00FF00";
        triangle2.color = "#0000FF";
    }
    
    for (var i = 0; i < objs.length; i++) {
        objs[i].draw(ctx);
    }

}


function canvasDown(evt) {

    var tpos = findPos(evt.target);
    var p = new Point(evt.pageX - tpos[0], evt.pageY - tpos[1]);
    if (triangle1.containsPoint(p)) {
        dragInfo = { "obj" : triangle1, "x" : p.x, "y" : p.y };
    } else if (triangle2.containsPoint(p)) {
        dragInfo = { "obj" : triangle2, "x" : p.x, "y" : p.y };
    }

}

function canvasMove(evt) {
    if (dragInfo !== null) {
        var tpos = findPos(evt.target);
        var p = new Point(evt.pageX - tpos[0], evt.pageY - tpos[1]);
        var dx = p.x - dragInfo.x;
        var dy = p.y - dragInfo.y;
        dragInfo.obj.center.x += dx;
        dragInfo.obj.center.y += dy;
        dragInfo.x = p.x;
        dragInfo.y = p.y;
    }
}

function canvasUp(evt) {

    if (dragInfo !== null) {
    
        var tpos = findPos(evt.target);
        var p = new Point(evt.pageX - tpos[0], evt.pageY - tpos[1]);
        var dx = p.x - dragInfo.x;
        var dy = p.y - dragInfo.y;
        dragInfo.obj.center.x += dx;
        dragInfo.obj.center.y += dy;
        dragInfo = null;
    }
}

function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return [curleft,curtop];
}

window.setInterval(drawStuff, 30);