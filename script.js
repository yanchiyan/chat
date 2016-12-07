$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBLs8n4-gTq13c-Sy6FzEocOrWyZEsj7lA",
    authDomain: "firechat-b454c.firebaseapp.com",
    databaseURL: "https://firechat-b454c.firebaseio.com",
    storageBucket: "firechat-b454c.appspot.com",
    messagingSenderId: "264731837518"
  };
  firebase.initializeApp(config);

  // Firebase database reference
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');
  var dbRef = firebase.database().ref();

  var photoURL;
  var $img = $('img');

  // REGISTER DOM ELEMENTS
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $hovershadow = $('.hover-shadow');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');

  //INFO
  const $infoName = $('#userName');
  const $infoAge = $('#userAge');
  const $infoOccupation = $('#userOccupation');
  const $infoDescriptions = $('#userDescriptions');
  const $file = $('#file');

  //PROFILE
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileAge = $('#profile-age');
  const $profileOccupation = $('#profile-occupation');
  const $profileDescriptions = $('#profile-descriptions');

  //CHAT
  const $messageList = $('#messages');
  const $messageInput = $('#messageInput');

  // Hovershadow
  $hovershadow.hover(
    function(){
      $(this).addClass("mdl-shadow--6dp");
    },
    function(){
      $(this).removeClass("mdl-shadow--6dp");
    }
  );

  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function() {
    $file.change(handleFileSelect);
    // $file.disabled = false;
  }

  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignUp.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled')
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
  }

  // Sign In
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log('SignIn User');
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user is "+user.email);
      //const dbUserid = dbUser.child(user.uid);
      //dbUserid.push({email:user.email});
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    if(user) {
      console.log(user);
      const dbUserid = dbUser.child(user.uid);
      const loginName = user.displayName || user.email;
      var $age = dbUserid.child('Age');
      var $occupation = dbUserid.child('Occupation');
      var $descriptions = dbUserid.child('Descriptions');
      $signInfo.html(loginName+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      $img.attr("src",user.photoURL);

      $age.on('value',function(snap){
        $profileAge.html(snap.val());
      });
      $occupation.on('value',function(snap){
        $profileOccupation.html(snap.val());
      });
      $descriptions.on('value',function(snap){
        $profileDescriptions.html(snap.val());
      });

      // LISTEN FOR KEYPRESS EVENT
      $messageInput.keypress(function (e) {
        var use = firebase.auth().currentUser;
        if (e.keyCode == 13) {
          //FIELD VALUES
          var username = user.displayName;
          var message = $messageInput.val();
          var picture = user.photoURL;
          console.log(username);
          console.log(message);

          //SAVE DATA TO FIREBASE AND EMPTY FIELD
          dbChatRoom.push({pic:picture, name:username, text:message});
          $messageInput.val('');
        }
      });


      // Add a callback that is triggered for each chat message.
      dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
        //GET DATA
        var data = snapshot.val();
        var username = data.name || "anonymous";
        var message = data.text;
        var pic = data.pic;

        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        var $messageElement = $("<li>");
        var $nameElement = $("<strong class='example-chat-username'></strong>");
        $nameElement.text(username).prepend($('<img>',{class:'chatimg',src:pic}));
        $messageElement.text(message).prepend($nameElement);

        //ADD MESSAGE
        $messageList.append($messageElement)

        //SCROLL TO BOTTOM OF MESSAGE LIST
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });

      user.providerData.forEach(function (profile) {
        console.log("Sign-in provider: "+profile.providerId);
        console.log("  Provider-specific UID: "+profile.uid);
        console.log("  Name: "+profile.displayName);
        console.log("  Email: "+profile.email);
        console.log("  Photo URL: "+profile.photoURL);
      });

    } else {
      console.log("not logged in");
      $profileName.html("");
      $profileEmail.html("");
      $profileAge.html("");
      $profileOccupation.html("");
      $profileDescriptions.html("");
      $img.attr("src","");
    }
  });

  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
  });

  // Submit
  $btnSubmit.click(function(){
    var user = firebase.auth().currentUser;
    const $userName = $('#userName').val();

    const dbUserid = dbUser.child(user.uid);

    var age = $infoAge.val();
    var occupation = $infoOccupation.val();
    var descriptions = $infoDescriptions.val();

    dbUserid.set({Age:age,Occupation:occupation,Descriptions:descriptions});

    var $occupation = dbUserid.child('Occupation');
    var $age = dbUserid.child('Age');
    var $descriptions = dbUserid.child('Descriptions');

    $age.on('value',function(snap){
      $profileAge.html(snap.val());
    });
    $occupation.on('value',function(snap){
      $profileOccupation.html(snap.val());
    });
    $descriptions.on('value',function(snap){
      $profileDescriptions.html(snap.val());
    });

    const promise = user.updateProfile({
      displayName: $userName,
      photoURL: photoURL
    });
    promise.then(function() {
      console.log("Update successful.");
      user = firebase.auth().currentUser;

      if (user) {
        $profileName.html(user.displayName);
        $profileEmail.html(user.email);
        $img.attr("src",user.photoURL);

        const loginName = user.displayName || user.email;
        $signInfo.html(loginName+" is login...");
      }
    });
  });

});
