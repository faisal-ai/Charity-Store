#!/bin/bash
# Simple script to start the local development server

echo "Starting Hearts & Threads Charity Store Server..."
echo "Server will be available at: http://localhost:8000"
echo "Admin panel at: http://localhost:8000/admin/login.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
python3 -m http.server 8000
