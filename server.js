var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8888);
var io = require('socket.io').listen(8080);
var mongoose = require('mongoose');    //引用mongoose模块
var db=mongoose.createConnection('localhost','game');
var users = db.model('User', { name: String,win:Number});
    var players ={},
        turn=0,
        name,
        borw,
        sockets={},
        unturn={},
        blackname,
        whitename,
        blackwin,
        whitewin;


io.sockets.on('connection', function(socket) {
	console.log('new game');
    if(turn==0)
    	{ turn=1;
    	  borw="black";
    	}
    else
    	{
    		turn=0;
    		borw="white";
    	}
    // unturn[0]=1;
    // unturn[1]=0;
	var names = borw;

    socket.emit('hello', {turn: turn, name: names});
	 players[turn] = {turn:turn,name: names};
     sockets[turn]=socket;
	socket.on('message',function(data)
	{
		console.log(data.data);
	});
    socket.on('white',function(data)
    {
        console.log("myturnw "+data.myturn);
        sockets[data.myturn==1?0:1].emit('white1',{x:data.x,y:data.y});
    });
    socket.on('black',function(data)
    {
                // console.log("unturn "+unturn);
        console.log("myturnb "+data.myturn);
        sockets[data.myturn==1?0:1].emit('black1',{x:data.x,y:data.y});
    });
    socket.on('login',function(data)
    {
        console.log(data.account);
        if(data.myturn==0)
            blackname=data.account;
        else
            whitename=data.account;
        var newnew=new users({name:data.account,win:'0'});
        newnew.save(function(err)
        {
            if(err)
                console.log(err);
            else
                console.log("success");
        });
        sockets[data.myturn==1?0:1].emit('rename',{rename:data.account,turn:data.myturn});
    });
    socket.on('whitewin',function(data){
         users.update({name:whitename},{'$inc':{win:1}},function(err){});
    });
    socket.on('blackwin',function(data){
         users.update({name:blackname},{'$inc':{win:1}},function(err){});
    });
    socket.on('init',function(data)
    {
      sockets[data.myturn==1?0:1].emit('initt',{});
       //  users.find({'name':whitename},function(error,resultw){});
       // users.find({'name':blackname},function(error,resultb){});
       // sockets[0].emit('rank',{wwin:resultw.win,bwin:resultb.win});
       // sockets[1].emit('rank',{wwin:resultw.win,bwin:resultb.win});
    });
    socket.on('rank',function(data)
    {
        console.log(whitename);
               users.find({'name':whitename},function(error,resultw){
                if(error)
                                console.log(error);
                            else
                                {
                                // console.log(resultw);
                                // console.log(resultw[0].win);
                                whitewin=resultw[0].win;
                                // console.log(whitewin);
               sockets[0].emit('rerankw',{wwin:whitewin});
               sockets[1].emit('rerankw',{wwin:whitewin});
               }});
               users.find({'name':blackname},function(error,resultb){
                if(error)
                     console.log(error);
                 else
                 {
                        blackwin=resultb[0].win;
               sockets[0].emit('rerankb',{bwin:blackwin});
               sockets[1].emit('rerankb',{bwin:blackwin});
                 }
               });
               console.log(whitewin);


    })
});