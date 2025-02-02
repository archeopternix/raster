package main

import (
	"log"
	"net/http"
)

func main() {
	// Define the directory to serve static files from
	fs := http.FileServer(http.Dir("./static"))

	// Handle all requests by serving static files
	http.Handle("/", fs)

	// Start the web server on port 8080
	log.Println("Listening on :8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
