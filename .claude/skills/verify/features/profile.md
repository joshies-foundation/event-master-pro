# Profile

The profile tab shows the user's avatar, display name with an edit pencil, the Squidward Mode switch (if the user may toggle it), their login username, a button to enable push notifications, and Sign Out. A display name change shows up everywhere the player is named, including the home rankings.

## Sub-features

- `profile-display-name` changes the display name through a native prompt. Names over 16 characters are rejected with an alert.
- `profile-squidward` toggles Squidward Mode, which plays walking sounds on every touch.
- `profile-username` shows the login username (`colin`).
- `profile-avatar` uploads a new avatar image through a file picker.
- `profile-push` enables push notifications for this device.
- `profile-signout` signs out. See [auth.md](./auth.md).

## How to get to it (user POV)

- Profile tab in the footer.

## Driving it with emp-verify

Preconditions:

- Logged in as `colin`, whose display name is `Colin` and who may edit his profile.

- **Open.** Run `$V browser tap --role link --name Profile --within nav`, then `$V browser wait --text "Display Name:"`. `snapshot` shows `strong: "Display Name:"` followed by `Colin`.
- **Rename.** Arm the prompt with `$V browser dialog --value "Colin VRF"`, then tap the pencil with `$V browser tap --css "i.pi-pencil"`. The output shows `dialog.prompt Change display name -> accept Colin VRF`, and `$V browser wait --text "Colin VRF"` succeeds.
- **Second view.** Run `$V browser rest "/user?select=display_name&id=eq.be62a737-ed9f-4e88-8e74-ee8310131818" --path profile/after-rename.json`. It returns `[{"display_name": "Colin VRF"}]`. Then run `$V browser tap --role link --name Home --within nav`, `$V browser wait --role row --name "Colin VRF"`, and `$V browser snapshot --path profile/home-rankings.aria.txt`.
- **Too long.** Run `$V browser dialog --value "ThisNameIsWayTooLong"`, then tap the pencil. The output shows a `dialog.alert Oh really, your name is 20 characters long? ...`, and the name does not change.
- **Restore.** Run `$V browser dialog --value "Colin"`, tap the pencil, and confirm with `rest` that `display_name` is `Colin` again.
- **Squidward Mode.** `$V browser tap --role switch` flips it. Confirm with `rest "/user?select=squidward_mode&id=eq.be62a737-ed9f-4e88-8e74-ee8310131818"`, then tap again to restore `false`.
- **Proof.** Save `snapshot` and `screenshot` under `profile/` after the rename and after the restore.

## Gotchas

- The pencil is an icon without an accessible name. `--css "i.pi-pencil"` is the stable handle. When editing is not allowed, the pencil is grey with a red ✕ and does nothing.
- The prompt is native. If you forget `dialog --value`, the default answer accepts the current name, which the app ignores as unchanged.
- Other developers looking at TEST see the temporary name. Restore it in the same run.
- `Enable Push Notifications` needs a service worker, and dev builds do not register one. It cannot be verified with this harness.
- `App last updated: Dec 31, 1969` is normal in dev builds. The date is stamped only by `npm run build`.
- Avatar upload opens a native file picker, which `emp-verify` does not drive. Report it as unverified rather than faking the upload.
