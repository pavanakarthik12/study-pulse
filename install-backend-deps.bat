@echo off
echo ============================================
echo Study Pulse - Installing Backend Dependencies
echo ============================================
echo.

cd backend

echo Installing Python dependencies...
pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo Installation completed successfully!
    echo ============================================
    echo.
    echo Next steps:
    echo 1. Create a .env file in the backend folder
    echo 2. Add your Spotify credentials to .env
    echo 3. Run 'python app.py' to start backend
    echo 4. In another terminal, run 'npm start' for frontend
    echo.
    echo See SPOTIFY_SETUP.md for detailed instructions
    echo.
) else (
    echo.
    echo ============================================
    echo Installation failed. Please check errors above.
    echo ============================================
)

pause
