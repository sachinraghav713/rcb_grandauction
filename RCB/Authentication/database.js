// write operations
import {fetchUserDetails} from '../profile.js'

export function writeUserData(userId, imageUrl, mobileNumber) {
  firebase
    .database()
    .ref("users/" + userId)
    .update({
      profile_picture: imageUrl,
      mobileNumber: mobileNumber,
    }).then(()=>{
      fetchUserDetails(userId, "profile-viewer-container");
    })
}

export function toggleStar(postRef, uid) {
  postRef.transaction((post) => {
    if (post) {
      if (post.stars && post.stars[uid]) {
        post.starCount--;
        post.stars[uid] = null;
      } else {
        post.starCount++;
        if (!post.stars) {
          post.stars = {};
        }
        post.stars[uid] = true;
      }
    }
    return post;
  });
}

export function updateUserId(user_uid) {
  var ref = firebase.database().ref("/user_id_count");
  var userRef = firebase.database().ref("users/" + user_uid);
  ref.transaction((count) => {
    if (count) {
      count.currentUserId++;
      userRef.update({ userId: "RCB4693" + count.currentUserId });
    }
    return count;
  });
}

export function updateUserInvestmentsAndReturns(
  userId,
  total_invested,
  total_return
) {
  firebase
    .database()
    .ref("user_investments_and_returns/" + userId)
    .update({
      total_invested: total_invested,
      total_return: total_return,
    });
}

export function updateUserAffiliateAndEarnings(
  userId,
  downlines,
  total_earnings
) {
  firebase
    .database()
    .ref("user_affiliate_and_earnings/" + userId)
    .update({
      downlines: downlines,
      total_earnings: total_earnings,
    });
}

//signIn with google
var provider = new firebase.auth.GoogleAuthProvider();

export function SignIn() {
  auth
    .signInWithPopup(provider)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
}

function convertToCommaSeparated(number) {
  return number.toLocaleString();
}

// Data Fetch Operations

export function fetchAuctionAmount(date, shift, element_id,mobileNumber) {

  var amountCountRef = firebase.database().ref("/auction_amount/"+date+'/'+shift); 
  var userBidParticipationCheckRef=firebase.database().ref('amount_senders/'+date+'/'+shift)
  amountCountRef.on("child_changed", (snapshot) => {
    const amount =snapshot.val();
    document.getElementById(element_id).innerText =
      convertToCommaSeparated(amount);
    if (amount<=0){
      document.getElementById('makemybid-button').setAttribute('class','btn-small green col s5 right place_bid disabled')
    }
    else{
      userBidParticipationCheckRef.on('value',(snapshot)=>{
        if (snapshot.val() && snapshot.val()[mobileNumber]){
          document.getElementById('user-auction-amount').style.display='none';
          document.getElementById('bid-participation-err-msg').innerText='Congratulations ! \n You Have Participated In Auction.'

        }
        else{
          document.getElementById('user-auction-amount').style.display='block';
          document.getElementById('bid-participation-err-msg').innerText=''

        }
      })
    }
  })

  amountCountRef.on("child_added", (snapshot) => {
    const amount =snapshot.val();
    document.getElementById(element_id).innerText =
      convertToCommaSeparated(amount);
    if (amount<=0){
      document.getElementById('makemybid-button').setAttribute('class','btn-small green col s5 right place_bid disabled')
    }
    else{
      userBidParticipationCheckRef.on('value',(snapshot)=>{
        if (snapshot.val() && snapshot.val()[mobileNumber]){
          document.getElementById('user-auction-amount').style.display='none';
          document.getElementById('bid-participation-err-msg').innerText='Congratulations ! \n You Have Participated In Auction.'
        }
        else{
          document.getElementById('user-auction-amount').style.display='block';
          document.getElementById('bid-participation-err-msg').innerText=''

        }
      })
    }
  })
};
   

// export function fetchAuctionAmount(date, shift,element_id) {
//     var amountCountRef = firebase.database().ref('/auction_amount/');
//     amountCountRef.on('child_added',(data)=>{
//         const val = data.val();
//         // const amount = val[date][shift];
//         document.getElementById(element_id).innerText=data.val()['1']
//     })
//   }

export function fetchUserInvestmentsAndReturns(userUid) {
  return new Promise((resolve, reject) => {
    var userRef = firebase
      .database()
      .ref("/user_investments_and_returns/" + userUid);
    var total_invested = 0;
    var total_return = 0;
    var da;
    userRef.on(
      "value",
      (snapshot) => {
        const data = snapshot.val();
        total_invested = data["total_invested"];
        total_return = data["total_return"];
        da = { total_invested, total_return };
        resolve(da);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

// export function fetchUserAffiliateAndEarnings(userUid) {
//   return new Promise((resolve, reject) => {
//     var userRef = firebase
//       .database()
//       .ref("user_affiliate_and_earnings/" + userUid);
//     var downlines = 0;
//     var total_earnings = 0;
//     var da;
//     userRef.on(
//       "value",
//       (snapshot) => {
//         const data = snapshot.val();
//         downlines = data["downlines"];
//         total_earnings = data["total_earnings"];
//         da = { downlines, total_earnings };
//         resolve(da);
//       },
//       (error) => {
//         reject(error);
//       }
//     );
//   });
// }

function logoutAllTabs() {
  const loggedInHome = document.querySelector(".loggedInHome");
  const loggedInDashboard = document.querySelector(".loggedInDashboard");
  const loggedInProfile = document.querySelector(".loggedInProfile");
 

  loggedInHome.style.display = "none";
  loggedInDashboard.style.display = "none";
  loggedInProfile.style.display = "none";
}

export function userStateCheck(user_id) {
  var firebaseRef = firebase.database().ref("users/" + user_id);
  firebaseRef.once("value", (snapshot) => {
    try {
      var data = snapshot.val();
      var state = data.user_state;
      logoutAllTabs();
      document.getElementById(state).style.display = "block";
    } catch (error) {
      firebaseRef.update({ user_state: "home" });
    }
  });
}

export function changeLoggedInLoggedOutLinks() {
  const loggedInLinks = document.querySelectorAll(".loggedIn");
  const loggedOutLinks = document.querySelectorAll(".loggedOut");
  const loggedInOut = document.querySelectorAll(".loggedInOut");
  

  loggedInOut.forEach((data) => {
    data.style.display = "block";
  });

  loggedInLinks.forEach((data) => {
    data.style.display = "block";
  });

  loggedOutLinks.forEach((data) => {
    data.style.display = "none";
  });
}


export function logoutAllLoggedInLinks() {
  logoutAllTabs();
  const loggedInOut = document.querySelectorAll(".loggedInOut");

  loggedInOut.forEach((data) => {
    data.style.display = "block";
  });

  const loggedInLinks = document.querySelectorAll(".loggedIn");
  const loggedOutLinks = document.querySelectorAll(".loggedOut");
  loggedInLinks.forEach((data) => {
    data.style.display = "none";
  });
  loggedOutLinks.forEach((data) => {
    data.style.display = "block";
  });
}

function manageState(state){
  logoutAllTabs();
  document.getElementById(state).style.display = "block";
}

export function manageUserNavigationState() {
  const ProfileButton = document.querySelectorAll(".profile_button");
  const DashboardButton = document.querySelectorAll(".dashboard_button");
  const HomeButton = document.querySelectorAll(".home_button");
  // var userId = user.uid;

  

  
  ProfileButton.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      manageState('profile')
    //   firebase
    //     .database()
    //     .ref("users/" + userId)
    //     .update({ user_state: "profile" });
    });
  });

  DashboardButton.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      manageState('dashboard')
      // firebase
      //   .database()
      //   .ref("users/" + userId)
      //   .update({ user_state: "dashboard" });
    });
  });

  HomeButton.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      manageState('home')
      // firebase
      //   .database()
      //   .ref("users/" + userId)
      //   .update({ user_state: "home" });
    });
  });
}


export function writeUserProfile(user){
  const user_uid = user.uid;
  var mobile_number = user.phoneNumber;
  const dummyURL ="https://isl.org.pk/wp-content/uploads/2020/03/dummy-avatar-300x300.jpg";
  

  firebase.database().ref("users/" + user_uid).once("value", (snapshot) => {
      if (snapshot.exists()) {
        fetchUserDetails(user_uid, "profile-viewer-container");
      }
      else {
          var currentUserId = updateUserId(user_uid);
          writeUserData(user_uid, dummyURL, mobile_number);
          updateUserAffiliateAndEarnings(user_uid, 0, 0);
          updateUserInvestmentsAndReturns(user_uid, 0, 0);
          updateUplineWithURL(user)
          var firebaseRef=firebase.database().ref("users/" + user_uid)
          firebaseRef.update({ user_state: "home" });
      }
    });
  var accountProfile = document.getElementById("account-profile");
  accountProfile.style.backgroundImage = `url(${dummyURL})`;
}


function updateUplineWithURL(user){
  const hash = window.location.hash;
  var newHash = hash.substring(1);
  var newString = newHash.replace('RCB4693', "");
  var dbRef=firebase.database().ref('user_id_count/currentUserId')
  dbRef.on('value',(snapshot)=>{
    var count=snapshot.val();
    if (newString>0 && newString<=count){
      var ref=firebase.database().ref('/users/'+user.uid)
       ref.update({'uplineId':newHash})
    }
  })
}