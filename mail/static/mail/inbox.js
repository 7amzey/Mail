document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email(event) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#msg-view').style.display = 'none';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#msg-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    emails.forEach(email => view_mail(email,mailbox));
  });
}

function send_email() {
  // define ver for the inputs
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // query the API to post the information
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
  // load sent mailbox
  localStorage.clear;
  load_mailbox('sent');
  return false;
}

function view_mail(email, mailbox){
  const emailDiv = document.createElement('div');
  emailDiv.id = 'email';
  emailDiv.className = 'row';
  
  // define a div element for the recipients 
  const recipient = document.createElement('div');
  recipient.id = 'email-recipient';
  recipient.className = 'col-lg- col-md-3 col-sm-12';
  recipient.style = 'display: flex; align-items: center;'

  if (mailbox === 'inbox','archive'){
    // if the mailbox is inbox or archive the recipients div will show the email sender 
    recipient.innerHTML = email.sender;
  }
  else {
    // if the mailbox is sent the recipients div will show the email recipients
    recipient.innerHTML = email.recipients[0];
  }
  emailDiv.append(recipient);

  // create a div for the subject
  const subject = document.createElement('div');
  subject.id = 'email-subject';
  subject.className = 'col-lg-6 col-md-5 col-sm-12';
  subject.style = 'display: flex; align-items: center;'
  subject.innerHTML = email.subject;
  emailDiv.append(subject);

  // create a div for the timestamp and other button
  const timestamp_div = document.createElement('div');
  timestamp_div.className = 'col-lg-3 col-md-3 col-sm-12';
  timestamp_div.style = 'display: flex; justify-content: space-around; align-items: center;'

  // create a div for the timestamp
  const timestamp = document.createElement('time');
  timestamp.innerHTML = email.timestamp;
  timestamp_div.append(timestamp);
  emailDiv.append(timestamp_div);

  if (mailbox != 'sent'){
    // if the mailbox isn't sent add the other button like mark as unread and archive
    tool_div = document.createElement('div');
    tool_div.className = 'dropdown';

    tool_button = document.createElement('button');
    tool_button.className = 'btn btn-link';
    tool_button.id = 'dropdownMenuButton';
    tool_button.setAttribute("type", "button");
    tool_button.setAttribute("data-toggle", "dropdown");
    tool_button.setAttribute("aria-haspopup", "true");
    tool_button.setAttribute("aria-expanded", "false");
    tool_button.innerHTML = '<i class="bi bi-three-dots"></i>';
    tool_div.append(tool_button);

    menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.setAttribute ('aria-labelledby','dropdownMenuButton');
    tool_div.append(menu);

    archive_item = document.createElement('a');
    archive_item.className = 'dropdown-item';
    if (email.archived === false){
      archive_item.innerHTML = 'Archive';
    }
    else{
      archive_item.innerHTML = 'Unarchive';
    }
    menu.append(archive_item);
    
    read_item = document.createElement('a');
    read_item.className = 'dropdown-item';
    if (email.read === false){
      read_item.innerHTML = 'Mark as read';
    }
    else{
      read_item.innerHTML = 'Mark as unread';
    }
    menu.append(read_item);
    timestamp_div.append(tool_div);
  }

  // create div for the body of the card
  const cardbody = document.createElement('div');
  cardbody.className = 'card-body';
  if (mailbox !== 'sent'){
    cardbody.style = 'padding: 1rem 1.25rem 1rem 1.25rem; align-items: center;';
  }
  else{
    cardbody.style = 'align-items: center;';
  }
  cardbody.append(emailDiv);

  // create div for the card it will contain all information about the msg 
  const card = document.createElement('div');
  if (email.read === false) {
    card.className = 'card';
    card.style = 'margin-bottom: 10px;';
    emailDiv.style = 'font-weight: bold;';
  }
  else {
    card.className = 'card';
    card.style = 'margin-bottom: 10px; background-color: #F0F1F2;'
  }
  
  card.append(cardbody);
  document.querySelector('#emails-view').append(card);

  recipient.addEventListener('click',() => mail(email.id, mailbox))
  subject.addEventListener('click',() => mail(email.id, mailbox))
  
  // check if the email isn't archived
  if (email.archived === false){
    // if it's equal it will archive the email
    archive_item.addEventListener('click',() => archive(email.id));
  }
  else{
    // if it's not equal it will unarchive the email
    archive_item.addEventListener('click',() => unarchive(email.id));
  }

  // check if the email isn't read
  if (email.read === false){
    // if it's equal it will mark it as read
    read_item.addEventListener('click', () => mark_as_read(email.id));
  }
  else{
    // if it's not equal it will mark it as unread
    read_item.addEventListener('click', () => mark_as_unread(email.id));
  }
}

function mail(email_id, mailbox){
  // view the msg view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#msg-view').style.display = 'block';

  // query the API to view the email
  fetch (`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email_id);
    console.log('This element has been clicked');
    
    // mark the email as read if it's not
    mark_as_read(email.id)

    // check if the email is not in the sent mail 
    if (mailbox != 'sent'){
      // if it's not in the sent mail it will add 'from'
      document.querySelector('#sender').innerHTML = 'From: '+email.sender;
    }
    else {
      // if it's in the sent mail it will add 'to'
      document.querySelector('#sender').innerHTML = 'To: '+email.recipients[0];
    }

    // add the information of this email
    document.querySelector('#subject').innerHTML = email.subject;
    document.querySelector('#date').innerHTML = email.timestamp;
    document.querySelector('#body').innerHTML = email.body;

    // check if the mailbox is equal to sent
    if (mailbox == 'sent'){
      // if it's equal it will hide the archive and unread buttons
      document.querySelector('#buttons').style.display = 'none';
    }
    else{
      // if it's not equal it will show them 
      document.querySelector('#buttons').style.display = 'block';
    }
    
    // check if the email isn't archived 
    if (email.archived === false){
      // if it's not archived it will add archive it
      document.querySelector('#archive').addEventListener('click',() => archive(email.id))
    }
    else{
      // if it's archived it will remove it from archive box
      document.querySelector('#archive').addEventListener('click',() => unarchive(email.id))
      
    }
    document.querySelector('#unread').addEventListener('click', () => mark_as_unread(email.id))

    // replay function
    document.querySelector('#replay_button').addEventListener('click', () => {
      compose_email()
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = 'Re: '+email.subject;
      document.querySelector('#compose-body').value = 'On '+'['+email.timestamp+']'+' '+email.sender+' wrote: '+email.body;
    })
  })
}

function mark_as_read(email_id){
  fetch(`/emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archive(email_id){
  fetch(`/emails/${email_id}`,{
    method:'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  console.log('added to archive box')
  location.reload();
  return false;
}

function unarchive(email_id){
  fetch(`/emails/${email_id}`,{
    method:'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  console.log('removed from archive box')
  location.reload();
  return false;
}

function mark_as_unread(email_id){
  fetch(`/emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
      read: false
    })
  })
  location.reload();
  return false;
}