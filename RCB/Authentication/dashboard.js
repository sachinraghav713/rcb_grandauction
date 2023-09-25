import {upload_bid_transaction_photo} from './storage.js'

function getCurrentDateTime() {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString();
  const timeString = currentDate.toLocaleTimeString();
  return `${dateString} ${timeString}`;
}


// user invested bid functions

export function writeUserInvestedBid(userId, bid_amount, payment_to,receiver_uid) {
  var timestamp = Date.now();
  return firebase.database().ref("user_invested_bid/" + userId).push({
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

export function updateUserInvestedBidStatusByReceiver(userId, bid_id) {
  firebase
    .database()
    .ref("user_invested_bid/" + userId)
    .child(bid_id)
    .update({
      verified_by_receiver: "received",
    });
}

export function updateUserInvestedBidStatusByAdmin(userId, bid_id) {
  firebase
    .database()
    .ref("user_invested_bid/" + userId)
    .child(bid_id)
    .update({
      verified_by_admin: "received",
    });
}

export function updateUserInvestedBidScreenshotOfTransaction(
  userId,
  bid_id,
  imageUrl
) {
  firebase
    .database()
    .ref("user_invested_bid/" + userId)
    .child(bid_id)
    .update({
      screenshot_of_transaction: imageUrl,
    });
}

// user return bid functionality

function toggleCount(postRef) {
  postRef.transaction((post) => {
    if (post) {
      if (post.count) {
        post.count--;
      }
    }
    return post;
  });
}

function toggleAmount(postRef,amount) {
  postRef.transaction((post) => {
    if (post) {
      if (post.amount) {
        post.amount-=amount;
      }
    }
    return post;
  });
}

function toggleAmountSenders(postRef,mobileNumber){
  var data={};
  data[mobileNumber]=true;
  return postRef.update(data);
}



export function writeUserReturnBid(
  receiver_uid,
  bid_id,
  bid_amount,
  payment_from,
  paymentNumber,
  payment_to,
  date,
  shift,
  user_uid
) {
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
      document.getElementById('user-auction-amount').reset()
      var dbRef=firebase.database().ref('amount_receivers/'+date+'/'+shift+'/'+payment_to);
      var amountRef=firebase.database().ref('auction_amount/'+date+'/'+shift)
      var userBidParticipationCheckRef=firebase.database().ref('amount_senders/'+date+'/'+shift)


      toggleCount(dbRef);
      toggleAmount(amountRef,bid_amount)
      toggleAmountSenders(userBidParticipationCheckRef,payment_from)
      firebase.database().ref("users/" + user_uid).update({ user_state: "dashboard" });   
    });
}





export function updateUserReturnBidStatusByYou(receiver_uid, bid_id) {
  firebase
    .database()
    .ref("user_return_bid/" + receiver_uid + "/" + bid_id)
    .update({
      verified_by_you: "received",
    });
}

export function updateUserReturnBidStatusByAdmin(receiver_uid, bid_id) {
  firebase
    .database()
    .ref("user_return_bid/" + receiver_uid + "/" + bid_id)
    .update({
      verified_by_admin: "received",
    });
}

export function updateUserReturnBidScreenshotOfTransaction(
  receiver_uid,
  bid_id,
  imageUrl
) {
  firebase
    .database()
    .ref("user_return_bid/" + receiver_uid + "/" + bid_id)
    .update({
      screenshot_of_transaction: imageUrl,
    });
}

function addDaysToTimestamp(timestamp, daysToAdd) {
  // Convert timestamp to Date object
  var date = new Date(timestamp);

  // Add the specified number of days to the date
  date.setDate(date.getDate() + daysToAdd);
  
  // Return the updated date
  return date.toLocaleDateString("en-IN");;
}


export function fetchUserInvestedBidsPending(user_id,element){
  // var user_id='uskU1Gb9iJaxbUL2upTXhnsOwi32'
  var Ref= firebase.database().ref("user_invested_bid/" + user_id)
 Ref.on('value',(snapshot)=>{
  var data_all=snapshot
  var html='';
  data_all.forEach(data=>{
   if (data.val().verified_by_admin==='pending'){
      document.getElementById('cut-down-timer-bids').style.display='block';
      createCountdownTimer(data.val().timestamp,'cut-down-timer-bids')
      html+=investedBidPendingTemplate(data.key,data.val().bid_amount,formatDateWithTime(data.val().timestamp),data.val().payment_to,data.val().verified_by_receiver,data.val().verified_by_admin,data.val().screenshot_of_transaction,data.val().receiver_uid)
        }
    let ref=firebase.database().ref('users/'+user_id)
    ref.once('value',(snapshot)=>{
      if (data.val().verified_by_admin=='received'){
        document.getElementById('cut-down-timer-bids').style.display='none';
      html+=investedBidCompletedRevokePendingTemplate(data.key,data.val().bid_amount* 1.3,snapshot.val().userId,addDaysToTimestamp(data.val().timestamp,4))
      }
    }).then(()=>{
      var all_files_upload=document.querySelectorAll('.file_upload_class');
      all_files_upload.forEach(upload=>{
        upload.addEventListener("change",function(event){
          event.preventDefault(); // Prevent default form submission        
          // Call the function to handle file upload
          console.log("File upload")
          let bid_id=event.target.getAttribute('bid_id')
          let receiver_uid=event.target.getAttribute('receiver_uid')
          handleFileUpload(user_id,bid_id,receiver_uid);
        })
      })

    })
  })
  document.getElementById(element).innerHTML=html;
 })
}


function createCountdownTimer(timestamp, element) {
  element = document.getElementById(element);

  // Calculate the target time by adding 2 hours to the timestamp
  const targetTime = timestamp + (2 * 60 * 60 * 1000);

  // Update the countdown every second
  const countdownInterval = setInterval(updateCountdown, 1000);

  function updateCountdown() {
    // Get the current time
    const currentTime = new Date().getTime();

    // Calculate the remaining time in milliseconds
    const remainingTime = targetTime - currentTime;

    // Check if the target time has passed
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      element.textContent = "Time expired";
      return;
  }

    // Calculate the remaining hours, minutes, and seconds
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    // Update the HTML element with the countdown
    element.textContent = `Time Remaining: ${hours}h ${minutes}m ${seconds}s`;
  }

  // Call the updateCountdown function immediately to show the initial countdown
  updateCountdown();
}


function formatDateWithTime(timestamp) {
  var date = new Date(timestamp);

  var day = date.getDate();
  var month = date.getMonth() + 1; // Adding 1 because months are zero-based
  var year = date.getFullYear() % 100; // Getting the last two digits of the year

  // Adding leading zeros if necessary
  if (day < 10) {
    day = '0' + day;
  }

  if (month < 10) {
    month = '0' + month;
  }

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();

  // Adding leading zeros if necessary
  if (hours < 10) {
    hours = '0' + hours;
  }

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  var formattedDate = day + '/' + month + '/' + year;
  var formattedTime = hours + ':' + minutes + ':' + seconds;

  var formattedDateTime = formattedDate + ' ' + formattedTime;

  return formattedDateTime;
}







function handleFileUpload(user_uid,bid_id,receiver_uid) {
  // Get the file input element
  var fileInput = document.getElementById(bid_id+"-bid_screenshot_file");
  // Get the selected file
  var file = fileInput.files[0];
  upload_bid_transaction_photo(user_uid,bid_id,file,receiver_uid)
}


function formatString(inputStr) {
  const prefix = inputStr.slice(0, 3); // get first three characters as prefix
  const firstPart = inputStr.slice(3, 7); // get next four characters as first part
  const lastPart = inputStr.slice(7); // get the remaining characters as last part
  const formattedStr = `${prefix} ${firstPart} ${lastPart}`; // concatenate formatted string
  return formattedStr;
}

function investedBidCompletedRevokePendingTemplate(bid_id,amount,user_id,revoke_date){
  var html=`<div class="bid_container">
            <div class=" red-text" style="display:none;"><i class="material-icons red-text">trending_up</i>Bid Id:${bid_id}</div>
            <div class="container">
            <div class="container_visa card">
            <div class="circles">
              <div class="circle circle-1"></div>
              <div class="circle circle-2"></div>
            </div>
            <div class="card_visa">
              <div class="visa_logo">
                <img
                  src=" https://www.pngall.com/wp-content/uploads/2017/05/Visa-Logo-PNG-Pic.png"
                  alt="">
              </div>
              <div class="visa_info">
                <img
                  src="https://cdn.freebiesupply.com/logos/large/2x/chip-1-logo-png-transparent.png"
                  alt="">
                <p>${formatString(user_id)} </p>
              </div>
              <div class="visa_crinfo">
                <p>INR ₹ ${amount}</p>
                <p>Revoke on. ${revoke_date}</p>
              </div>
            </div>
          </div></div>
          </div>`
  return html
}


// fetching user invested bids which are not completed

// function addTwoHoursToElement(inputDateTime, elementId) {
  
// }


function investedBidPendingTemplate(bid_id,amount,bid_date,payment_to,verified_by_receiver,verified_by_admin,downloadURL,receiver_uid){
  let display_upload='none';
  let display_download='none';
  let color='red';
  if (verified_by_receiver!='pending'){
    color='green';
  }


  if (downloadURL!=''){
     display_download='inline';
  }
  else{
    display_upload='inline'
  }
  var html=`<div class="bid_container">
            <div class="red-text" style="display:none;"><i class="material-icons red-text">trending_up</i>Bid Id: ${bid_id}</div>
            <div class="container">
            <div class="pending_bid_container">
            <div class="pending_bid_section">
              <span class="bid_amount_section ">Bid Amount: <span class="bid_amount right">₹${amount}</span></span><br><br>
              <span class="bid_date_section ">Date: <span class="bid_date right">${bid_date}</span></span><br><br>
              <span class="payment_to_section">Send Payment to: <span class="payment_to right">${payment_to}</span></span><br><br>
              <span class="verified_by_receiver ">Verified By Receiver: <span class="${color} status_pending_sucess right">${verified_by_receiver}</span></span><br><br>
            </div>
            <div class="bid_action_section">
              <a href="" class="bid_action_upload" style="display:${display_upload};">
                upload transaction screenshot
                <input type="file" id="${bid_id}-bid_screenshot_file" name="bid_screenshot_file" class="file_upload_class" bid_id=${bid_id} receiver_uid=${receiver_uid}>
                <i class="material-icons waves-effect  right bid_action_upload_icon">cloud_upload</i>
                <p class="green-text" id="${bid_id}-upload_percent"></p>
              </a>
              <a href="${downloadURL}" class="bid_action_download" style="display:${display_download};">
                <i class="material-icons waves-effect  right bid_action_download_icon green-text">get_app</i>
              </a><br>
              <a href="" class="bid_action_edit" style="display:${display_download};">
              </a>
            </div>
          </div>
          </div></div>`
  

  
  return html
}






function returnBidPendingTemplate(bid_id,bid_amount,bid_date,payment_from,verified_by_you,verified_by_admin,screenshot_of_transaction,sender_uid){
  let display_download ='none';
  if (screenshot_of_transaction !=undefined && screenshot_of_transaction!=''){
    display_download='inline';
  }
  let color='red';
  let verified='block'
  if (verified_by_you!='pending'){
    verified='none';
    color='green'
  }
  var html=`<div class="bid_container">
            <div class="red-text" style="display:none;"><i class="material-icons red-text">trending_down</i>Bid Id:
              ${bid_id}</div>
            <div class="container">
              <div class="return_bid_section">
                <span class="bid_amount_section ">Bid Amount: <span class="bid_amount right">₹${bid_amount}</span></span><br><br>
                <span class="bid_date_section ">Date: <span class="bid_date right">${bid_date}</span></span><br><br>
                <span class="payment_from_section">Receive Payment From: <span
                    class="payment_from right">${payment_from}</span></span><br><br>
                <span class="verified_by_you ">Verified By You: <span
                    class="${color} status_pending_sucess right">${verified_by_you}</span></span><br><br>
              </div>
              <a href="${screenshot_of_transaction}" class="bid_action_download" style="display:${display_download}";>download trans. screenshot<i
                  class="material-icons waves-effect  right bid_action_download_icon green-text">get_app</i><br></a>
              <div class="verifiy_received_amount_section" id="${bid_id}-verifiedTag" style="display:${verified}">(One Time Verificatin Only):<a href="#"
                  class="btn-small green right bid_payment_received_verify" bid_id=${bid_id} sender_uid=${sender_uid}>Verify</a></div>
            </div>
          </div>`
  return html
}




function investedBidRecord(bid_id,bid_amount,bid_date,payment_to){
  var html=`<div class="invested_bid_section">
  <span class="'bid_id_section">Bid Id: <span class="bid_id right">${bid_id}</span><br><br>
    <span class="bid_amount_section ">Bid Amount: <span
        class="bid_amount right">₹${bid_amount}</span></span><br><br>
    <span class="bid_date_section ">Date: <span class="bid_date right">${bid_date}</span></span><br><br>
    <span class="payment_to_section ">Payment To: <span
        class="payment_to right">${payment_to}</span></span><br><br>
</div>`

return html
}


function returnBidRecord(bid_id,bid_amount,bid_date,payment_from){
  var html=`<div class="return_bid_section">
            <span class="'bid_id_section">Bid Id: <span class="bid_id right">${bid_id}</span><br><br>
              <span class="bid_amount_section ">Bid Amount: <span
                  class="bid_amount right">₹${bid_amount}</span></span><br><br>
              <span class="bid_date_section ">Date: <span class="bid_date right">${bid_date}</span></span><br><br>
              <span class="payment_from_section">Payment From: <span
                  class="payment_from right">${payment_from}</span></span><br><br>
          </div>`
  return html
}


// fetching user invested bids which are not completed

export function fetchUserInvestedBidsReceived(user_id,element){
  var Ref= firebase
 .database()
 .ref("user_invested_bid/" + user_id)
 .orderByChild("verified_by_admin")
 .equalTo("completed");
 Ref.on('value',(snapshot)=>{
  var data_all=snapshot
  var html=''
  data_all.forEach(data=>{
  html+=investedBidRecord(data.key,data.val().bid_amount,formatDateWithTime(data.val().timestamp),data.val().payment_to)
  })
  document.getElementById(element).innerHTML=html
 })
}


// fetching user invested bids with completed and received status
export function fetchUsesInvestedBid(user_id,element){
  var Ref= firebase.database().ref("user_invested_bid/"+user_id);
  Ref.on('value',(snapshot)=>{
    var all_bid=snapshot;
    var total_investments=0
    all_bid.forEach(bid=>{
      if(bid.val().verified_by_admin=='received' || bid.val().verified_by_admin=='completed'){
        total_investments+=parseInt(bid.val().bid_amount);
      }
    })
    document.getElementById('total-invested').innerText=total_investments
    updateUserInvestments(user_id,total_investments)
  })
}


function updateUserInvestments(user_id,total_invested){
  var Ref=firebase.database().ref('user_investments_and_returns/'+user_id);
  return Ref.update({'total_invested':total_invested})
}




// fetching user returning bids which are pending

export function fetchUserReturnBidsPending(user_id,element){
  var Ref= firebase
 .database()
 .ref("user_return_bid/" + user_id)
 .orderByChild("verified_by_admin")
 .equalTo("pending");

 Ref.on('value',(snapshot)=>{
  var data_all=snapshot
  var html=''
  data_all.forEach(data=>{
    html+=returnBidPendingTemplate(data.key,data.val().bid_amount,formatDateWithTime(data.val().timestamp),data.val().payment_from,data.val().verified_by_you,data.val().verified_by_admin,data.val().screenshot_of_transaction,
    data.val().sender_uid
    )
  })
  document.getElementById(element).innerHTML=html

  var all_verify_amount_buttons=document.querySelectorAll('.bid_payment_received_verify');
    all_verify_amount_buttons.forEach(verifyButton=>{
      verifyButton.addEventListener('click',function(event){
          event.preventDefault();
          let bid_id=event.target.getAttribute('bid_id');
          let sender_uid=event.target.getAttribute('sender_uid');
          console.log(bid_id,sender_uid)
          updateUserInvestedBidStatusByReceiver(sender_uid,bid_id);
          updateUserReturnBidStatusByYou(user_id,bid_id)
      })
    })

 })
}




// fetching user returning bids which are completed

export function fetchUserReturnBidsReceived(user_id,element){
  var Ref= firebase
.database()
.ref("user_return_bid/" + user_id)
.orderByChild("verified_by_admin")
.equalTo("received");
 Ref.on('value',(snapshot)=>{
  var data_all=snapshot
  var html=''
  var total_return=0;
  data_all.forEach(data=>{
    html+=returnBidRecord(data.key,data.val().bid_amount,formatDateWithTime(data.val().timestamp),data.val().payment_from)
    total_return+=parseInt(data.val().bid_amount);
  })
  document.getElementById(element).innerHTML=html
  document.getElementById('total-return').innerText=total_return;

 })
}




