import {chartProjections } from "./Authentication/chart_graph.js";
import {
  userStateCheck,
  changeLoggedInLoggedOutLinks,
  logoutAllLoggedInLinks,
  manageUserNavigationState,
  fetchAuctionAmount,
  fetchUserInvestmentsAndReturns,
  writeUserProfile
} from "./Authentication/database.js";
import { cutDownTimer } from "./timer.js";
import {
  fetchUserDetails,
  updateUpline,
  fetchDirectDownlines,
  fetchInDirectDownlines,
  updateUserProfile,
  fetchUserAffiliateAndEarnings
} from "./profile.js";
import { formatted_date,checkTime } from "./index.js";
import {writeUserInvestedBid,writeUserReturnBid, fetchUserInvestedBidsPending,fetchUserReturnBidsPending,fetchUserInvestedBidsReceived,fetchUserReturnBidsReceived,fetchUsesInvestedBid } from "./Authentication/dashboard.js"

auth.onAuthStateChanged((user) => {
  if (user) {
    var presenceRef = firebase.database().ref('users_online/'+user.uid);
    // Write a string when this client loses connection
    
    console.log(user)
    writeUserProfile(user)
    changeLoggedInLoggedOutLinks();
    presenceRef.set(true);
    presenceRef.onDisconnect().set(false)
    userStateCheck(user.uid);
    chartProjections();
    fetchAuctionAmount(formatted_date(), checkTime(), "auction-amount",user.phoneNumber);

    cutDownTimer();
    fetchUserInvestedBidsPending(user.uid,'user-current-invested-bids')
    fetchUserReturnBidsPending(user.uid,'user-current-return-bids')
    fetchUserInvestedBidsReceived(user.uid,'user-record-invested-bids');
    fetchUserReturnBidsReceived(user.uid,'user-record-return-bids')
    fetchUsesInvestedBid(user.uid,'');
  
    const userAuctionAmountForm=document.getElementById('user-auction-amount')
    userAuctionAmountForm.addEventListener('input',(e)=>{
      e.preventDefault();
      var amount=userAuctionAmountForm['user_auction_amount'].value;
      if (amount <500 || amount>2500){
        document.getElementById('bid_amount_error').innerText='Amount Must be between 500 and 2500'
        document.getElementById('makemybid-button').setAttribute('class','btn-small green col s5 right place_bid disabled')
      }
      else{
        document.getElementById('bid_amount_error').innerText=''
        document.getElementById('makemybid-button').setAttribute('class','btn-small green col s5 right place_bid')
      }
    })

      
         
    userAuctionAmountForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        document.getElementById('makemybid-button').style.display='none';
        var amount=userAuctionAmountForm['user_auction_amount'].value;
        var userdbRef=firebase.database().ref('users/'+user.uid)
        var bid_flag=true
        userdbRef.once('value',(snapshot)=>{
          var mobileNumber=snapshot.val().mobileNumber
          var paymentNumber=snapshot.val().mobileNumber
          if (snapshot.val().paymentNumber){
            paymentNumber=snapshot.val().paymentNumber
          }
          
          var date=formatted_date()
          var shift=checkTime()
          var amountCountRef = firebase.database().ref("/auction_amount/"+date+'/'+shift);
          var userBidParticipationCheckRef=firebase.database().ref('amount_senders/'+date+'/'+shift)
            amountCountRef.once('value',(snapshot)=>{
            var auction_amount=snapshot.val()
            userBidParticipationCheckRef.once('value',(snap)=>{
            if ((snap.val() && snap.val()[mobileNumber])){

              }
            else{
              if (bid_flag && auction_amount.amount>=500 && auction_amount.amount>=amount && amount<=2500 && auction_amount.active){
                  firebase.database().ref('amount_senders/'+date+'/'+shift+'/'+mobileNumber).update({'uid':user.uid,'amount':parseInt(amount)}).then(()=>{
                  toggleAmount(amountCountRef,amount);
                  firebase.database().ref("users/" + user.uid).update({ user_state: "dashboard" });
                  firebase.database().ref('originnal_copy_sender_amount/'+mobileNumber).update({'uid':user.uid,'amount':parseInt(amount)})
                  })
                  bid_flag=false;
                }
              }  
            })
          })
        })
      })


    fetchUserAffiliateAndEarnings(user.uid)
      
    document.getElementById('link-share-section').style.display='block';
    document.getElementById('update-payment-number-section').style.display='block';
    document.getElementById('paymentNumber-number').innerText=user.phoneNumber


    const updatePaymentNumberButton=document.getElementById('update-payment-number-btn')
    const updatePaymentForm=document.getElementById('update-payment-number-form')
    updatePaymentNumberButton.addEventListener('click',(e)=>{
      e.preventDefault();
      updatePaymentForm.style.display='block';
      updatePaymentNumberButton.style.display='none';
    })

    updatePaymentForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      var paymentNumber=updatePaymentForm['payment_number'].value;
      var dbRef=firebase.database().ref('users/'+user.uid);
      dbRef.update({'paymentNumber':paymentNumber}).then(()=>{
        updatePaymentForm.reset();
        updatePaymentForm.style.display='none';
        updatePaymentNumberButton.style.display='block';
        document.getElementById('paymentNumber-number').innerText=paymentNumber;
      })
    })

   
  
    // profile section
    updateUserProfile(user)
    var userRef = firebase.database().ref("users/" + user.uid);
    userRef.on("value", (snapshot) => {
      var data = snapshot.val();
      if (data && data.userId){
        fetchDirectDownlines(user.uid,data.userId, "all-direct-downlines");
        fetchInDirectDownlines(data.userId, "all-indirect-downlines");
      }
    });
  }
else{
  logoutAllLoggedInLinks()
}

})
  




manageUserNavigationState()

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

