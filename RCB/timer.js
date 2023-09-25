
export function cutDownTimer(){
    const hoursDisplay = document.querySelector('.hours');
    const minutesDisplay = document.querySelector('.minutes');
    const secondsDisplay = document.querySelector('.seconds');

    let targetHour = null;
    let targetTime = null;

    // Determine target time based on current time of day
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin=now.getMinutes()
    var dbRef=firebase.database().ref('timers')
    dbRef.on('value',(snapshot)=>{

        // var first_shift=snapshot.val().first_shift;
        // var second_shift=snapshot.val().second_shift;

        var first_shift=10;
        var second_shift=20;

        if ((currentHour==first_shift && currentMin <=20) || (currentHour==second_shift && currentMin<=20)){
            document.getElementById('timer-section').style.display='none';
            document.getElementById('makemybid-button').style.display='block';
            document.getElementById('bid-participation-err-msg').style.display='block';

        }
        else{
            document.getElementById('timer-section').style.display='block'
            document.getElementById('makemybid-button').style.display='none'
            document.getElementById('bid-participation-err-msg').style.display='none';
        }
    
    
        if (currentHour < first_shift) {
        targetHour = first_shift;
        } 

        else if (currentHour >= first_shift && currentHour < second_shift) {
        targetHour = second_shift;
        }
        
        else {
        targetHour = first_shift;
        now.setDate(now.getDate() + 1); // Add one day to target next 9am
        }
        targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour,0, 0);
    
        const countdownTimer = setInterval(() => {
        const remainingTime = Math.floor((targetTime - new Date()) / 1000);
        if (remainingTime <= 0) {
            document.getElementById('timer-section').style.display='none';
            document.getElementById('makemybid-button').style.display='block';
            document.getElementById('bid-participation-err-msg').style.display='block';
            clearInterval(countdownTimer);

            // if(remainingTime <-600){
            //     clearInterval(countdownTimer);
            //     document.getElementById('timer-section').style.display='block'
            //     document.getElementById('makemybid-button').style.display='none'
            //     document.getElementById('bid-participation-err-msg').style.display='none';
            // }

           }
        else {
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = remainingTime % 60;
    
            hoursDisplay.textContent = hours.toString().padStart(2, '0');
            minutesDisplay.textContent = minutes.toString().padStart(2, '0');
            secondsDisplay.textContent = seconds.toString().padStart(2, '0');
            
            // document.getElementById('timer-section').style.display='block'
            // document.getElementById('makemybid-button').style.display='none'
            // document.getElementById('bid-participation-err-msg').style.display='none';
            
        }
        
        }, 1000);
    
    })

}
            
            
           