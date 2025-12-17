#!/usr/bin/osascript

-- Get password from macOS Keychain
set vpnPassword to do shell script "security find-generic-password -s 'sky-vpn' -a 'tom.muldoon@sky.uk' -w"

tell application "Cisco Secure Client"
	activate
end tell

delay 0.5

tell application "System Events"
	tell process "Cisco Secure Client"
		-- Wait for window to appear (window 2 is the main window, window 1 is menu bar)
		repeat until exists window 2
			delay 0.1
		end repeat

		-- Check if already connected (Disconnect button exists)
		try
			if exists button "Disconnect" of window 2 then
				return -- Exit script, already connected
			end if
		end try

		-- Click the Connect button
		try
			click button "Connect" of window 2
		on error
			-- If already showing username field, skip to typing
		end try

		delay 3

		-- Type the username
		keystroke "tom.muldoon@sky.uk"

		-- Press return to submit username
		keystroke return

		delay 2

		-- Type the password from environment variable
		keystroke vpnPassword

		-- Press return to submit password
		keystroke return

		-- Wait for Accept button to appear and click it
		set maxWaitTime to 30 -- Maximum wait time in seconds
		set waitCounter to 0
		repeat until waitCounter ≥ maxWaitTime
			try
				if exists button "Accept" of window 2 then
					click button "Accept" of window 2
					exit repeat
				end if
			end try
			delay 0.5
			set waitCounter to waitCounter + 0.5
		end repeat

	end tell
end tell
