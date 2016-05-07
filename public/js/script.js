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
       $(".passengerlist").after("<tr id='"+pass.data.id+"'><td>"+pass.data.p_a+"</td><td>"+pass.data.p_p+"</td><td><button ng-click='deletepassengerposition(location,driverid)' class='w3-btn w3-red'>remove</button></td></tr>");
      nowseats=  $("tr#"+pass.driverdata._id+"> td.currentseats").text();
     seats=Number(nowseats)+1;
     $("tr#"+pass.driverdata._id+"> td.currentseats").text(seats);
    });
});

