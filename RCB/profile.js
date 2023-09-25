import { logoutAllLoggedInLinks } from "./Authentication/database.js";


export function updateMobileNumber(userId,mobileNumber){
  var ref=firebase.database().ref('users/'+userId);
  return ref.update({mobileNumber:mobileNumber})
}




function elementCreate(imageURL,userId,phoneNumber){
        var html=`<div class="col s4 photo_section">
                <span class="profile_photo" style="background-image: url('${imageURL}');"></span>
                </div>
                <div class="col s8 user_details_section">
                <span class="user_id_label ">User Id:</span><span class="user_id ">${userId}</span><br>
                <span class="phone_number_label ">Phone No.:</span><span class="phone_number ">${phoneNumber}</span>
                </div>`

      return html
}


function uplineElementCreate(profile_picture,userId,mobile_number){
    console.log("23",profile_picture,userId,mobile_number)
    var html=`<div class="container"><div class="person_profile_section row"  id="upline-person-profile">
                <div class="person_profile_photo_section col s4">
                <span class="person_profile_photo" style="background-image: url('${profile_picture}');"></span>
                </div>
                <div class="person_profile_details col s8">
                <span class="person_user_id_label">User Id:</span><span class="person_user_id">${userId}</span><br>
                <span class="person_user_phone_label">Phone No.:</span><span class="person_user_phone">${mobile_number}</span><br>
                <span class="person_user_total_downlines_label">Downlines:</span><span
                    class="person_user_total_downlines">--</span>
                </div>
            </div></div>`
    return html
}

function selectUplineTemplate(data){
    var html=`<option value="" data-icon="">${data}</option>`
    return html
  }

  function compareString(inputString) {
    if (inputString.length < 7) {
      return false;
    }
  
    var referenceString = "RCB4693";
    var inputSubstring = inputString.substring(0, 7);
  
    return inputSubstring === referenceString;
  }

function fetchUplineUsers(user_uid){
        const uplineIdForm=document.getElementById('upline-data-form');
        uplineIdForm.addEventListener('input',(event)=>{
            event.preventDefault();
            const uplineId=uplineIdForm['upline_id_input'].value;

            if (compareString(uplineId)){
                var ref=firebase.database().ref('/users')
                ref.orderByChild('userId').equalTo(uplineId).on('value',(snapshot)=>{
                    var data=snapshot
                    data.forEach(val=>{
                        document.getElementById('upline-data').innerHTML = downlinesElement(val.val().profile_picture,val.val().userId,val.val().mobileNumber)
                        document.getElementById('upline-id-maker-button').style.display='block'

                    })
                })
            } 
            else{
                document.getElementById('upline-data').innerHTML = ''
                document.getElementById('upline-id-maker-button').style.display='none'
            }

        })

        uplineIdForm.addEventListener('submit',(event)=>{
            event.preventDefault()
            let uplineId=uplineIdForm['upline_id_input'].value;
            updateUpline(user_uid,uplineId)
            document.getElementById('upline-update-section').style.display='none'
        })
}
  
  
function getProfileLink(userId){
    // Get the button element
const copyLinkBtn = document.getElementById('copy-link-btn');
const dataToCopy = 'https://rcbauction.web.app/#'+userId;

const linkContainer=document.getElementById('link-container')
var html=`<a href="${dataToCopy}" class="link" target="_blank">${dataToCopy}</a>`
linkContainer.innerHTML=html

// Add a click event listener to the button
copyLinkBtn.addEventListener('click', () => {
  // Get the data or URL you want to copy
  // Create a temporary input element
  const tempInput = document.createElement('input');
  tempInput.value = dataToCopy;

  // Append the temporary input element to the document
  document.body.appendChild(tempInput);

  // Select the value of the input element
  tempInput.select();

  // Execute the copy command
  document.execCommand('copy');

  // Remove the temporary input element
  document.body.removeChild(tempInput);

  // Provide feedback to the user
  copyLinkBtn.textContent = 'Link Copied!';
});

}


export function fetchUserDetails(userId,elementId){

 var ref=firebase.database().ref('users/'+userId);
 ref.once('value',(snapshot)=>{
    var user_data=snapshot.val();
    if (user_data.uplineId){
        var dbRef=firebase.database().ref('users/')
        dbRef.orderByChild('userId').equalTo(user_data.uplineId).on('value', (snapshot) => {
            console.log(user_data.uplineId)
            let data = snapshot.val();
            for (const key in data) {
                const user=data[key];
                document.getElementById('person-profile-section').innerHTML=uplineElementCreate(user.profile_picture,user.userId,user.mobileNumber)
              }
        });
        document.getElementById('upline-update-section').style.display='none'
     }
     else{
        document.getElementById('upline-update-section').style.display='inline'
       }
    document.getElementById(elementId).innerHTML=elementCreate(user_data.profile_picture,user_data.userId,user_data.mobileNumber)
    if (user_data.mobileNumber ==='XXX87XX7XX'){
        document.getElementById('update-profile-button').style.display='inline'
    }
    else{
        document.getElementById('update-profile-button').style.display='none'
    }
    getProfileLink(user_data.userId)
 }).then(()=>{
    fetchUplineUsers(userId)
 })
}


function downlinesElement(imageURL,userId,phoneNumber){
    var html=` <div class="person_profile_section row">
                <div class="person_profile_photo_section col s4">
                <span class="person_profile_photo" style="background-image: url('${imageURL}');"></span>
                </div>
                <div class="person_profile_details col s8">
                <span class="person_user_id_label">User Id:</span><span class="person_user_id">${userId}</span><br>
                <span class="person_user_phone_label">Phone No.:</span><span
                    class="person_user_phone">${phoneNumber}</span><br>
                <span class="person_user_total_downlines_label">Downlines:</span><span
                    class="person_user_total_downlines">--</span>
                </div>
            </div>`
    return html
}




export function fetchDirectDownlines(user_uid,userId,elementId){
    var dbRef=firebase.database().ref('users');
    dbRef.orderByChild('uplineId').equalTo(userId).on('value',(snapshot)=>{
        let data=snapshot.val();
        var html=''
        var count=0
        var total_affiliate_earnings=0;
        for (const key in data){
            const user=data[key];
            var ref=firebase.database().ref('user_investments_and_returns/'+key+'/total_invested')
            ref.once('value',(invested)=>{
                total_affiliate_earnings+=parseInt(invested.val()*0.05)
                updateUserAffiliateAndEarnings(user_uid,total_affiliate_earnings)
            })
            html+=downlinesElement(user.profile_picture,user.userId,user.mobileNumber)
            count+=1
        }
        document.getElementById(elementId).innerHTML=html
        document.getElementById('downlines').innerText=count
        updateUserDownlines(user_uid,count)
    })

}

function updateUserDownlines(user_id,total_downlines){
    var ref=firebase.database().ref('user_affiliate_and_earnings/'+user_id)
    return ref.update({'downlines':total_downlines});
}

function updateUserAffiliateAndEarnings(user_id,total_affiliation){
    var ref=firebase.database().ref('user_affiliate_and_earnings/'+user_id);
    return ref.update({'total_earnings':total_affiliation});
}


export function fetchInDirectDownlines(userId,elementId){
    var dbRef=firebase.database().ref('users/');
    dbRef.orderByChild('uplineId').equalTo(userId).on('value',(snapshot)=>{
        let data=snapshot.val();
        for (const key in data){
             var newUser=data[key]
             var newUserId=newUser.userId
            dbRef.orderByChild('uplineId').equalTo(newUserId).on('value',(snapshot)=>{
                let data=snapshot.val();
                for (let key in data){
                    let user=data[key];
                    document.getElementById(elementId).innerHTML+=downlinesElement(user.profile_picture,user.userId,user.mobileNumber)
                }
            })
        }
    })

}

export function fetchUserAffiliateAndEarnings(user_uid){
    var userRef=firebase.database().ref('user_affiliate_and_earnings/'+user_uid);
    userRef.on('value',(snapshot)=>{
        document.getElementById('total-earnings').innerText=snapshot.val().total_earnings
        if(snapshot.val().redeem_amount){
            document.getElementById('available-amount').innerText=snapshot.val().total_earnings-snapshot.val().redeem_amount
            document.getElementById('redeem-amount').innerText=snapshot.val().redeem_amount
        }
        else{
            document.getElementById('available-amount').innerText=0
            document.getElementById('redeem-amount').innerText=0
        }
        
    })
}




export function updateUpline(userId,uplineId){
    var ref=firebase.database().ref('/users/'+userId)
    ref.update({'uplineId':uplineId}).then(()=>{
        fetchUserDetails(userId, "profile-viewer-container");
    })
}








export function updateUserProfile(user){
    var userId=user.uid
    var updateProfileForm = document.querySelector("#update-profile-form");
    var updateProfileButton = document.getElementById("update-profile-button");

    updateProfileButton.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("update-profile-container").style.display ="block";
      updateProfileButton.style.display = "none";
      updateProfileForm = document.querySelector("#update-profile-form");
    });

    



}




  