function checkUserWithEmail(){
  var dbRef=firebase.database().ref('users/');

  dbRef.on('value',(snapshot)=>{
    var data=snapshot;
    var count=0
    var ncount=0
    data.forEach(user=>{
      if (user.val().email){
        count+=1
      }
      else{
        console.log(user.key)
        ncount+=1
      }
    })
    console.log(count,ncount)
  })
}

function formatTimestamp(timestamp) {
  const dateObj = new Date(timestamp);
  const date = dateObj.toLocaleDateString();
  const time = dateObj.toLocaleTimeString();
    return `Date: ${date}, Time: ${time}`;
}

function getDateOnly(timestamp) {
  const dateObj = new Date(timestamp);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const year = String(dateObj.getFullYear()).slice(-2); // Extract the last two digits of the year
  const date = `${day}/${month}/${year}`;

  return date;
}

function getTimeOnly(timestamp) {
  const dateObj = new Date(timestamp);
  const hour = String(dateObj.getHours()).padStart(2, '0');
  const time = `${hour}`;
  return time;
}


function getCurrentDateTime() {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString();
  const timeString = currentDate.toLocaleTimeString();
  return `${dateString} ${timeString}`;
}


function toggleRedeemAmount(postRef,amount) {
  postRef.transaction((post) => {
    if (post) {
      post['redeem_amount']+=parseInt(amount);
    }
    return post;
  });
}


function writeUserReturnBidForAffiliateAndEarnings(receiver_uid,bid_id,bid_amount,paymentNumber,user_uid) {
  var timestamp = Date.now();
  firebase
    .database()
    .ref("user_return_bid/" + receiver_uid + "/" + bid_id)
    .update({
      bid_amount: bid_amount,
      payment_from: paymentNumber,
      date_and_time: getCurrentDateTime(),
      verified_by_admin: "pending",
      verified_by_you:"pending",
      sender_uid:user_uid,
      screenshot_of_transaction:'',
      timestamp:timestamp
    }).then(()=>{
      var userRef=firebase.database().ref('user_affiliate_and_earnings/'+receiver_uid);
      toggleRedeemAmount(userRef,bid_amount)
    })
}

function writeUserReturnBid(receiver_uid,bid_id,bid_amount,paymentNumber,user_uid) {
  var timestamp = Date.now();
  firebase
    .database()
    .ref("user_return_bid/" + receiver_uid + "/" + bid_id)
    .update({
      bid_amount: bid_amount,
      payment_from: paymentNumber,
      date_and_time: getCurrentDateTime(),
      verified_by_admin: "pending",
      verified_by_you:"pending",
      sender_uid:user_uid,
      screenshot_of_transaction:'',
      timestamp:timestamp
    })
}

function writeUserInvestedBid(user_uid, bid_amount, payment_to,receiver_uid) {
  var timestamp = Date.now();
  return firebase.database().ref("user_invested_bid/" + user_uid).push({
      bid_amount: bid_amount,
      payment_to: payment_to,
      date_and_time: getCurrentDateTime(),
      verified_by_admin: "pending",
      verified_by_receiver:"pending",
      screenshot_of_transaction:'',
      receiver_uid: receiver_uid,
      timestamp: timestamp
    }).key
}



function fetchUserAffiliateAndEarningsAndUpdateRedeemAmount(amount_senders_numbers){
  var dbRef=firebase.database().ref('user_affiliate_and_earnings');
  dbRef.once('value',(snapshot)=>{
    var allUsers=snapshot;
    var index=0
    var bid_flag=true
    var amount=0
    allUsers.forEach(user=>{
      if(user.val().total_earnings>0){
        var userRef=firebase.database().ref('user_investments_and_returns/'+user.key)
        userRef.once('value',(snapshot)=>{
          if(bid_flag && user.val().total_earnings<snapshot.val().total_invested){

            var userRef=firebase.database().ref('users/'+user.key);
            userRef.once('value',(snapshot_inner)=>{
           var paymentNumber=snapshot_inner.val().mobileNumber;
           if (snapshot_inner.val().paymentNumber){
             paymentNumber=snapshot_inner.val().paymentNumber;
           }
           console.log(user.val().total_earnings,user.val().redeem_amount,paymentNumber,user.key,amount_senders_numbers[index])
            // var bid_id=writeUserInvestedBid('VqTtIwVTJfhTfAduWnpOBkM3UFh1',user.val().total_earnings,paymentNumber,user.key)
            // writeUserReturnBidForAffiliateAndEarnings(user.key,bid_id,user.val().total_earnings,amount_senders_numbers[index],'VqTtIwVTJfhTfAduWnpOBkM3UFh1')
             index+=1;
             bid_flag=false;
            })
          }
        })
        amount+=user.val().total_earnings
      }
    })
    console.log(amount)
  })
}

// fetchUserAffiliateAndEarningsAndUpdateRedeemAmount(['7428637955','7428637955','9897768198','7428637955','7428637955','9897768198','9897768198',
// '7428637955','7428637955','7428637955','7428637955','7428637955','9897768198','9897768198'])



function getBidsDataByDateAndWriteInvestReturnBids(date_input,amount_senders_numbers){
  var userInvestedBidsRef=firebase.database().ref('user_invested_bid/');
  userInvestedBidsRef.once('value',(snapshot)=>{
    var allUsers=snapshot
    var index=0
    allUsers.forEach(user=>{
      var bids=user;
      var flag=true
      bids.forEach(bid=>{
        if (flag && getDateOnly(bid.val().timestamp)==date_input && getTimeOnly(bid.val().timestamp)>12){

           var userRef=firebase.database().ref('users/'+user.key);
           userRef.once('value',(snapshot)=>{
          var paymentNumber=snapshot.val().mobileNumber;
          if (snapshot.val().paymentNumber){
            paymentNumber=snapshot.val().paymentNumber;
          }
          // console.log(bid.val())
          var bid_id=writeUserInvestedBid('VqTtIwVTJfhTfAduWnpOBkM3UFh1',bid.val().bid_amount * 1.3,paymentNumber,user.key)
          writeUserReturnBid(user.key,bid_id,bid.val().bid_amount * 1.3,'7048924616','VqTtIwVTJfhTfAduWnpOBkM3UFh1')
           flag=false;
           index++;
           })
        }
      })
    })
  })
}

// getBidsDataByDateAndWriteInvestReturnBids('12/06/23',['7428637955','7428637955','7428637955','7428637955','7428637955','9897768198','9897768198'])



function manualPairing(){
  var dbRef=firebase.database().ref('originnal_copy_sender_amount/')
  dbRef.once('value',(snapshot)=>{
    var all_senders=snapshot;
    var amount=0
    all_senders.forEach(sender=>{
      console.log(sender.key,sender.val())
      amount+=sender.val().amount
      var bid_id=writeUserInvestedBid(sender.val().uid,sender.val().amount,9758722256,'7mAxChCPIqQXpOqlD3KQSPg7SqI2')
     writeUserReturnBid('7mAxChCPIqQXpOqlD3KQSPg7SqI2',bid_id,sender.val().amount,sender.key,sender.val().uid)
    })
    console.log(amount)
  })
  }


// manualPairing()



// var bid_id=writeUserInvestedBid('VqTtIwVTJfhTfAduWnpOBkM3UFh1',750,9719165550,'Ec6OBUYEwtZAwi9iX0PgYBcfCp32')
// writeUserReturnBid('Ec6OBUYEwtZAwi9iX0PgYBcfCp32',bid_id,750,7048924616,'VqTtIwVTJfhTfAduWnpOBkM3UFh1')

// var bid_id=writeUserInvestedBid('VqTtIwVTJfhTfAduWnpOBkM3UFh1',750,6397600325,'k7Mu67qvPQbcyfvwDrRIPMitWEK2')
// writeUserReturnBid('k7Mu67qvPQbcyfvwDrRIPMitWEK2',bid_id,750,7048924616,'VqTtIwVTJfhTfAduWnpOBkM3UFh1')

// var bid_id=writeUserInvestedBid('VqTtIwVTJfhTfAduWnpOBkM3UFh1',750,6398266485,'uskU1Gb9iJaxbUL2upTXhnsOwi32')
// writeUserReturnBid('uskU1Gb9iJaxbUL2upTXhnsOwi32',bid_id,750,7048924616,'VqTtIwVTJfhTfAduWnpOBkM3UFh1')




// var bid_id=writeUserInvestedBid('VqTtIwVTJfhTfAduWnpOBkM3UFh1',2500,9997015883,'I07HEU1MdlQo6XkD1OObjvBkCaE2')
// writeUserReturnBid('I07HEU1MdlQo6XkD1OObjvBkCaE2',bid_id,2500,7668058046,'VqTtIwVTJfhTfAduWnpOBkM3UFh1')



function getInvestedBidsDataByDate(date_input){
  var userInvestedBidsRef=firebase.database().ref('user_invested_bid/');
  userInvestedBidsRef.on('value',(snapshot)=>{
    var allUsers=snapshot
    var index=0
    console.log("Invested Bids")
    allUsers.forEach(user=>{
      var bids=user;
      var count=0
      bids.forEach(bid=>{
        if (getDateOnly(bid.val().timestamp)==date_input && getTimeOnly(bid.val().timestamp)<12){
           count+=1
          console.log("current Index",index)
          // console.log(bid.val())
           index+=1
          console.log(bid.key,formatTimestamp(bid.val().timestamp),bid.val().bid_amount,bid.val().payment_to,user.key,count,bid.val().verified_by_receiver)
          var userRef=firebase.database().ref('users/'+user.key)
          userRef.once('value',(user_data)=>{
            var mobile_number = user_data.val().mobileNumber
            var paymentNumber=user_data.val().mobileNumber
            if(user_data.val().paymentNumber){
              paymentNumber=user_data.val().paymentNumber
            }

            // firebase.database().ref('user_invested_bid/'+user.key+'/'+bid.key).update('payment_to':'')


          //  firebase.database().ref('user_invested_bid/'+user.key+'/'+bid.key).remove()


        

          // if (bid.val().verified_by_receiver=='pending'){
          //  firebase.database().ref('user_invested_bid/'+user.key+'/'+bid.key).remove()
          // }



          // var receivers_data={
          //   'uid':user.key,
          //   'amount':bid.val().bid_amount*1.3,
          //   'payment_number':paymentNumber

          // }

          // if( bid.val().verified_by_admin=='received'){
          // firebase.database().ref('amount_receivers/'+mobile_number).update(receivers_data)
          // }


          })
          
          if(count>1){
            console.log("delete this bid")
            // firebase.database().ref('user_invested_bid/'+user.key+'/'+bid.key).remove()
          }
        }
      })
    })
  })
}


// getInvestedBidsDataByDate('17/06/23')



function getReturnBidsDataByDate(date_input){
var userInvestedBidsRef=firebase.database().ref('user_return_bid/');
userInvestedBidsRef.on('value',(snapshot)=>{
  var allUsers=snapshot
  var index=0
  console.log("\n Return Bids")
  allUsers.forEach(user=>{
    var bids=user;
    var count=0
    bids.forEach(bid=>{
      if (getDateOnly(bid.val().timestamp)==date_input && getTimeOnly(bid.val().timestamp)<12){
         count+=1

        // if(bid.val().verified_by_you=='pending'){
        //   firebase.database().ref('user_return_bid/'+user.key+'/'+bid.key).remove()
        // }



        //  firebase.database().ref('user_return_bid/'+user.key+'/'+bid.key).remove()

        // if (user.key!=='VqTtIwVTJfhTfAduWnpOBkM3UFh1'){
        //      firebase.database().ref('user_return_bid/'+user.key+'/'+bid.key).update({'payment_from':'8077515425'})
        // }

        



        // console.log("current Index",index)
         index+=1
        console.log(bid.key,formatTimestamp(bid.val().timestamp),bid.val().bid_amount,bid.val().payment_from,user.key,count,bid.val().verified_by_you)
        if(count>1){
          console.log("delete this bid")
          // firebase.database().ref('user_return_bid/'+user.key+'/'+bid.key).remove()
        }
      }
    })
  })
})
}
// getReturnBidsDataByDate('17/06/23')










function updatePaymentToSpecific(date_input){
  var userInvestedBidsRef=firebase.database().ref('user_invested_bid/');
  userInvestedBidsRef.once('value',(snapshot)=>{
    var allUsers=snapshot
    var index=0
    allUsers.forEach(user=>{
      var bids=user;
      var flag=true
      bids.forEach(bid=>{
        if (flag && getDateOnly(bid.val().timestamp)==date_input && getTimeOnly(bid.val().timestamp)<12 && (user.key=='tKwYv1l0b6Y71s9CkA2UNElLiZ03' || user.key=='VJVTTIzWdCWc8T7HZ4ZIQyx0l2t2')){
          //  firebase.database().ref('user_invested_bid/'+user.key+'/'+bid.key).update({'payment_to':'8769439007'})
          console.log(bid.val())
        }
      })
    })
  })
}

// updatePaymentToSpecific('14/06/23')


// tKwYv1l0b6Y71s9CkA2UNElLiZ03    :deepak    9870760615 (sachin)   8769439007 (aditya)
// VJVTTIzWdCWc8T7HZ4ZIQyx0l2t2    :kuldeep
// 8171849905

function updateUserReturnsBidsByAdmin(){
var userReturnBidRef=firebase.database().ref('user_return_bid');
userReturnBidRef.on('value',(snapshot)=>{
  var allUsers=snapshot;
  allUsers.forEach(user=>{
    var bids=user;
    var count=0;
    var admin_count=0
    bids.forEach(bid=>{
       count++;
       if (bid.val().verified_by_admin=='pending'){
          admin_count+=1
       }
       if (bid.val().verified_by_you=='received' && bid.val().verified_by_admin=='pending'){
        console.log(bid.val())
       firebase.database().ref('user_return_bid/'+user.key+'/'+bid.key).update({'verified_by_admin':'received'})

       }
    })
  })
})
}
// updateUserReturnsBidsByAdmin()


function updateUserInvestedBidsByAdmin(){
var userInvestedBidsRef=firebase.database().ref('user_invested_bid');
userInvestedBidsRef.once('value',(snapshot)=>{
  var allusers=snapshot
  allusers.forEach(user=>{
    var bids=user;
    bids.forEach(bid=>{
      if(bid.val().verified_by_receiver=='received' && bid.val().verified_by_admin=='pending'){
        firebase.database().ref('user_invested_bid/'+user.key+'/'+bid.key).update({'verified_by_admin':'received'})
        console.log(bid.val())
      }
    })
  })
})
}

// updateUserInvestedBidsByAdmin()


function makeAdminVerifiedBidsCompleted(date_input){
  var dbRef=firebase.database().ref('user_invested_bid');
  dbRef.once('value',(snapshot)=>{
    var allUsers=snapshot;
    allUsers.forEach(user=>{
      var all_bids=user;
      all_bids.forEach(bid=>{
        if (getDateOnly(bid.val().timestamp)<=date_input && bid.val().verified_by_admin=='received'){
          console.log(bid.val())
          // firebase.database().ref('user_invested_bid/'+user.key+'/'+bid.key).update({'verified_by_admin':'completed'})
        }
      })
    })
  })
  }
  
// makeAdminVerifiedBidsCompleted('10/06/23')



function fetchLiveUsers(){
var liveRef=firebase.database().ref('users_online');
liveRef.on('value',(snapshot)=>{
  var data=snapshot;
  var count=0
  data.forEach(user=>{
    if(user.val()){
      count+=1
      console.log(user.key,count)
    }
  })
  console.log("Active Users",count)
})
}

// fetchLiveUsers()


function fetchUsersAffiliate(){
var dbRef=firebase.database().ref('user_affiliate_and_earnings');
dbRef.on('value',(snapshot)=>{
  var allusers=snapshot;
  allusers.forEach(user=>{
    console.log(user.val())
  })
})
}

// fetchUsersAffiliate()



function checkCrossForBids(){
var ref=firebase.database().ref('user_invested_bid');
ref.once('value',(snapshot)=>{
  var allusers=snapshot
  allusers.forEach(user=>{
   var all_bids=user
    all_bids.forEach(bid=>{
      var return_bid_ref=firebase.database().ref('user_return_bid/'+user.key)
      return_bid_ref.once('value',(data)=>{
        var all_return_bids=data.val()  
        if (all_return_bids && all_return_bids.hasOwnProperty(bid)) {
          console.log("Key exists!");
        } else {
          console.log("Key does not exist!");
        }
      })
    })
  })
})
}
// checkCrossForBids()



