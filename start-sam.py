import subprocess
import signal
import sys

# Function to handle cleanup on exit
def cleanup():
    print("Cleaning up all Docker containers except the DynamoDB container...")

    try:
        # Get the list of all container IDs and their names
        container_info = subprocess.check_output([
            "docker", "ps", "--format", "{{.ID}} {{.Names}}"
        ]).decode().strip().split("\n")
        dynamodb_container_name = "local-dynamodb"

        # Iterate over the containers and remove all except DynamoDB
        for info in container_info:
            if not info.strip():
                continue
            container_id, container_name = info.split()

            # Skip the DynamoDB container
            if container_name == dynamodb_container_name:
                print(f"Skipping DynamoDB container: {container_name} ({container_id})")
                continue

            # Stop and remove all other containers
            try:
                print(f"Stopping container {container_name} ({container_id})...")
                subprocess.run(["docker", "stop", container_id], check=True)

                print(f"Removing container {container_name} ({container_id})...")
                subprocess.run(["docker", "rm", container_id], check=True)
            except subprocess.CalledProcessError as e:
                print(f"Error stopping/removing container {container_name} ({container_id}): {e}")

    except subprocess.CalledProcessError as e:
        print(f"Error cleaning up containers: {e}")

    print("Cleanup complete.")

# Handle exit with Ctrl+C
def signal_handler(sig, frame):
    print("\nExiting... Cleaning up...")
    cleanup()
    sys.exit(0)

# Attach the signal handler to SIGINT (Ctrl+C)
signal.signal(signal.SIGINT, signal_handler)

# Provide the full path to the SAM CLI batch script (sam.cmd)
sam_path = r"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd"  # Correct path to the .cmd file

# Run SAM Local Start API
try:
    print("Starting SAM Local API...")
    # Remove the unsupported --cors flag
    subprocess.run([sam_path, "local", "start-api"], check=True)
except subprocess.CalledProcessError as e:
    print(f"Error running SAM Local API: {e}")
    cleanup()
