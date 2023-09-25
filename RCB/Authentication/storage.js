 import {updateUserInvestedBidScreenshotOfTransaction, updateUserReturnBidScreenshotOfTransaction} from './dashboard.js'

export function upload_bid_transaction_photo(user_uid,bid_id,file,receiver_uid){

// Create the file metadata
var metadata = {
  "File name": file.name,
  "File type":file.type,
  "File size":file.size
};

// Upload file and metadata to the object 'images/mountains.jpg'
var uploadTask = storageRef.child('transaction_photo/'+ user_uid + '/'+bid_id+'/' + file.name).put(file, metadata);

// Listen for state changes, errors, and completion of the upload.
uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
  (snapshot) => {
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    document.getElementById(bid_id+'-upload_percent').innerText='Upload is ' + Math.floor(progress) + '% done';
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: 
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: 
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    switch (error.code) {
      case 'storage/unauthorized':
        break;
      case 'storage/canceled':
        break;
      case 'storage/unknown':
        break;
    }
  }, 
  () => {
    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
      updateUserInvestedBidScreenshotOfTransaction(user_uid,bid_id,downloadURL)
      updateUserReturnBidScreenshotOfTransaction(receiver_uid,bid_id,downloadURL)
      console.log('File available at', downloadURL);
    });
  }
);
}

