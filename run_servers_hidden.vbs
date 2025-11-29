' Run start_servers.bat completely hidden (no console window)

Dim fso, scriptDir, cmd
Set fso = CreateObject("Scripting.FileSystemObject")

' Folder where this .vbs is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Command to run the batch
cmd = "cmd /c """ & scriptDir & "\start_servers.bat"""

' 0 = hidden window, False = don't wait (run in background)
CreateObject("WScript.Shell").Run cmd, 0, False
