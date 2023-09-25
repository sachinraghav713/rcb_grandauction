import { SignIn } from "./Authentication/database.js";


document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.dropdown-trigger');
  var el=document.querySelectorAll('.tabs')
  var instance_dropdown = M.Dropdown.init(elems);
  var instance_tab=M.Tabs.init(el);

  var elems_select = document.querySelectorAll('select');
  var instances_select = M.FormSelect.init(elems_select);

  var elems_modal = document.querySelectorAll('.modal');
  var instances_modal = M.Modal.init(elems_modal);
  
  
  var elems_action_btn = document.querySelectorAll('.fixed-action-btn');
  var instance_action_btn = M.FloatingActionButton.init(elems_action_btn, {
    direction: 'top',
    hoverEnabled: false
  });

});

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems);
});

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems);
});





const logoutButton=document.querySelectorAll('.logout_button')
logoutButton.forEach(btn=>{
  btn.addEventListener('click',(e)=>{
    e.preventDefault()
    auth.signOut()
    .then(() => {
      console.log('User logged out');
    })
    .catch((error) => {
      console.error(error);
    });
  })
})





// var signInButton = document.getElementById('google-signin-button')
// signInButton.addEventListener('click', (e) => {
//   e.preventDefault();
//   SignIn();
// })






function validatePhone(phoneNumber) {
  // Regular expression for Indian phone numbers
  const regex = /^(\+91-?)?(\d{10})$/;

  // Remove spaces and dashes from the phone number
  const cleanedNumber = phoneNumber.replace(/[-\s]/g, '');

  // Test the cleaned number against the regex
  return regex.test(cleanedNumber);
}



var signInForm = document.querySelector('#signin-form');
var signInButton=document.getElementById('signin-button')




signInButton.addEventListener('click',(e)=>{
  e.preventDefault();
  const otp=signInForm['otp_number'].value;
  verifyOTP(otp)
})







signInForm.addEventListener('input', (e) => {
  e.preventDefault()
  var phone = signInForm['signin-phone'].value;
  document.getElementById('err-msg').innerHTML=''
  var check = validatePhone(phone)
  if (check) {
    document.getElementById('signin-phone').style.setProperty('border-color', 'green', 'important');
    document.getElementById('signin-phone').style.setProperty('border-width', '1.5px', 'important');
    sendOTPTOMobile(phone)

  }
  else {
    document.getElementById('signin-phone').style.setProperty('border-color', 'red', 'important');
    document.getElementById('signin-phone').style.setProperty('border-width', '1.5px', 'important');
    document.getElementById('signin-password-section').style.display = 'none';
    document.getElementById('signin-button-section').style.display = 'none'
    document.getElementById('signup-button-section').style.display = 'none'

  }
})





function sendOTPTOMobile(mobileNumber){
  var phoneNumber = "+91 "+mobileNumber; // The phone number to verify

  var appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container'); // Replace 'recaptcha-container' with the ID of the container element for the reCAPTCHA widget, if you're using it
  
  firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
    .then(function (confirmationResult) {
      // OTP sent successfully. Save the confirmationResult for later use.
      window.confirmationResult = confirmationResult;
      document.getElementById('mobile-verify-error-container').style.display='none';
      document.getElementById('recaptcha-container').style.display='none';
      document.getElementById('verify-otp-container').style.display='block'

    })
    .catch(function (error) {
      // Handle any errors
      document.getElementById('mobile-verify-error-container').style.display='block';
      document.getElementById('mobile-verify-error-container').innerText=error
      document.getElementById('recaptcha-container').style.display='none';
      console.error(error);

    });
}


function verifyOTP(otp){
  var verificationCode = otp; // The OTP entered by the user

   window.confirmationResult.confirm(verificationCode)
     .then(function (result) {
       // Phone number successfully verified
       var new_user = result.user;
       console.log("Phone number verified for user: " + new_user.uid);
     })
     .catch(function (error) {
       // Verification failed
       console.error(error);
       document.getElementById('mobile-verify-error-container').style.display='block';
       document.getElementById('mobile-verify-error-container').innerText=error
     });

}





// Hide the loader after 2 seconds
setTimeout(() => {
  document.querySelector('.loader-wrapper').style.display = 'none';
}, 3000);



export function formatted_date(){
  // Create a new Date object
const currentDate = new Date();

// Get the day, month, and year components
const day = String(currentDate.getDate()).padStart(2, '0');
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Note: Months are zero-based
const year = currentDate.getFullYear();
const formattedDate = `${day}-${month}-${year}`;
return formattedDate
}

export  function checkTime() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour < 12 && currentHour >= 0) {
    return 'first_shift'; // Return first value if current time is between midnight and 12 noon
  } 
  else {
    return 'second_shift'; // Return second value for any other time
  }
}

const div_container=document.getElementById('group-link');
var firebaseRef=firebase.database().ref('group_link/link');
firebaseRef.on('value',(snapshot)=>{
  var data=snapshot.val();
  div_container.innerHTML=`<div class="modal-content">
  <span class="telegram_image_section">
   <img src="src/images/Telegram_logo.svg.png" class="telegram_image">
   <a class="" href="${data}"><img src="src/images/group_image.png" class="group_image" /></a>
 </span>
 </div>
 <div class="modal-footer">
   <a href="#!" class="modal-close waves-effect waves-green btn-flat left">close</a>
   <a class="btn-small right blue" href="${data}">Join RCB Group</a>
 </div>`

})






