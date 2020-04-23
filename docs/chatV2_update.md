# Islands Chat v2.0 update instructions

## Important notes:
- It is recommended that you backup your old island before updating including all
the data. You will not be able to downgrade.

- Only one Island with the same data can run at a time, otherwise hidden services will
  not work properly.

## Update:
1. Backup your old island
2. Remove chat directory. It is located under /your/island/dir/apps/chat
3. Unzip chat.zip into /your/island/dir/apps
4. Start your island and login into your vault. On first login the vault will be
   converted to v2.0.0
5. All set.

## Vault import/export
You can import or export vaults using vaultMigration.js CLI tool which is located
under /your/island/dir/chat/islandMigration.js. It is available only in version
2.0.0, but can handle v1.x.x vaults.

You need to have node.js available to run it. You can use island's node.js in 
/you/island/dir/core/linux/bin/node

Run node islandMigration.js -h and follow the instructions from the help page.

