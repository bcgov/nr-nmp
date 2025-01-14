# How to Debug

The backend can be easily debugged in VSCode with the following:

1. Ensure you have the Python and Python Debugger extensions installed in VSCode.
2. Add `breakpoint()` into the code wherever you'd like the debugger to pause.
3. In one terminal tab, run `docker compose up database`.
4. In a new terminal tab, run `docker compose -d up backend`. This will compose the backend in the background.
5. In the same terminal tab, run `docker attach {container id}`. You can find the container id in Docker Desktop. This command attaches stdin, stdout, and stderr to this terminal.
6. In VSCode, go to the "Run and Debug" tab. In the top bar, click the green triangle next to "Attach (remote debug)".
7. If debugging the API, run `docker compose up frontend` in a new terminal tab. Otherwise proceed to step 8.
8. Open the localhost website and initiate whatever flow you're debugging. The website should pause at the breakpoint, and in the attached terminal tab you'll see the Pdb (Python debugger) interface.
9. Debug away! (Pdb command guide at: https://docs.python.org/3/library/pdb.html#debugger-commands)

Note that this method of debugging relies on the `stdin_open` and `tty` being set to true in the docker-compose file.
