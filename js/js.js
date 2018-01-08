window.onload = function(){
    //获取我们所需要的元素
    //canvas
    var canvas = document.getElementById('cvs');
    var ctx = canvas.getContext('2d');
    //分数
    var s = document.getElementById('score');
    //游戏开始按钮
    var start = document.getElementById('Start');
    //暂停按钮
    var pause = document.getElementById('Pause');
    //继续按钮
    var ctn = document.getElementById('Continue');
    var mWidth = 300; //当前可视区域的宽，即canvas的宽
    var mHeight = 300;  //当前可视区域的高，即canvas的高
    var unit = 5; //设定每个格子的边长
    var mwid = mWidth / unit; //计算当前横向格子数量
    var mhei = mHeight / unit; //计算当前竖向格子数量
    var point = {x : 0 , y : 0}; //记录食物的坐标的变量初始化
    var score = 0; //记录成绩的变量初始化
    var timeLoop = 200; //初始化时间

    //注意本对象，并不改变其在画布上的样子，只是负责改变状态。
    //蛇对象
    var snake = {
        startX : 3, //开始头x坐标
        startY : 0, //开始头y坐标
        currOri : 'right', //初始化方向
        ori : [['left' , 'right'] , ['up' , 'down']], //相逆方向数组
        oriss : ['left' , 'right' , 'up' , 'down'], //所有允许的方向，用来判断方向合法性，在canChangeOri方法
        mes : [{x : 3 , y : 0} , {x : 2 , y : 0} , {x : 1 , y : 0}], //初始化蛇的身体坐标，初始长度3
        //坐标为格子坐标非像素坐标

        //添加一个格子的方法
        add : function(){
            //判断当前尾部方向
            var last = this.mes[this.mes.length - 1]; //获取最后一个格子
            var plast = this.mes[this.mes.length - 2]; //获取倒数第二个格子
            var px = last.x - plast.x;
            var py = last.y - plast.y; //根据计算最后两个格子的坐标差，来计算添加格子应在的方向
            //计算新加元素位置
            var newEle = {x : last.x + px , y : last.y + py}; //创建一个新格子
            this.mes.push(newEle); //将新格子假如格子数组
        },
        //移动方向方法，下面几个方法类似，只是方向不同
        moveup : function(){
            var pre = this.mes[0]; //记录第一个格子，即头部的坐标
            this.mes[0] = {x : pre.x , y : pre.y - 1}; //让头部的坐标像上移动一格
            this.move(pre); //调用移动身体的方法
        },
        movedown : function(){
            var pre = this.mes[0];
            this.mes[0] = {x : pre.x , y : pre.y + 1};
            this.move(pre);
        },
        moveleft : function(){
            var pre = this.mes[0];
            this.mes[0] = {x : pre.x - 1 , y : pre.y};
            this.move(pre);
        },
        moveright : function(){
            var pre = this.mes[0];
            this.mes[0] = {x : pre.x + 1 , y : pre.y};
            this.move(pre);
        },
        //移动身体
        move : function(pre){//参数为之前第一个格子，即头部的位置对象
            var tmp;
            for(var i = 1 ; i < this.mes.length ; i++){ //遍历每一个格子节点
                tmp = this.mes[i];
                this.mes[i] = pre;
                pre = tmp;
            } //并且把每个节点的左边变化成前一个节点的坐标，达到依次向前的目的
        },
        //改变方向
        changeOri : function(ori){
            if(this.oriss.indexOf(ori) == -1){ //判断方向是否在允许方向内
                return;
            }
            if(!this.canChangeOri(ori)){ //判断改变方向是否合法
                return;
            }
            this.currOri = ori; //如果上面两个都通过，改变方向
        },
        //判断改变的方向是否合法
        canChangeOri : function(ori){ //参数为方向字符串 例如：left
            if(ori == this.currOri){ //判断方向是否为当前方向，如果是则无需操作
                return false;
            }
            var oris = null;
            for(var i in this.ori){ //判断是否改变方向为当前方向的逆方向
                if(this.ori[i].indexOf(this.currOri) != -1){
                    oris = this.ori[i];
                    break;
                }
            }
            if(oris.indexOf(ori) != -1){
                return false;
            }
            return true;
        },
        //判断是否碰撞到了自己
        isCrashSelf : function(){
            var head = this.mes[0]; //获取头节点
            for(var i = 1 ; i < this.mes.length ; i++){ //遍历身体节点
                if(this.mes[i].x == head.x && this.mes[i].y == head.y){ //判断头结点是否碰撞身体
                    return true;
                }
            }
            return false;
        },
        //判断是否撞墙
        isCrashWell : function(width , height){ //参数为横竖的格子数量
            var head = this.mes[0]; //获取头节点
            if(head.x < 0 || head.y < 0){ //判断是否撞左上墙
                return true;
            }
            if(head.x > (width - 1) || head.y > (height - 1)){ //判断是否撞右下墙
                return true;
            }
            return false;
        },
        //处理吃东西
        handleAdd : function(){
            var head = this.mes[0]; //获取头节点
            if(head.x == point.x && head.y == point.y){ //判断头节点是否碰撞食物节点，食物在外定义
                this.add(); //调用添加格子
                pointObj.getPoint(); //生成一个节点
                pointObj.setPoint(); //画一个节点
                score++; //加分
                s.innerHTML = score; //显示分数
                gameSpeed();//加速
            }
        },
        //画蛇
        setSnake:function(){
            for(var i = 0 ; i < snake.mes.length ; i++){
                ctx.fillRect(snake.mes[i].x * unit , snake.mes[i].y * unit , unit ,unit);
            }
            ctx.stroke();
        },
        //清屏
        clear:function(){
            ctx.clearRect(0 , 0 , mWidth , mHeight);
        }
    };


    var pointObj = {
        //生成点
        getPoint:function (){
            point.x = Math.floor(Math.random(0 , mwid)*60);
            point.y = Math.floor(Math.random(0 , mhei)*60);
        },
        //画点
        setPoint:function (){
            ctx.fillRect(point.x * unit , point.y * unit , unit , unit);
        }
    };

    //蛇，动
    function snakeMove(){
        var method = 'move' + snake.currOri + '()'; //调用方向函数
        eval('snake.' + method); //执行方向方法
        snake.clear(); //清理屏幕
        ctx.beginPath(); //开始绘制
        snake.handleAdd(); //处理吃东西
        pointObj.setPoint(point); //设置点
        snake.setSnake(); //画蛇
        if(snake.isCrashWell(mwid , mhei)||snake.isCrashSelf()){ //是否撞墙，未使用是否吃自己。想用调用snake.isCrashSelf方法。
            clearInterval(window.looper);
            alert('游戏结束，您的得分是 ' + score);
        }
    }

    //开始游戏
    function startGame(){
        clearInterval(window.looper); //终止游戏主循环
        //初始化状态
        score = 0;
        s.innerHTML = score; //显示分数
        snake.mes = [{x : 3 , y : 0} , {x : 2 , y : 0} , {x : 1 , y : 0}];
        snake.currOri = 'right';
        ctx.beginPath();  //开始画笔
        pointObj.getPoint(); //设置点
        pointObj.setPoint();
        snake.setSnake(); //画蛇
        //画
        ctx.stroke();
        //游戏主循环
        window.looper = setInterval(snakeMove, timeLoop);
    }

    //暂停
    function pauseGame(){
        clearInterval(window.looper);
    }
    //继续
    function continueGame(){
        clearInterval(window.looper); //终止游戏主循环
        //游戏主循环
        window.looper = setInterval(snakeMove, timeLoop);

    }
    //加速
    function gameSpeed(){
        timeLoop = (timeLoop > 20)?(timeLoop - 2 ):20;
        clearInterval(window.looper); //终止游戏主循环
        //游戏主循环
        window.looper = setInterval(snakeMove, timeLoop);
    }

//开始游戏
    start.onclick = startGame;
//暂停
    pause.onclick = pauseGame;
//继续
    ctn.onclick = continueGame;

//键盘监听
    window.onkeyup = function(key){
        var ori = '';
        switch(key.keyCode){
            case 65:
                ori = 'left';
                break;
            case 68:
                ori = 'right';
                break;
            case 87:
                ori = 'up';
                break;
            case 83:
                ori = 'down';
                break;
        }
        if(ori == ''){
            return;
        }
        //改变蛇走向
        snake.changeOri(ori);
    }
}