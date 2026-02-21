#!/bin/bash

# Get the absolute path to the folder where this script is located
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting XAMPP MySQL..."
sudo /opt/lampp/lampp startmysql

# Start Backend using the absolute path
echo "Starting Backend on port 5000..."
cd "$PROJECT_DIR/backend" && npm start &

# Start Frontend using the absolute path (prevents "No such file" error)
echo "Starting Frontend on port 3000..."
cd "$PROJECT_DIR/frontend" && npm start &

# Handle Ctrl+C to kill all background processes at once
trap "kill 0" EXIT

# Keep logs visible
wait

