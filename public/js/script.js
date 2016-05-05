$(document).ready(function (e) {
    var socket = io.connect();
    
    var nowseats, seats=0;
    
        socket.on("delete:passenger", function (data) {
          $("tr#"+data.pass_id).remove(); 
          console.log("message received"+data.pass_id); 
            nowseats=  $("tr#"+data.driverdata._id+">td.currentseats").text();
             seats=Number(nowseats)-1;
             $("tr#"+data.driverdata._id+"> td.currentseats").text(seats);
            
    });
    
    socket.on("addpassenger",function(pass){
       $(".passengerlist").after("<tr id='"+pass.data.id+"'><td>"+pass.data.p_a+"</td><td>"+pass.data.p_p+"</td><td><a href='' ng-click='deletepassengerposition(location,driverid)' ><span class='glyphicon glyphicon-ok'  aria-hidden='true'></span></a></td>");
      nowseats=  $("tr#"+pass.driverdata._id+"> td.currentseats").text();
     seats=Number(nowseats)+1;
     $("tr#"+pass.driverdata._id+"> td.currentseats").text(seats);
    });
});

