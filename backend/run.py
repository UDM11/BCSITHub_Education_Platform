import uvicorn
import os

if __name__ == "__main__":
    # Ensure working directory is set to backend/ directory to find .env correctly
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    
    print("Starting FastAPI Uvicorn Server on http://localhost:8000")
    print("Swagger Documentation is available at http://localhost:8000/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
