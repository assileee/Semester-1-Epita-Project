HELLO, these are the steps to make this project work on your device !

## First, Create a Conda Environment
```
conda create --name your_environment_name python=3.8.x
```
## Now Activate Conda Environment
```
conda activate your_environment_name
```
## Install Python Packages
```
pip install -r requirements.txt
```
## Now Run the Python Application
```
python app.py
```

## Serve the Front End
Navigate to Views/Home/index.html.
Use a local server or a live-server extension to serve the front-end.

### Small Example using Python's HTTP server:
```
python -m http.server
```

### Example using live-server extension:
Install the extension if not already installed.
Navigate to the project directory in the terminal.
Run the following command:
live-server Views/Home/

## Finally, Sample Run
Before running 
```
python app.py
```

Put in the database information in a .env file on the root directory and fill the correct values
```
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=root
DB_PASSWORD=
```



THANKS ! AND HOPE IT WORKED !# Semester-1-Epita-Project
