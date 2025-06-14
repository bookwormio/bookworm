# Bookworm

### Installation



Before running, you need to install Xcode, homebrew, node, npx, and clone the repo

- Install Xcode and iOS simulator [here](https://developer.apple.com/documentation/safari-developer-tools/installing-xcode-and-simulators)

- Install Homebrew:
  ```
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
  - Pay attention during install and run the commands in the terminal it requires after the initial install
- Install Node:
  ```
  brew install node
  ```
- Install NPX:
  ```
  npm install -g npx
  ```
- Clone Project with SSH:
  ```
  git clone git@capstone-cs.eng.utah.edu:bookworm/bookworm.git
  ```
- Install npm dependencies (from within `/bookwork/` )
  ```
  npm install
  ```
- Install npm dependencies (from within `/bookwork/functions` )

  ```
  npm install
  ```

- Install the following extensions for visual studio code

1. ESLint
2. Prettier

### Running the Simulator

Now that everything is installed, the simulator can be ran

- Enter the BookWorm project folder inside the bookworm repo folder
  ```
  npx expo start
  ```
- To run the default iOS simulator, press i
- To select a different iOS device, press Shift and i

### Running the Recommendation API Locally:

[See instructions here to host API locally](https://capstone-cs.eng.utah.edu/bookworm/recommendation_engine/-/blob/main/README.md?ref_type=heads)

(NOTE: This MUST be running to use RecommendationQueries)

### Error starting simulator

If you encounter an error that looks like:

```
Error: xcrun exited with non-zero code: 60
An error was encountered processing the command (domain=NSPOSIXErrorDomain, code=60):
Unable to boot the Simulator.
launchd failed to respond.
Underlying error (domain=com.apple.SimLaunchHostService.RequestError, code=4):
        Failed to start launchd_sim: could not bind to session, launchd_sim may have crashed or quit responding
```

You can try this

- From the simulator window
- Device -> Erase all content and settings
- Restart simulator
