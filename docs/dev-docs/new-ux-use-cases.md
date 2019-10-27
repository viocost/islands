# New UX Use cases:

##### 1. Admin Registers first time
* Goes to /admin/
* Island checks if admin is set up. 
* Sees that is not and prompts to create admin password 
* Admin enters new password twise and clicks "Register" button
* Vault ID, access link and additional info displayed on the same page
* Admin user then able to log into his vault.

##### 2. Admin logs into admin panel

* Goes to /admin
* Island sees that admin is registered, and reaches for the admin's vault
* Admin is prompted to enter vault's password
* Vault is then decrypted, admin record is found. Admin's private key is used to perform admin login on the same page 
* Admin is now logged in and sees the admin panel


* admin from his vault clicks on admin record
* new admin page is opened with no-vault parameter
* private key is saved in localStorage encrypted with 1-time-key
* Admin page reaches to the local storage decrypts the key and performs admin login


##### 3. Admin invites another user
* Admin logs into admin panel
* Clicks button - invite new user
* Invite link created and displayed
* Admin passes the link to a new user thorugh another medium
* New user clicks the link and follows the instructions

##### 4. New user joins existing island
* User given an invite link with invite code
* User prompted to enter new password twice
* User displayed vault ID, access link and additional instructions
* User then may login in ordinary way

##### 5. User accesses his vault
* User goes to dedicated onion address
* Island finds the vault associated with that address
* User prompted to enter password
* Vault decrypted
* User displayed his vault with all of the topics

##### 6. Admin accesses his vault
Note: If island accessed directly i.e. not via TOR browser it assumes that it is admin is trying to login into his vault
* Admin goes to direct island link, i.e.  https://some.ip:port or via dedicated onion link: https://sahdfgkhjkrthewh425.onion
* Island pulls admins vault 
* Island propts for admins password
* Admin enters his password
* Vault is decrypted 
* Admin displayed his vault with all of the topics

##### 7. User logs into topic
* User accesses his vault (Use case 5)
* User selects the topic from the vault
* New window with selected topic is opened, user logged in.
* Vault window remains opened


##### 8. User creates new topic
* User accesses his vault (Use case 5)
* User clicks  "Create topic" button on the main panel in the vault interface
* Modal window appears with prompt to enter topic name and user name
* Topic created and added to the vault, registration results displayed in the same modal window


##### 9. User joins new topic
* User accesses his vault (Use case 5)
* User clicks button "Join topic" on the main panel in the vault interface
* Modal window appears with prompt to enter Invite code and user name
* Topic joinprocessed, new topic added to the vault and results are displayed in the same modal window

##### 10. Admin logs into topic, joins the topic, creates new topic
* The same as regular user. The only difference is that there is 
    admin login record in his vault

##### 11. Admin resets his password
* From the manager

##### 12. Admin kicks a user out
* Admin logs into admin panel
* From the list of registered vaults user deletes or disables chose vault
* Disabled or deleted user is no longer able to use the vault

