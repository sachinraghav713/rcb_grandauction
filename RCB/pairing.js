function formatted_date() {
  // Create a new Date object
  const currentDate = new Date();

  // Get the day, month, and year components
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Note: Months are zero-based
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}

function checkTime() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour < 12 && currentHour >= 0) {
    return "first_shift"; // Return first value if current time is between midnight and 12 noon
  } else {
    return "second_shift"; // Return second value for any other time
  }
}

function getCurrentDateTime() {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString();
  const timeString = currentDate.toLocaleTimeString();
  return `${dateString} ${timeString}`;
}

function writeUserInvestedBidAutoPairing(
  userId,
  bid_amount,
  payment_to,
  receiver_uid
) {
  var timestamp = Date.now();
  return firebase
    .database()
    .ref("user_invested_bid/" + userId)
    .push({
      bid_amount: bid_amount,
      payment_to: payment_to,
      date_and_time: getCurrentDateTime(),
      verified_by_admin: "pending",
      verified_by_receiver: "pending",
      screenshot_of_transaction: "",
      receiver_uid: receiver_uid,
      timestamp: timestamp,
    }).key;
}

function toggleReceiverAmount(postRef, amount) {
  postRef.transaction((post) => {
    if (post) {
      post["amount"] -= parseInt(amount);
    }
    return post;
  });
}

function toggleSenderAmount(postRef, amount) {
  postRef.transaction((post) => {
    if (post) {
      post["amount"] -= parseInt(amount);
    }
    return post;
  });
}

function writeUserReturnBidAutoPairing(
  receiver_uid,
  bid_id,
  bid_amount,
  paymentFrom,
  user_uid,
  dbReceiverRef,
  dbSenderRef
) {
  var timestamp = Date.now();
  firebase
    .database()
    .ref("user_return_bid/" + receiver_uid + "/" + bid_id)
    .update({
      bid_amount: bid_amount,
      payment_from: paymentFrom,
      date_and_time: getCurrentDateTime(),
      verified_by_admin: "pending",
      verified_by_you: "pending",
      sender_uid: user_uid,
      screenshot_of_transaction: "",
      timestamp: timestamp,
    })
    .then(() => {
      toggleReceiverAmount(dbReceiverRef,bid_amount);
      toggleSenderAmount(dbSenderRef,bid_amount);
    });
}



function autoPairingUpdated(){
  // var date = formatted_date();
  // var shift = checkTime()


  var date ='17-06-2023';
  var shift='first_shift';

  var sendersRef = firebase.database().ref("amount_senders/" + date + "/" + shift).orderByChild("amount").limitToLast(1);
  var receiverRef=firebase.database().ref('amount_receivers/').orderByChild("amount").limitToLast(1);

  sendersRef.once('value',(sender_snapshot)=>{

    receiverRef.once('value',(receiver_snapshot)=>{

     var all_senders=sender_snapshot;
     var all_receivers=receiver_snapshot;
     all_senders.forEach(sender=>{
      all_receivers.forEach(receiver=>{
        var sender_user_ref=firebase.database().ref('users/'+sender.val().uid);
        sender_user_ref.once('value',(user_sender)=>{
          
          var sender_payment_number=user_sender.val().mobileNumber;
          if (user_sender.val().paymentNumber){
            sender_payment_number=user_sender.val().paymentNumber;
          }

        var dbReceiverRef = firebase.database().ref("amount_receivers/" + receiver.key);
        var dbSenderRef = firebase.database().ref("amount_senders/" + date + "/" + shift + "/" + sender.key);

        if(sender.val().amount > 0 && receiver.val().amount > 0){
          console.log("sender_number",sender.key)
          console.log("receiver_number",receiver.key)
          console.log(sender.val().amount,receiver.val().amount)
          console.log("135 \n")

          var bid_amount=0;
          if(sender.val().amount>receiver.val().amount){
            bid_amount=receiver.val().amount
          }
          else{
            bid_amount=sender.val().amount
          }
         

          if((sender.val().amount-bid_amount>=0) && (receiver.val().amount-bid_amount>=0)){

            var invested_bid_id=writeUserInvestedBidAutoPairing(sender.val().uid,bid_amount,receiver.val().payment_number,receiver.val().uid)
            writeUserReturnBidAutoPairing(receiver.val().uid,invested_bid_id,bid_amount,sender_payment_number,sender.val().uid,dbReceiverRef,dbSenderRef)
          }
          
 
          // var pairing_flag=firebase.database().ref("auto_pairing/"+shift)
          // toggleAutoPairing(pairing_flag)
          
        }
        else{
          // var data={}
          // firebase.database().ref("auto_pairing/"+shift).update({'count':0})
          console.log("maximum pairing done");
        }
        })
      })
     })

    })
  }) 
}




// setInterval(autoPairingUpdated, 2000);

// fetchAllAmountReceivers()
// fetchAllAmountSenders()





function fetchAllAmountReceivers() {
  var dbRef = firebase
    .database()
    .ref("amount_receivers")
    .orderByChild("amount");

  dbRef.once("value", (snapshot) => {
    var all_receivers = snapshot;
    console.log("All Amount Receivers");
    var all_receivers_amount = 0;
    var count = 0;
    all_receivers.forEach((receiver) => {
      console.log(receiver.key, receiver.val());
      all_receivers_amount += receiver.val().amount;
      count += 1;
    });
    console.log("All Receivers Amount", count, all_receivers_amount);
    console.log("\n");
  });
}


function fetchAllAmountSenders() {
  var date ='17-06-2023';
  var shift='first_shift';
  
  var dbRef = firebase
    .database()
    .ref("amount_senders/" + date + "/" + shift)
    .orderByChild("amount");
  dbRef.once("value", (snapshot) => {
    var all_senders = snapshot;
    console.log("All Amount Senders");
    var all_senders_amount = 0;
    var count = 0;
    all_senders.forEach((sender) => {
      console.log(sender.key, sender.val());
      all_senders_amount += parseInt(sender.val().amount);
      count += 1;
    });
    console.log("All Sender Amount", count, all_senders_amount);
    console.log("\n");
  });
}




// function toggleAutoPairing(postRef) {
//   postRef.transaction((post) => {
//     if (post) {
//       post["count"]+=1;
//     }
//     else{
//       var data={}
//       data['count']=1
//       post.update(data)
//     }
//     return post;
//   });
// }



// function autoPairingComplete(){
//   var shift='first_shift'

//   var pairingdb=firebase.database().ref("auto_pairing/"+shift);


//  pairingdb.on('child_added',snapshot=>{
  
//   if (snapshot.val()>0){
//     console.log(snapshot.val())
//     console.log("hello_2")
//     autoPairingUpdated()
//   }
   
//   })

//   pairingdb.on('child_changed',snapshot=>{
//     console.log(snapshot.val())
//     if (snapshot.val()>0){
//       console.log("hello_2")
//       autoPairingUpdated()
//     }
//   })


  // pairingdb.on('value',(snapshot)=>{
  //   console.log("hello",snapshot.val().count)

  //   if(snapshot.val().count>0){
  //     console.log("hello_2")
  //     autoPairingUpdated()
  //   }
  // })
// }



// autoPairingComplete()