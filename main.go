package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// ImageState represents the state of an image on the grid
type ImageState struct {
	Name  string `json:"name"`
	GridX int    `json:"gridX"`
	GridY int    `json:"gridY"`
	Angle int    `json:"angle"`
}

// Response represents the JSON response structure
type Response struct {
	Message string       `json:"message"`
	Data    []ImageState `json:"data"`
}

const (
	North byte = 1
	South byte = 2
	East  byte = 4
	West  byte = 8
)

// Connections is a bit block
//
//	1 .. North
//	2 .. South
//	4 .. East
//	8 .. West
type Block struct {
	Name        string
	Connections byte
}

func (b Block) HasConnection(conn byte) bool {
	if (b.Connections & conn) != 0 {
		return true
	}
	return false
}

var Blocks = []Block{
	Block{"straight", East & West},
	Block{"curve", South & West},
	Block{"turnoutleft", South & East & West},
	Block{"turnoutright", East & West},
	Block{"sensor-off", East & West},
	Block{"threeway", North & South & East & West},
}

// handleGridUpdate handles the POST request to /api/grid/update
func handleGridUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var imageStates []ImageState
	err := json.NewDecoder(r.Body).Decode(&imageStates)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Print the received data to the console
	fmt.Println("Received grid update:")
	for _, state := range imageStates {
		fmt.Printf("Name: %s, GridX: %d, GridY: %d, Angle: %d\n", state.Name, state.GridX, state.GridY, state.Angle)
	}

	// Create a response object
	response := Response{
		Message: "Grid update received",
		Data:    imageStates,
	}

	// Encode the response as JSON and send it
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func main() {
	// Define the directory to serve static files from
	fs := http.FileServer(http.Dir("./static"))

	// Handle all requests by serving static files
	http.Handle("/", fs)

	// Handle the /api/grid/update route
	http.HandleFunc("/api/grid/update", handleGridUpdate)

	// Start the web server on port 8080
	log.Println("Listening on :8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
